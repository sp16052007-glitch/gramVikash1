import React from 'react';
import {
  PlusCircle,
  Mic,
  Compass,
  FileText,
  Clock,
  CheckCircle2,
  ThumbsUp,
  AlertCircle,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Complaint, Petition } from '../types';
import { ComplaintCard } from '../components/ComplaintCard';
import { PetitionCard } from '../components/PetitionCard';

interface CitizenDashboardProps {
  complaints: Complaint[];
  petitions: Petition[];
  onSelectComplaint: (complaint: Complaint) => void;
  onSelectPetition: (petition: Petition) => void;
  onNavigate: (tab: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  complaints,
  petitions,
  onSelectComplaint,
  onSelectPetition,
  onNavigate,
}) => {
  const { currentUser } = useAuth();

  const myComplaints = complaints.filter(
    (c) => c.userId === currentUser?.id || c.creatorName === currentUser?.fullName
  );
  const mySupportedComplaints = complaints.filter(
    (c) => currentUser && c.supporterIds?.includes(currentUser.id)
  );
  const myPetitions = petitions.filter(
    (p) => currentUser && (p.userId === currentUser.id || p.supporterIds.includes(currentUser.id))
  );

  const pendingCount = myComplaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgressCount = myComplaints.filter((c) => c.status === 'In Progress' || c.status === 'Verified').length;
  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GramVikas Citizen Portal (नागरिक पोर्टल)</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Namaste, {currentUser?.fullName || 'Ramesh Patel'} 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Resident of <strong>{currentUser?.village || 'Rampur Gram Panchayat'}</strong>, {currentUser?.district || 'Varanasi'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('report')}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report New Problem (शिकायत दर्ज करें)</span>
            </button>
            <button
              onClick={() => onNavigate('petitions')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-teal-300" />
              <span>Village Petitions</span>
            </button>
          </div>
        </div>

        {/* Live Admin Link Badge */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span><strong>Direct Admin Pipeline:</strong> Grievances filed here stream directly to District Collector Rajesh Sharma & PWD Engineers.</span>
          </div>
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="text-[11px] font-bold text-emerald-300 hover:text-white underline cursor-pointer"
          >
            Switch to Admin Command Center →
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Filed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Grievances</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-3xl text-slate-900">{myComplaints.length}</div>
          <div className="text-[11px] text-slate-500">Filed by you in this panchayat</div>
        </div>

        {/* Pending & Under Review */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Under Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-3xl text-amber-600">{pendingCount}</div>
          <div className="text-[11px] text-slate-500">Awaiting department triage</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-3xl text-blue-600">{inProgressCount}</div>
          <div className="text-[11px] text-slate-500">Active field repairs under way</div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-3xl text-emerald-600">{resolvedCount}</div>
          <div className="text-[11px] text-slate-500">Completed with verification</div>
        </div>
      </div>

      {/* My Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl text-slate-900">
            My Submitted Grievances ({myComplaints.length})
          </h2>
          <button
            onClick={() => onNavigate('report')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>+ Report Another Issue</span>
          </button>
        </div>

        {myComplaints.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
            <p className="text-xs text-slate-500">You haven't reported any grievances yet.</p>
            <button
              onClick={() => onNavigate('report')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Report Your First Problem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myComplaints.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                onSelect={onSelectComplaint}
              />
            ))}
          </div>
        )}
      </div>

      {/* Petitions You Supported */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl text-slate-900">
            Community Petitions You Backed ({myPetitions.length})
          </h2>
          <button
            onClick={() => onNavigate('petitions')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All Petitions →</span>
          </button>
        </div>

        {myPetitions.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-xs text-slate-500">
            You haven't signed any village petitions yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPetitions.map((p) => (
              <PetitionCard
                key={p.id}
                petition={p}
                onSelect={onSelectPetition}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
