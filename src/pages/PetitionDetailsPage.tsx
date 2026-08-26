import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Heart,
  Share2,
  Award,
  Sparkles,
  MessageSquareQuote,
  ShieldCheck,
  Send,
  Building,
} from 'lucide-react';
import { Petition } from '../types';
import { useAuth } from '../context/AuthContext';

interface PetitionDetailsPageProps {
  petition: Petition;
  onBack: () => void;
  onRefresh: () => void;
}

export const PetitionDetailsPage: React.FC<PetitionDetailsPageProps> = ({
  petition: initialPetition,
  onBack,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const [petition, setPetition] = useState<Petition>(initialPetition);
  const [comment, setComment] = useState('');
  const [signing, setSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(
    currentUser ? initialPetition.supporterIds.includes(currentUser.id) : false
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const progressPercent = Math.min(100, Math.round((petition.currentSupporters / petition.targetGoal) * 100));

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSigning(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/petitions/${petition.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success && data.petition) {
        setPetition(data.petition);
        setHasSigned(true);
        setComment('');
        onRefresh();
      } else {
        setErrorMsg(data.error || 'Failed to sign petition.');
      }
    } catch (err) {
      console.error('Sign error:', err);
      setErrorMsg('Network error.');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Back Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Petitions</span>
        </button>

        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${
          petition.status === 'Goal Reached' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
        }`}>
          {petition.status}
        </span>
      </div>

      {/* Goal Reached District Notice Banner */}
      {petition.currentSupporters >= petition.targetGoal && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 p-4 sm:p-5 rounded-3xl shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm sm:text-base">
                Signature Goal Achieved! Elevated to District Collectorate
              </h3>
              <p className="text-xs text-slate-900 font-medium">
                This petition has met its {petition.targetGoal} village signatures quota and is pending official District Magistrate review.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Petition Narrative Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md font-bold">
                {petition.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {petition.village}, {petition.district}, {petition.state}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-950 leading-tight">
              {petition.title}
            </h1>

            <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-2">
              <span>Initiated by <strong>{petition.creatorName}</strong></span>
              <span>•</span>
              <span>Targeting: District Collector & Panchayati Raj Dept</span>
            </div>
          </div>

          {/* Photo */}
          <div className="relative aspect-16/9 rounded-3xl overflow-hidden bg-slate-900 shadow-md">
            <img
              src={petition.photoUrl}
              alt={petition.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Story */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              The Petition Story & Demand
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {petition.story}
            </p>
          </div>

          {/* Supporters & Testimonials List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Recent Villager Signatures & Testimonials ({petition.recentSupporters?.length || 0})</span>
              </h3>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              {petition.recentSupporters?.map((s, idx) => (
                <div key={idx} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{s.userName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.signedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {s.comment && (
                    <p className="text-xs text-slate-600 italic bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                      "{s.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Action Sidebar: Sign Petition */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 sticky top-24">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Petition Progress</div>
              <div className="font-display font-extrabold text-2xl text-slate-900 flex items-center justify-between">
                <span>{petition.currentSupporters} Signed</span>
                <span className="text-sm font-semibold text-slate-500">Goal: {petition.targetGoal}</span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-500">
                {petition.targetGoal - petition.currentSupporters > 0 ? (
                  <span><strong>{petition.targetGoal - petition.currentSupporters} more signatures</strong> needed to trigger official administrative action.</span>
                ) : (
                  <span className="text-emerald-700 font-bold">Goal achieved! Awaiting Collectorate review.</span>
                )}
              </div>
            </div>

            {hasSigned ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-xs text-emerald-950">You Have Signed This Petition!</div>
                <p className="text-[11px] text-emerald-700">Thank you for standing up for your village community.</p>
              </div>
            ) : currentUser ? (
              <form onSubmit={handleSign} className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Why is this important to you? (Optional Testimony)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. My children take this route to school daily and it causes severe delays..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {errorMsg && <div className="text-xs text-rose-600">{errorMsg}</div>}

                <button
                  type="submit"
                  disabled={signing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{signing ? 'Recording Signature...' : 'Sign This Petition'}</span>
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-600">
                Please sign in to add your verified name to this petition.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
