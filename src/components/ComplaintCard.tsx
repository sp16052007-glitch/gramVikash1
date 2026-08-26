import React, { useState } from 'react';
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Droplets,
  Zap,
  Hammer,
  ShieldCheck,
  Building,
  HeartPulse,
  GraduationCap,
  Sparkles,
  Layers,
  Volume2,
} from 'lucide-react';
import { Complaint, ComplaintCategory } from '../types';
import { useAuth } from '../context/AuthContext';

interface ComplaintCardProps {
  complaint: Complaint;
  onSelect: (complaint: Complaint) => void;
}

export const getCategoryIcon = (category: ComplaintCategory | string) => {
  switch (category) {
    case 'Roads':
      return <Hammer className="w-3.5 h-3.5" />;
    case 'Water':
      return <Droplets className="w-3.5 h-3.5" />;
    case 'Electricity':
      return <Zap className="w-3.5 h-3.5" />;
    case 'Drainage':
    case 'Sanitation':
      return <Layers className="w-3.5 h-3.5" />;
    case 'Healthcare':
      return <HeartPulse className="w-3.5 h-3.5" />;
    case 'Education':
      return <GraduationCap className="w-3.5 h-3.5" />;
    default:
      return <Building className="w-3.5 h-3.5" />;
  }
};

export const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'Resolved':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Verified':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Under Review':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onSelect,
}) => {
  const { currentUser } = useAuth();
  const [supporters, setSupporters] = useState(complaint.supportersCount);
  const [isSupported, setIsSupported] = useState(
    currentUser ? complaint.supporterIds?.includes(currentUser.id) : false
  );
  const [supporting, setSupporting] = useState(false);

  const handleSupport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    setSupporting(true);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/support`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSupporters(data.supportersCount);
        setIsSupported(data.isSupported);
      }
    } catch (err) {
      console.error('Failed to toggle support:', err);
    } finally {
      setSupporting(false);
    }
  };

  const coverImage = complaint.images?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800';

  return (
    <div
      onClick={() => onSelect(complaint)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Cover Photo with Badges */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
          <img
            src={coverImage}
            alt={complaint.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
              {getCategoryIcon(complaint.category)}
              <span>{complaint.category}</span>
            </span>

            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-md ${getStatusBadgeStyle(complaint.status)}`}>
              {complaint.status}
            </span>
          </div>

          {/* Bottom Photo Overlay Info */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="font-mono text-[11px] opacity-90">#{complaint.id}</span>
            {complaint.audioUrl && (
              <span className="bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                <Volume2 className="w-3 h-3" /> Voice Attached
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{complaint.village}, {complaint.district}</span>
          </div>

          <h3 className="font-display font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition line-clamp-2">
            {complaint.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {complaint.aiSummary || complaint.description}
          </p>

          {/* Department badge if assigned */}
          {complaint.departmentAssigned && (
            <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg flex items-center justify-between">
              <span className="font-medium text-slate-600">Handling Dept:</span>
              <span className="font-bold text-slate-900">{complaint.departmentAssigned}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSupport}
            disabled={supporting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              isSupported
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
            }`}
            title="Support this community grievance"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isSupported ? 'fill-white' : ''}`} />
            <span>{supporters}</span>
          </button>

          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{complaint.commentsCount || 0}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelect(complaint)}
          className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
        >
          <span>Track</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
