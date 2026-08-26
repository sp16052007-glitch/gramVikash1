import React from 'react';
import {
  PlusCircle,
  Compass,
  Mic,
  Camera,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Award,
  HeartHandshake,
  Clock,
  Shield,
  Briefcase,
  UserCheck,
  FileText,
} from 'lucide-react';
import { HeroVisual } from '../components/HeroVisual';
import { ComplaintCard } from '../components/ComplaintCard';
import { PetitionCard } from '../components/PetitionCard';
import { Complaint, Petition, PlatformStats } from '../types';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onSelectPetition: (petition: Petition) => void;
  complaints: Complaint[];
  petitions: Petition[];
  stats: PlatformStats | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectComplaint,
  onSelectPetition,
  complaints,
  petitions,
  stats,
}) => {
  const { allUsers, switchUser } = useAuth();
  const recentComplaints = complaints.slice(0, 3);
  const activePetitions = petitions.slice(0, 2);

  const handleSelectCitizenRole = async () => {
    const citizen = allUsers.find((u) => u.role === 'citizen') || allUsers[0];
    if (citizen) {
      await switchUser(citizen.id);
    }
    onNavigate('citizen-dashboard');
  };

  const handleSelectAdminRole = async () => {
    const admin = allUsers.find((u) => u.role === 'admin') || allUsers.find((u) => u.role === 'government') || allUsers[0];
    if (admin) {
      await switchUser(admin.id);
    }
    onNavigate('admin-dashboard');
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Next-Gen Rural Citizen Grievance Engine</span>
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-950 tracking-tight leading-[1.1]">
                Turn Local Problems Into <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">Real Change</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                GramVikas gives every citizen a simple way to report problems, raise their voice and bring their community together — with instant automated routing to District Collectors and Executive Engineers.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="hero-report-btn"
                  onClick={() => onNavigate('report')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/25 hover:scale-102 transition flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Report a Problem (नागरिक शिकायत)</span>
                </button>

                <button
                  id="hero-explore-btn"
                  onClick={() => onNavigate('explore')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-2xl font-bold text-sm shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Compass className="w-5 h-5 text-emerald-600" />
                  <span>Explore Village Map</span>
                </button>
              </div>

              {/* Value Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 leading-tight">
                    Voice in 12+ Dialects
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 leading-tight">
                    Mandatory Photo Proof
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 leading-tight">
                    Gemini AI Triage
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Illustration */}
            <div className="lg:col-span-5">
              <HeroVisual
                onExploreClick={() => onNavigate('explore')}
                onReportClick={() => onNavigate('report')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. DUAL ROLE ENTRY GATEWAY (CITIZEN vs ADMIN) */}
      <section id="role-selection-portal" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Select Your Portal / अपनी भूमिका चुनें</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Choose How You Want to Access GramVikas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Complaints submitted by citizens in the Citizen Portal flow directly into the District Admin Command Center in real time.
            </p>
          </div>

          {/* 2 Role Choice Cards */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* CITIZEN PORTAL CARD */}
            <div className="bg-slate-800/90 hover:bg-slate-800 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition group shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30">
                    For Rural Citizens & SHGs
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-emerald-300 transition">
                    Citizen Portal (ग्रामीण नागरिक)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    For villagers, farmers, and community leaders to file issues and demand public accountability.
                  </p>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2.5 pt-2 text-xs text-slate-300 border-t border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Report with <strong>Voice in 12+ Dialects</strong> & Camera Proof</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Track <strong>Live Timeline Status</strong> & SLA timers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Join <strong>Village Petitions</strong> & upvote community needs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Receive <strong>Official notes & resolution proof photos</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 space-y-2">
                <button
                  id="portal-select-citizen-btn"
                  onClick={handleSelectCitizenRole}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Enter as Citizen (नागरिक प्रवेश)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <div className="text-center">
                  <button
                    onClick={() => onNavigate('report')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold hover:underline cursor-pointer"
                  >
                    + Or directly file a new voice complaint
                  </button>
                </div>
              </div>
            </div>

            {/* ADMIN / DISTRICT COLLECTOR CARD */}
            <div className="bg-slate-800/90 hover:bg-slate-800 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition group shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
                    <Shield className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">
                    For DM, PWD & Engineers
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-amber-300 transition">
                    Admin & Officer Command (ज़िला प्रशासन)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    For District Collectors, SDMs, and Executive Engineers to triage, budget, and resolve grievances.
                  </p>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2.5 pt-2 text-xs text-slate-300 border-t border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Live Citizen Inbox</strong> with real-time audio playback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Gemini AI Auto-Triage</strong> (severity, dept & budget estimate)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Assign to <strong>PWD, Jal Nigam, Electricity & Health</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Upload <strong>Field Resolution Proof Photos</strong> to close tickets</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 space-y-2">
                <button
                  id="portal-select-admin-btn"
                  onClick={handleSelectAdminRole}
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Enter as District Admin (प्रशासन प्रवेश)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <div className="text-center">
                  <button
                    onClick={() => onNavigate('govt-dashboard')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold hover:underline cursor-pointer"
                  >
                    Or open PWD Field Engineer Desk
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Real-time sync highlight banner */}
          <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span><strong>Real-Time Data Pipeline:</strong> Citizen submissions are immediately available in the Admin console for instant triage and status updates.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                Go to Detailed Login / OTP Page →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMPACT STATS BANNER */}
      <section className="bg-slate-900 text-white py-10 rounded-3xl mx-4 sm:mx-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-400">
                {stats?.resolvedCount ? `${stats.resolvedCount * 120 + 840}+` : '890+'}
              </div>
              <div className="text-xs text-slate-300 font-medium">Village Grievances Resolved</div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                {stats?.activeVillages || '142'}+
              </div>
              <div className="text-xs text-slate-300 font-medium">Gram Panchayats Active</div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-teal-400">
                {stats?.activePetitions ? `${stats.activePetitions * 350 + 1200}+` : '2,400+'}
              </div>
              <div className="text-xs text-slate-300 font-medium">Citizen Petition Signatures</div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-amber-400">
                {stats?.avgResolutionDays ? `${stats.avgResolutionDays} Days` : '6.4 Days'}
              </div>
              <div className="text-xs text-slate-300 font-medium">Avg Government SLA Turnaround</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL-TIME DATA PIPELINE: HOW CITIZEN DATA FLOWS TO ADMIN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Transparent Data Architecture
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900">
            How Data Flows from Citizen to Administration
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every complaint logged in the village flows automatically through our AI-assisted civic triage pipeline directly to government decision-makers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg">
              1
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Citizen Side</div>
            <h3 className="font-display font-bold text-base text-slate-900">1. Citizen Files Grievance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizen speaks in regional dialect, attaches photo proof, and auto-tags GPS coordinates.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg">
              2
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">AI Intelligence</div>
            <h3 className="font-display font-bold text-base text-slate-900">2. Real-Time AI Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini extracts key issues, classifies urgency (High/Med), drafts formal letters, and routes to PWD/Jal Nigam.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-lg">
              3
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Admin Side</div>
            <h3 className="font-display font-bold text-base text-slate-900">3. Admin Live Command</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              District Collector & Engineers review complaints on live feed, verify funds, and dispatch field crews.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-lg">
              4
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Full Closure</div>
            <h3 className="font-display font-bold text-base text-slate-900">4. Proof & Resolution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Officers upload completion photos, status switches to 'Resolved', and citizen dashboard reflects live fix.
            </p>
          </div>
        </div>
      </section>

      {/* 4. RECENT COMMUNITY GRIEVANCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live Village Feed</div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-0.5">
              Recent Grievances Under Action
            </h2>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition"
          >
            <span>Explore All {complaints.length} Grievances</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentComplaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onSelect={onSelectComplaint}
            />
          ))}
        </div>
      </section>

      {/* 5. ACTIVE COMMUNITY PETITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Collective Village Voice</div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-0.5">
              High-Impact Community Petitions
            </h2>
          </div>

          <button
            onClick={() => onNavigate('petitions')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition"
          >
            <span>View All Petitions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activePetitions.map((p) => (
            <PetitionCard
              key={p.id}
              petition={p}
              onSelect={onSelectPetition}
            />
          ))}
        </div>
      </section>

      {/* 6. BOTTOM ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl leading-tight">
              Ready to fix a problem in your Panchayat?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal">
              Take 60 seconds to speak your grievance or click a photo. GramVikas AI will draft the official petition and alert district administrators immediately.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('report')}
                className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition cursor-pointer"
              >
                File Voice or Photo Grievance Now
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-6 py-3 bg-emerald-950/60 hover:bg-emerald-950/80 text-white border border-emerald-300/40 rounded-2xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Citizen / Official Login Portal</span>
              </button>
              <button
                onClick={() => onNavigate('map')}
                className="px-6 py-3 bg-emerald-900/40 hover:bg-emerald-900/60 text-white border border-emerald-300/40 rounded-2xl font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                View Community Map
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
