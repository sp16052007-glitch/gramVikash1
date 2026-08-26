import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Hammer,
  ShieldCheck,
  User,
  Calendar,
} from 'lucide-react';
import { ComplaintStatus, StatusHistoryItem } from '../types';

interface StatusTimelineProps {
  currentStatus: ComplaintStatus;
  statusHistory?: StatusHistoryItem[];
}

const STATUS_STEPS: { status: ComplaintStatus; label: string; icon: any; description: string }[] = [
  {
    status: 'Submitted',
    label: 'Submitted',
    icon: Clock,
    description: 'Complaint filed with photo/voice evidence',
  },
  {
    status: 'Under Review',
    label: 'Under Review',
    icon: FileCheck,
    description: 'AI triage & District Admin review',
  },
  {
    status: 'Verified',
    label: 'Verified',
    icon: ShieldCheck,
    description: 'Field inspection confirmed issue validity',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    icon: Hammer,
    description: 'Department repair crew / tender allocated',
  },
  {
    status: 'Resolved',
    label: 'Resolved',
    icon: CheckCircle2,
    description: 'Execution verified with citizen sign-off',
  },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  statusHistory = [],
}) => {
  const getStepIndex = (status: ComplaintStatus) => {
    return STATUS_STEPS.findIndex((s) => s.status === status);
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Stepper Progress Bar */}
      <div className="relative">
        <div className="hidden sm:flex items-center justify-between relative z-10">
          {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.status} className="flex flex-col items-center text-center max-w-[110px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                    isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 scale-110'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Icon className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="mt-2">
                  <div
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-emerald-700 font-extrabold' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-500 hidden md:block mt-0.5 leading-tight">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connecting Line */}
        <div className="hidden sm:block absolute top-5 left-10 right-10 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Mobile View Vertical Step Summary */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div>
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Current Status</div>
              <div className="text-base font-extrabold text-slate-900">{currentStatus}</div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-600 text-white">
              Step {currentIndex + 1} of 5
            </span>
          </div>
        </div>
      </div>

      {/* Audit Log / History Entries */}
      {statusHistory.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Official Status History & Field Notes</span>
          </h4>

          <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {statusHistory.map((item, idx) => (
              <div key={idx} className="relative pl-8 group">
                <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600 -translate-x-1/2" />
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.status}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                        {item.actor} ({item.actorRole})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
