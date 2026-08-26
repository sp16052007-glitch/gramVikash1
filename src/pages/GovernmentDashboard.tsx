import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Hammer,
  AlertCircle,
  Eye,
  Camera,
  Volume2,
  FileCheck,
  Save,
  X,
  Sparkles,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { getStatusBadgeStyle } from '../components/ComplaintCard';
import { useAuth } from '../context/AuthContext';

interface GovernmentDashboardProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onRefreshData: () => void;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({
  complaints,
  onSelectComplaint,
  onRefreshData,
}) => {
  const { currentUser } = useAuth();
  const departmentName = currentUser?.department || 'Public Works';

  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'resolved'>('pending');
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<ComplaintStatus>('In Progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionProofPhoto, setResolutionProofPhoto] = useState(
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800'
  );
  const [saving, setSaving] = useState(false);

  // Department-assigned complaints
  const deptComplaints = complaints.filter(
    (c) => !c.departmentAssigned || c.departmentAssigned === departmentName || c.category === 'Roads'
  );

  const pendingItems = deptComplaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'Verified');
  const inProgressItems = deptComplaints.filter((c) => c.status === 'In Progress');
  const resolvedItems = deptComplaints.filter((c) => c.status === 'Resolved');

  const displayedComplaints =
    activeTab === 'pending'
      ? pendingItems
      : activeTab === 'in_progress'
      ? inProgressItems
      : resolvedItems;

  const handleOpenAction = (c: Complaint) => {
    setResolvingComplaint(c);
    setResolutionStatus(c.status === 'In Progress' ? 'Resolved' : 'In Progress');
    setResolutionNote(`Field action initiated by ${currentUser?.fullName || 'Dept Engineer'}.`);
  };

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/complaints/${resolvingComplaint.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: resolutionStatus,
          departmentAssigned: departmentName,
          note: resolutionNote,
          resolutionProofPhoto: resolutionStatus === 'Resolved' ? resolutionProofPhoto : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResolvingComplaint(null);
        onRefreshData();
      }
    } catch (err) {
      console.error('Field action error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-blue-500/30">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Government Nodal Department Portal</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              {currentUser?.fullName || 'Er. Vikram Singh'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Executive Engineer • <strong>{departmentName} Department</strong> ({currentUser?.district || 'Varanasi'} Division)
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-1 text-right">
            <div className="text-xs text-slate-400 font-medium">Department Workload</div>
            <div className="font-display font-extrabold text-2xl text-blue-400">
              {inProgressItems.length} Active Repairs
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold max-w-lg">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Pending Queue ({pendingItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'in_progress' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Hammer className="w-3.5 h-3.5 text-blue-600" />
          <span>In Progress ({inProgressItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Resolved ({resolvedItems.length})</span>
        </button>
      </div>

      {/* Complaints Grid for Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedComplaints.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 text-xs text-slate-500">
            No complaints currently in this department stage.
          </div>
        ) : (
          displayedComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 bg-slate-900">
                  <img
                    src={c.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    #{c.id}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeStyle(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] text-slate-500 font-semibold">
                    {c.village}, {c.district}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{c.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{c.aiSummary || c.description}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectComplaint(c)}
                  className="p-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 transition cursor-pointer"
                  title="View Full Case"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleOpenAction(c)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Hammer className="w-3.5 h-3.5" />
                  <span>Update Field Progress</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Field Action Modal */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base">
                  Field Action & Progress Report (#{resolvingComplaint.id})
                </h3>
                <p className="text-xs text-blue-300">{resolvingComplaint.title}</p>
              </div>
              <button
                onClick={() => setResolvingComplaint(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAction} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Set Resolution Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as ComplaintStatus)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="In Progress">In Progress (Repair Crew Dispatched)</option>
                  <option value="Resolved">Resolved (Work Executed & Completed)</option>
                  <option value="Verified">Verified (Inspection Complete)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Department Official Work Note *</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Contractor crew completed asphalt filling on 1.2km stretch. Water drainage pipe unblocked."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              {resolutionStatus === 'Resolved' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Completion Proof Photo URL
                  </label>
                  <input
                    type="url"
                    value={resolutionProofPhoto}
                    onChange={(e) => setResolutionProofPhoto(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Recording Field Update...' : 'Submit Field Report'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
