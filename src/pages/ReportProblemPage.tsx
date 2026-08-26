import React, { useState } from 'react';
import {
  Mic,
  Camera,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Clock,
  RotateCcw,
  Building,
  Volume2,
  Droplets,
  Zap,
  Hammer,
  HeartPulse,
  GraduationCap,
  Layers,
  Crosshair,
  ShieldCheck,
  Users,
  Flame,
} from 'lucide-react';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { PhotoUploader } from '../components/PhotoUploader';
import { LocationPicker } from '../components/LocationPicker';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintCategory, ComplaintPriority } from '../types';

interface ReportProblemPageProps {
  onSuccess: (complaint: Complaint) => void;
  onNavigate: (tab: string) => void;
}

const CATEGORIES: { id: ComplaintCategory; label: string; icon: any; color: string; desc: string }[] = [
  { id: 'Roads', label: 'Roads & Bridges', icon: Hammer, color: 'hover:border-amber-400', desc: 'Potholes, broken culverts, dirt roads' },
  { id: 'Water', label: 'Water & Pumps', icon: Droplets, color: 'hover:border-blue-400', desc: 'Handpump failure, contaminated water' },
  { id: 'Electricity', label: 'Electricity & Grid', icon: Zap, color: 'hover:border-yellow-400', desc: 'Transformer burnt, low voltage, wires' },
  { id: 'Drainage', label: 'Drainage & Waste', icon: Layers, color: 'hover:border-emerald-400', desc: 'Clogged drains, pond overflow, flooding' },
  { id: 'Healthcare', label: 'Health Clinic / PHC', icon: HeartPulse, color: 'hover:border-rose-400', desc: 'No doctor, lack of medicines, vaccine' },
  { id: 'Education', label: 'Village Schools', icon: GraduationCap, color: 'hover:border-indigo-400', desc: 'Broken roof, no teacher, mid-day meal' },
  { id: 'Sanitation', label: 'Sanitation & Toilets', icon: Building, color: 'hover:border-teal-400', desc: 'Garbage dump, community toilet repairs' },
  { id: 'Other', label: 'Other Grievance', icon: FileText, color: 'hover:border-slate-400', desc: 'Ration shop, pensions, land records' },
];

export const ReportProblemPage: React.FC<ReportProblemPageProps> = ({
  onSuccess,
  onNavigate,
}) => {
  const { currentUser } = useAuth();

  // Form State - Single Page Layout
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Roads');
  const [inputMode, setInputMode] = useState<'both' | 'voice' | 'text'>('both');
  const [description, setDescription] = useState('');
  const [voiceData, setVoiceData] = useState<{
    audioBase64: string;
    audioMimeType: string;
    audioUrl: string;
    durationSeconds: number;
    language: string;
  } | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState('Hindi');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  ]);
  const [priority, setPriority] = useState<ComplaintPriority>('High');
  const [allowCommunityPetition, setAllowCommunityPetition] = useState(true);

  // Incident Location State
  const [location, setLocation] = useState({
    state: currentUser?.state || 'Uttar Pradesh',
    district: currentUser?.district || 'Varanasi',
    village: currentUser?.village || 'Rampur Gram Panchayat',
    landmark: 'Near Primary School & Main Handpump',
    latitude: 25.3176,
    longitude: 82.9739,
  });

  // AI Pre-processing State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiDraft, setAiDraft] = useState<{
    title?: string;
    category?: ComplaintCategory;
    summary?: string;
    formalLetter?: string;
    department?: string;
    priority?: string;
    keyIssues?: string[];
  } | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Live Validations
  const hasValidTitle = title.trim().length >= 3;
  const hasValidContent = description.trim().length >= 5 || voiceData !== null;
  const hasValidImages = images.length > 0;
  const hasValidLocation = location.village.trim().length >= 2;

  const handleVoiceRecorded = (data: any) => {
    setVoiceData(data);
    setErrorMsg(null);
  };

  const handleClearVoice = () => {
    setVoiceData(null);
  };

  const handleGenerateAiDraft = async () => {
    if (!description && !voiceData) {
      setErrorMsg('Please write a brief note or speak into the microphone first so AI can draft your official grievance.');
      return;
    }

    setIsAiProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/process-voice-or-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: description || undefined,
          audioBase64: voiceData?.audioBase64,
          audioMimeType: voiceData?.audioMimeType,
          preferredLanguage: voiceLanguage,
        }),
      });

      const data = await res.json();
      if (data.formalGrievanceDraft) {
        setAiDraft({
          title: data.executiveSummary || `Urgent ${data.category || category} Issue in ${location.village}`,
          category: data.category as ComplaintCategory,
          summary: data.executiveSummary,
          formalLetter: data.formalGrievanceDraft,
          department: data.responsibleDepartment,
          priority: data.priority,
          keyIssues: data.keyIssues,
        });

        if (data.category) setCategory(data.category as ComplaintCategory);
        if (data.executiveSummary && !title) setTitle(data.executiveSummary.slice(0, 75));
      }
    } catch (err) {
      console.error('AI draft error:', err);
      setErrorMsg('Unable to generate AI draft right now. You can proceed with your written description.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const applyAiFormalLetter = () => {
    if (aiDraft?.formalLetter) {
      setDescription(aiDraft.formalLetter);
    }
  };

  const handleSubmitGrievance = async () => {
    // 1. Mandatory Photo Evidence check
    if (!hasValidImages) {
      setErrorMsg('Mandatory Photo Evidence Missing: Government protocols require at least 1 genuine photo of the site.');
      window.scrollTo({ top: 500, behavior: 'smooth' });
      return;
    }

    // 2. Mandatory Voice or Description check
    if (!hasValidContent) {
      setErrorMsg('Mandatory Grievance Details Missing: Please write a description or record a voice note.');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    // 3. Title fallback
    const finalTitle = title.trim() || `${category} Repair Request at ${location.village}`;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          category,
          description: description.trim(),
          audioUrl: voiceData?.audioUrl,
          audioTranscript: voiceData ? `[Audio in ${voiceLanguage}] Problem reported from ${location.village}` : undefined,
          audioLanguage: voiceLanguage,
          images,
          state: location.state,
          district: location.district,
          village: location.village,
          landmark: location.landmark,
          latitude: location.latitude,
          longitude: location.longitude,
          priority,
          departmentAssigned: aiDraft?.department || `${category} & Public Works Department`,
          aiSummary: aiDraft?.summary,
          aiFormalDraft: aiDraft?.formalLetter,
        }),
      });

      const data = await res.json();
      if (data.success && data.complaint) {
        setSubmittedComplaint(data.complaint);
        onSuccess(data.complaint);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.error || 'Failed to submit grievance. Please verify inputs and try again.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg('Network error. Please check your connection and submit again.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedComplaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
              Grievance Successfully Registered
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              Your Village Problem is Now on Record
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Our AI has triaged your grievance and submitted it to the <strong className="text-slate-900">{submittedComplaint.departmentAssigned || 'Panchayati Raj & District Collectorate'}</strong>.
            </p>
          </div>

          {/* Ticket Information Card */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-medium">Tracking Grievance ID:</span>
              <span className="font-mono font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                #{submittedComplaint.id}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-medium">Location:</span>
              <span className="text-xs font-bold text-slate-800">
                {submittedComplaint.village}, {submittedComplaint.district}, {submittedComplaint.state}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-medium">Assigned Department:</span>
              <span className="text-xs font-bold text-slate-800">
                {submittedComplaint.departmentAssigned}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">SLA Resolution Target:</span>
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 7 Working Days
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="success-view-citizen-dashboard-btn"
              onClick={() => onNavigate('citizen-dashboard')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View in Citizen Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="success-view-admin-dashboard-btn"
              onClick={() => onNavigate('admin-dashboard')}
              className="w-full sm:w-auto px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View in District Admin Command</span>
            </button>

            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setTitle('');
                setDescription('');
                setImages(['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80']);
                setVoiceData(null);
                setAiDraft(null);
              }}
              className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Report Another</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Single-Page Citizen Grievance Portal (एकल पृष्ठ शिकायत फॉर्म)</span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Report a Village Problem
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Fill out all details in one straightforward form below. Attach authentic photos, speak or write your complaint, and pin the exact location for direct government action.
          </p>

          {/* Fast Status Indicators */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${category ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-slate-800 text-slate-400'}`}>
              <CheckCircle2 className="w-3 h-3" /> 1. Category Selected
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${hasValidContent ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'}`}>
              {hasValidContent ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-rose-400" />}
              2. Voice / Text
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${hasValidImages ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'}`}>
              {hasValidImages ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-rose-400" />}
              3. Photo Evidence ({images.length})
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${hasValidLocation ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-slate-800 text-slate-400'}`}>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              4. Location Pinned
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-semibold text-rose-700 flex items-center gap-3 animate-in fade-in duration-150">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: CATEGORY SELECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              1
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Grievance Category (समस्या की श्रेणी) *
              </h2>
              <p className="text-xs text-slate-500">
                Select the rural sector that best matches this problem.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {category} Selected
          </span>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                } ${cat.color}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${
                    isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{cat.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: TITLE, VOICE & WRITTEN DESCRIPTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              2
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Problem Details (Speak in Dialect or Type) *
              </h2>
              <p className="text-xs text-slate-500">
                You can record a voice audio note, type in Hindi/English, or use AI formal draft.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setInputMode('voice')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                inputMode === 'voice' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-rose-600" />
              <span>Voice</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                inputMode === 'text' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Text</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('both')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                inputMode === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <span>Both (Recommended)</span>
            </button>
          </div>
        </div>

        {/* Short Problem Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Short Problem Title (समस्या का मुख्य शीर्षक)
          </label>
          <input
            type="text"
            id="report-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g. Broken ${category} in ${location.village} causing waterlogging & accidents`}
            className="w-full text-xs sm:text-sm font-medium px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Voice Recording Box */}
        {(inputMode === 'voice' || inputMode === 'both') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-rose-600" />
                <span>Voice Recording in Regional Indian Dialect</span>
              </label>
              {voiceData && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Audio Attached ({voiceData.durationSeconds}s)
                </span>
              )}
            </div>
            <VoiceRecorder
              preferredLanguage={voiceLanguage}
              onLanguageChange={setVoiceLanguage}
              onAudioRecorded={handleVoiceRecorded}
              onClearAudio={handleClearVoice}
            />
          </div>
        )}

        {/* Written Description Textarea */}
        {(inputMode === 'text' || inputMode === 'both') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Written Explanation (लिखित विवरण)
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDraft}
                disabled={isAiProcessing}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>{isAiProcessing ? 'Drafting Official Petition...' : 'Ask AI to Formalize Draft'}</span>
              </button>
            </div>

            <textarea
              id="report-description-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is broken, how many families or school children are affected, and how long this issue has persisted..."
              className="w-full text-xs sm:text-sm font-medium p-4 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>
        )}

        {/* AI Formalized Draft Box */}
        {aiDraft && (
          <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>GramVikas AI Formal Government Petition Format</span>
              </div>
              <button
                type="button"
                onClick={applyAiFormalLetter}
                className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg shadow-2xs transition cursor-pointer"
              >
                Apply to Description
              </button>
            </div>
            <div className="text-xs text-slate-800 whitespace-pre-line bg-white/90 p-3.5 rounded-xl border border-emerald-200 max-h-48 overflow-y-auto leading-relaxed font-sans">
              {aiDraft.formalLetter}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-900 font-medium">
              <span>Department: <strong>{aiDraft.department}</strong></span>
              <span>•</span>
              <span>Priority Triage: <strong>{aiDraft.priority}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: MANDATORY PHOTO EVIDENCE */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              3
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 flex items-center gap-1.5">
                <span>Photo Evidence Proof (फोटो प्रमाण)</span>
                <span className="text-rose-600 font-black">*</span>
              </h2>
              <p className="text-xs text-slate-500">
                Government rules require at least 1 authentic photograph of the broken infrastructure.
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${images.length > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'}`}>
            {images.length > 0 ? `${images.length} Photo(s) Attached` : 'Photo Required'}
          </span>
        </div>

        <PhotoUploader
          images={images}
          onImagesChange={(imgs) => {
            setImages(imgs);
            setErrorMsg(null);
          }}
          required={true}
        />
      </div>

      {/* SECTION 4: DEDICATED INCIDENT LOCATION PORTION (स्थान व ग्राम पंचायत चयन) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              4
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 flex items-center gap-1.5">
                <span>Incident Location & Panchayat Pin (स्थान व ग्राम पंचायत)</span>
                <span className="text-emerald-700 font-black">*</span>
              </h2>
              <p className="text-xs text-slate-500">
                Pin your village location, specify landmarks, and auto-route to district administration.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {location.village}, {location.district}
          </span>
        </div>

        {/* Location Picker with Map & GPS */}
        <LocationPicker
          state={location.state}
          district={location.district}
          village={location.village}
          landmark={location.landmark}
          latitude={location.latitude}
          longitude={location.longitude}
          onLocationChange={(loc) => setLocation(loc)}
        />
      </div>

      {/* SECTION 5: URGENCY & COMMUNITY PETITION PREFERENCE */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
            5
          </div>
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">
              Urgency & Community Petition Support (प्राथमिकता व जन-समर्थन)
            </h2>
            <p className="text-xs text-slate-500">
              Specify priority level and enable villagers to co-sign your grievance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Priority Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Urgency Level (प्राथमिकता स्तर)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High', 'Critical'] as ComplaintPriority[]).slice(1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    priority === p
                      ? p === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : p === 'High'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p === 'Critical' ? '🚨 Critical' : p === 'High' ? '⚡ High' : 'Normal'}
                </button>
              ))}
            </div>
          </div>

          {/* Community Petition Toggle */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enable Community Village Signatures</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Allows nearby villagers to upvote and add their voices.
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowCommunityPetition}
              onChange={(e) => setAllowCommunityPetition(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* FINAL SUBMIT BAR - 1-CLICK INSTANT ACTION */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready for Direct Submission to Collectorate</span>
          </div>
          <div className="text-xs text-slate-300">
            Category: <strong>{category}</strong> • Location: <strong>{location.village}, {location.district}</strong> • Photos: <strong>{images.length} Evidence Photo(s)</strong>
          </div>
        </div>

        <button
          type="button"
          id="submit-grievance-btn"
          disabled={submitting}
          onClick={handleSubmitGrievance}
          className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>{submitting ? 'Submitting to District Administration...' : 'Submit Grievance Now (शिकायत दर्ज करें)'}</span>
        </button>
      </div>
    </div>
  );
};

