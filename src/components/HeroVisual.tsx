import React from 'react';
import {
  MapPin,
  CheckCircle2,
  Clock,
  ThumbsUp,
  AlertCircle,
  Activity,
  Zap,
  Droplets,
  Building2,
  Layers,
} from 'lucide-react';

interface HeroVisualProps {
  onExploreClick: () => void;
  onReportClick: () => void;
}

export const HeroVisual: React.FC<HeroVisualProps> = ({
  onExploreClick,
  onReportClick,
}) => {
  return (
    <div className="relative w-full aspect-4/3 sm:aspect-16/10 max-h-[520px] rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/40 p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col justify-between select-none">
      {/* Subtle Background Topography / Circuit Grid */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Map Simulation Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">Live Village Grid</span>
          <span className="text-slate-500">•</span>
          <span>Varanasi & Gorakhpur Clusters</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI Triage Active</span>
        </div>
      </div>

      {/* Center Interactive Village Landscape Map Simulation */}
      <div className="relative z-10 my-auto py-2">
        {/* Connected Village Hub Visual */}
        <div className="relative mx-auto w-full max-w-md h-44 sm:h-52 flex items-center justify-center">
          {/* Concentric Radar Rings */}
          <div className="absolute w-40 h-40 sm:w-56 sm:h-56 rounded-full border border-emerald-500/20 animate-ping opacity-25" />
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-emerald-500/10" />

          {/* Central Panchayat Hub */}
          <div className="relative z-20 flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex flex-col items-center justify-center text-center p-1">
                <Building2 className="w-6 h-6 text-emerald-400 mb-0.5" />
                <span className="text-[10px] font-bold text-white leading-tight">Gram Panchayat</span>
                <span className="text-[8px] text-emerald-400 font-medium">Hub 01</span>
              </div>
            </div>
            <div className="mt-2 bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 backdrop-blur-xs">
              4 Active Grievances
            </div>
          </div>

          {/* Node 1: Water Tank */}
          <div className="absolute top-2 left-6 sm:left-10 flex flex-col items-center group cursor-pointer" onClick={onExploreClick}>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 backdrop-blur-md flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20 hover:scale-110 transition">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-[9px] text-slate-300 font-medium mt-1">Solar Pump</span>
          </div>

          {/* Node 2: Power Grid */}
          <div className="absolute top-4 right-6 sm:right-10 flex flex-col items-center group cursor-pointer" onClick={onExploreClick}>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20 hover:scale-110 transition">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[9px] text-slate-300 font-medium mt-1">Substation</span>
          </div>

          {/* Node 3: Road Infrastructure */}
          <div className="absolute bottom-2 left-10 sm:left-14 flex flex-col items-center group cursor-pointer" onClick={onExploreClick}>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 hover:scale-110 transition">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[9px] text-slate-300 font-medium mt-1">NH Link Road</span>
          </div>

          {/* Node 4: Healthcare Clinic */}
          <div className="absolute bottom-2 right-10 sm:right-14 flex flex-col items-center group cursor-pointer" onClick={onExploreClick}>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 backdrop-blur-md flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20 hover:scale-110 transition">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[9px] text-slate-300 font-medium mt-1">Primary Health</span>
          </div>
        </div>
      </div>

      {/* Floating Dynamic Complaint Cards Around Hero Visual */}
      <div className="absolute top-12 left-4 sm:left-8 z-30 animate-float">
        <div
          onClick={onExploreClick}
          className="bg-slate-900/90 hover:bg-slate-900 border border-emerald-500/40 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl max-w-[210px] sm:max-w-[240px] cursor-pointer transition hover:scale-105"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Roads #GV-10482
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <ThumbsUp className="w-3 h-3 text-emerald-400" /> 142
            </span>
          </div>
          <div className="text-xs font-semibold text-white truncate">Broken Road (Rampur)</div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-amber-300 font-medium">
            <Clock className="w-3 h-3 text-amber-400" /> In Progress (PWD)
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-4 sm:right-8 z-30 animate-float-delayed">
        <div
          onClick={onExploreClick}
          className="bg-slate-900/90 hover:bg-slate-900 border border-teal-500/40 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl max-w-[210px] sm:max-w-[240px] cursor-pointer transition hover:scale-105"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
              Drainage #GV-10485
            </span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </span>
          </div>
          <div className="text-xs font-semibold text-white truncate">Market Drain Unblocked</div>
          <div className="mt-1.5 text-[10px] text-slate-400">
            Verified by Panchayat Officer
          </div>
        </div>
      </div>

      <div className="hidden sm:block absolute bottom-4 left-6 z-20">
        <div
          onClick={onExploreClick}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-700 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="text-left">
            <span className="font-semibold text-white block leading-tight">Water Supply #GV-10483</span>
            <span className="text-[10px] text-slate-400">Under Review • 89 Supporters</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer inside Hero Card */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div className="text-[11px] text-slate-400">
          <span className="text-white font-semibold">142+</span> Gram Panchayats Active
        </div>
        <button
          onClick={onReportClick}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition"
        >
          <span>Report in Your Village</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
