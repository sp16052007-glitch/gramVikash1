import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  ThumbsUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Volume2,
  Play,
  Pause,
  Share2,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  Hammer,
  FileText,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { StatusTimeline } from '../components/StatusTimeline';
import { getCategoryIcon, getStatusBadgeStyle } from '../components/ComplaintCard';
import { Complaint, Comment } from '../types';
import { useAuth } from '../context/AuthContext';

interface ComplaintDetailsPageProps {
  complaint: Complaint;
  onBack: () => void;
  onNavigateToPetitionCreate?: (title: string, category: string, village: string) => void;
}

export const ComplaintDetailsPage: React.FC<ComplaintDetailsPageProps> = ({
  complaint: initialComplaint,
  onBack,
  onNavigateToPetitionCreate,
}) => {
  const { currentUser } = useAuth();
  const [complaint, setComplaint] = useState<Complaint>(initialComplaint);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [supporters, setSupporters] = useState(initialComplaint.supportersCount);
  const [isSupported, setIsSupported] = useState(
    currentUser ? initialComplaint.supporterIds?.includes(currentUser.id) : false
  );
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/comments`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [complaint.id]);

  const handleToggleSupport = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/support`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSupporters(data.supportersCount);
        setIsSupported(data.isSupported);
      }
    } catch (err) {
      console.error('Support error:', err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const currentImage = complaint.images?.[activePhotoIndex] || complaint.images?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Back Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Issues</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
            ID: #{complaint.id}
          </span>
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${getStatusBadgeStyle(complaint.status)}`}>
            {complaint.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Left Column: Media & Story & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Title Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                {getCategoryIcon(complaint.category)}
                <span>{complaint.category}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {complaint.village}, {complaint.district}, {complaint.state}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-950 leading-tight">
              {complaint.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Reported by: <strong>{complaint.creatorName}</strong></span>
              <span>•</span>
              <span>Date: {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Photo Gallery & Evidence */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Photo Evidence ({complaint.images.length} Image{complaint.images.length > 1 ? 's' : ''})
              </h3>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded-md">
                Verified Incident Proof
              </span>
            </div>

            {/* Big Active Image */}
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-900 shadow-md">
              <img
                src={currentImage}
                alt={complaint.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                Evidence View #{activePhotoIndex + 1}
              </div>
            </div>

            {/* Thumbnail selector */}
            {complaint.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {complaint.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      activePhotoIndex === idx ? 'border-emerald-600 scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Audio Evidence Player (If submitted) */}
          {complaint.audioUrl && (
            <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-5 border border-emerald-700/50 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Voice Audio Grievance (Original Dialect)</h4>
                    <span className="text-[10px] text-emerald-300">Spoken in native village language</span>
                  </div>
                </div>

                <button
                  onClick={toggleAudio}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'Pause Voice' : 'Listen to Citizen'}</span>
                </button>

                <audio
                  ref={audioRef}
                  src={complaint.audioUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="hidden"
                />
              </div>

              {complaint.audioTranscript && (
                <div className="p-3 bg-white/10 rounded-2xl text-xs text-slate-200 border border-white/10 italic">
                  "{complaint.audioTranscript}"
                </div>
              )}
            </div>
          )}

          {/* Problem Narrative & Description */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Citizen Description & Ground Report
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Status Stepper & Progress History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Official Resolution Timeline
            </h3>
            <StatusTimeline
              currentStatus={complaint.status}
              statusHistory={complaint.statusHistory}
            />
          </div>

          {/* Public Citizen Discussion Thread */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Community Discussion & Field Updates ({comments.length})</span>
              </h3>
            </div>

            {/* Post Comment Form */}
            {currentUser ? (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share a ground update or support message..."
                  className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
                Sign in to post a community comment or ground update.
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 divide-y divide-slate-100">
              {comments.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No comments yet. Be the first to add context.
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {c.userName}
                        {c.userRole === 'government' && (
                          <span className="text-[10px] text-blue-700 bg-blue-50 font-bold px-1.5 py-0.2 rounded">Govt Officer</span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: AI Intelligence & Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Community Support Action Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Citizen Backing</div>
              <div className="font-display font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                <ThumbsUp className="w-6 h-6 text-emerald-600" />
                <span>{supporters} Villagers Supporting</span>
              </div>
            </div>

            <button
              onClick={handleToggleSupport}
              className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                isSupported
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isSupported ? 'fill-white' : ''}`} />
              <span>{isSupported ? 'You Supported This Issue' : 'Support This Grievance'}</span>
            </button>

            {onNavigateToPetitionCreate && (
              <button
                onClick={() =>
                  onNavigateToPetitionCreate(
                    complaint.title,
                    complaint.category,
                    complaint.village
                  )
                }
                className="w-full py-2.5 rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Elevate to Village Petition</span>
              </button>
            )}
          </div>

          {/* AI Triage & Analysis Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-emerald-950">GramVikas AI Triage</h4>
                <span className="text-[10px] text-emerald-700">Automated Grievance Classification</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Executive Summary</span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {complaint.aiSummary || 'Detailed rural infrastructure damage requiring immediate department inspection.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] font-bold text-slate-500 block">Assigned Dept</span>
                  <span className="font-extrabold text-slate-900">{complaint.departmentAssigned}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] font-bold text-slate-500 block">Priority Level</span>
                  <span className="font-extrabold text-rose-700">{complaint.priority}</span>
                </div>
              </div>

              {complaint.formalLetter && (
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Formal Bureaucratic Draft</span>
                  <p className="text-slate-700 text-[11px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line">
                    {complaint.formalLetter}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Field Department Information */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Jurisdiction & Office</span>
            </h4>
            <div className="text-xs text-slate-600 space-y-1.5">
              <div><strong>Nodal Officer:</strong> Executive Engineer ({complaint.departmentAssigned})</div>
              <div><strong>Division:</strong> {complaint.district} Rural Sub-division</div>
              <div><strong>State:</strong> {complaint.state}</div>
              <div><strong>Citizen Helpline:</strong> 1800-180-5145</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
