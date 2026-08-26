import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles,
  Award,
  Heart,
  MessageSquareQuote,
} from 'lucide-react';
import { Petition } from '../types';
import { useAuth } from '../context/AuthContext';

interface PetitionCardProps {
  petition: Petition;
  onSelect: (petition: Petition) => void;
  onSignPetition?: (petitionId: string, comment?: string) => void;
}

export const PetitionCard: React.FC<PetitionCardProps> = ({
  petition,
  onSelect,
}) => {
  const { currentUser } = useAuth();
  const isAlreadySigned = currentUser ? petition.supporterIds.includes(currentUser.id) : false;
  const progressPercent = Math.min(100, Math.round((petition.currentSupporters / petition.targetGoal) * 100));

  const recentSupporter = petition.recentSupporters?.[0];

  return (
    <div
      onClick={() => onSelect(petition)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Cover Image & Category Pill */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
          <img
            src={petition.photoUrl}
            alt={petition.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
              Community Petition
            </span>
            <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg">
              {petition.category}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold mb-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{petition.village}, {petition.district}</span>
            </div>
            <div className="text-[10px] text-slate-300">
              Initiated by {petition.creatorName}
            </div>
          </div>
        </div>

        {/* Story Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <h3 className="font-display font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition line-clamp-2">
            {petition.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {petition.story}
          </p>

          {/* Progress Bar & Goal Tracker */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>{petition.currentSupporters} signed</span>
              </span>
              <span className="text-slate-500 font-medium">Goal: {petition.targetGoal}</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{progressPercent}% towards government notice</span>
              <span className="font-semibold text-emerald-600">{petition.targetGoal - petition.currentSupporters > 0 ? `${petition.targetGoal - petition.currentSupporters} needed` : 'Goal reached!'}</span>
            </div>
          </div>

          {/* Recent Supporter Quote */}
          {recentSupporter?.comment && (
            <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-2 text-xs text-slate-700">
              <MessageSquareQuote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="line-clamp-2 italic text-[11px] text-slate-600">
                "{recentSupporter.comment}" — <span className="font-semibold not-italic text-slate-800">{recentSupporter.userName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
          petition.status === 'Goal Reached' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {petition.status}
        </span>

        <button
          type="button"
          onClick={() => onSelect(petition)}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
        >
          <span>{isAlreadySigned ? 'View Petition' : 'Sign & Support'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
