import React, { useState, useMemo } from 'react';
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Building,
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  Layers,
  FileCheck2,
  Hammer,
  Award,
  Sparkles,
  Save,
  X,
  Volume2,
  MapPin,
  Compass,
  Navigation,
  Building2,
} from 'lucide-react';
import { Complaint, Petition, ComplaintStatus, ComplaintCategory } from '../types';
import { getStatusBadgeStyle } from '../components/ComplaintCard';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  complaints: Complaint[];
  petitions: Petition[];
  onSelectComplaint: (complaint: Complaint) => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  petitions,
  onSelectComplaint,
  onRefreshData,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVillage, setFilterVillage] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Modal for changing status / assigning department
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Under Review');
  const [newDept, setNewDept] = useState('Public Works');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [officerNote, setOfficerNote] = useState('');
  const [resolutionProofPhoto, setResolutionProofPhoto] = useState('');
  const [saving, setSaving] = useState(false);

  // Statistics calculation
  const totalCount = complaints.length;
  const underReviewCount = complaints.filter((c) => c.status === 'Under Review' || c.status === 'Submitted').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Verified').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const petitionsMeetingGoal = petitions.filter((p) => p.currentSupporters >= p.targetGoal);

  // Calculate distinct villages and their issue counts
  const villageStats = useMemo(() => {
    const map = new Map<string, { count: number; pending: number; resolved: number; district: string }>();
    complaints.forEach((c) => {
      const v = c.village || 'Other Village';
      const existing = map.get(v) || { count: 0, pending: 0, resolved: 0, district: c.district || 'District' };
      existing.count += 1;
      if (c.status === 'Resolved') existing.resolved += 1;
      else existing.pending += 1;
      map.set(v, existing);
    });
    return Array.from(map.entries()).map(([village, stats]) => ({
      village,
      ...stats,
    }));
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        c.title.toLowerCase().includes(q) ||
        c.village.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);

      const matchesVillage = filterVillage === 'all' || c.village === filterVillage;
      const matchesDept = filterDepartment === 'all' || c.departmentAssigned === filterDepartment;
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;

      return matchesSearch && matchesVillage && matchesDept && matchesStatus && matchesPriority;
    });
  }, [complaints, searchTerm, filterVillage, filterDepartment, filterStatus, filterPriority]);

  const handleOpenEdit = (c: Complaint) => {
    setEditingComplaint(c);
    setNewStatus(c.status);
    setNewDept(c.departmentAssigned || 'Public Works');
    setNewPriority(c.priority);
    setOfficerNote(`Status updated by ${currentUser?.fullName || 'District Collector'} for field execution.`);
    setResolutionProofPhoto(c.resolutionProofPhoto || '');
  };

  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/complaints/${editingComplaint.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          departmentAssigned: newDept,
          priority: newPriority,
          note: officerNote,
          resolutionProofPhoto: newStatus === 'Resolved' ? resolutionProofPhoto || editingComplaint.images[0] : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingComplaint(null);
        onRefreshData();
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/70 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-amber-500/30">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>District Administration & Executive Collectorate Portal</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              {currentUser?.fullName || 'Rajesh Sharma, IAS'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              District Magistrate & Collector • {currentUser?.district || 'Varanasi'} District Jurisdiction
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-1 text-right">
            <div className="text-xs text-slate-400 font-medium">Resolution Success Rate</div>
            <div className="font-display font-extrabold text-2xl text-emerald-400">
              {totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}%` : '94%'}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Filed Grievances</span>
          <div className="font-display font-extrabold text-3xl text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-500">Across 142 Gram Panchayats</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Triage</span>
          <div className="font-display font-extrabold text-3xl text-amber-600">{underReviewCount}</div>
          <div className="text-[11px] text-slate-500">Requires review / verification</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Under Field Repair</span>
          <div className="font-display font-extrabold text-3xl text-blue-600">{inProgressCount}</div>
          <div className="text-[11px] text-slate-500">Active department crews</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Successfully Resolved</span>
          <div className="font-display font-extrabold text-3xl text-emerald-600">{resolvedCount}</div>
          <div className="text-[11px] text-slate-500">Citizen verified with photos</div>
        </div>
      </div>

      {/* Petitions Elevated to Collectorate */}
      {petitionsMeetingGoal.length > 0 && (
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-amber-950">
                  Elevated Village Petitions ({petitionsMeetingGoal.length})
                </h3>
                <span className="text-xs text-amber-800">
                  These petitions have met citizen signature quotas and require official sanction orders.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {petitionsMeetingGoal.map((pet) => (
              <div key={pet.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 line-clamp-1">{pet.title}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {pet.currentSupporters} / {pet.targetGoal} Signed
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{pet.story}</p>
                <div className="text-[11px] text-slate-500">
                  Village: <strong>{pet.village}</strong> • Initiated by {pet.creatorName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location-Wise Problems Received from Gram Panchayats Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 text-white rounded-3xl p-6 border border-amber-500/30 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-lg text-white">
                  Location-Wise Problems Feed (स्थान-अनुसार प्राप्त समस्याएं)
                </h3>
                <span className="text-[10px] bg-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-400/30">
                  Live District Map Triage
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Incoming citizen grievances grouped by Gram Panchayat and village coordinates in {currentUser?.district || 'Varanasi'} District.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300 font-bold">
              {villageStats.length} Monitored Gram Panchayats
            </span>
          </div>
        </div>

        {/* Village Selection Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => setFilterVillage('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterVillage === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>All Villages ({complaints.length})</span>
          </button>

          {villageStats.map((stat) => (
            <button
              key={stat.village}
              type="button"
              onClick={() => setFilterVillage(stat.village)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                filterVillage === stat.village
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{stat.village}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                filterVillage === stat.village
                  ? 'bg-slate-900 text-amber-300'
                  : 'bg-amber-900/60 text-amber-300 border border-amber-400/30'
              }`}>
                {stat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grievances Management Table & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        {/* Real-time pipeline badge */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span><strong>🔴 Real-Time Citizen Grievance Stream:</strong> Complaints submitted by rural citizens in the Citizen Portal flow directly into this table with voice recordings, GPS coordinates, and AI category detection.</span>
          </div>
          <span className="text-[11px] font-bold bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
            {complaints.length} Total Submissions
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display font-extrabold text-lg text-slate-900">
              Administrative Grievances Triage Table (ज़िला शिकायत निवारण पटल)
            </h2>
            <p className="text-xs text-slate-500">
              Directly assign departments, override priorities, and issue field status updates.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Showing {filteredComplaints.length} of {complaints.length} Records
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, title, village..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="Public Works">Public Works (PWD)</option>
            <option value="Water Supply">Water Supply (Jal Nigam)</option>
            <option value="Electricity">Electricity (Discom)</option>
            <option value="Healthcare">Healthcare (CMO)</option>
            <option value="Sanitation">Sanitation</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Verified">Verified</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold">
                <th className="py-3 px-3">Grievance ID & Title</th>
                <th className="py-3 px-3">Citizen Submitter</th>
                <th className="py-3 px-3">Village / Location</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Supporters</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=100'}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-mono font-bold text-[11px] text-emerald-800 block">#{item.id}</span>
                        <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-700">
                    <span className="font-semibold text-slate-900 block">{item.creatorName || 'Rural Citizen'}</span>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                      {item.voiceNoteUrl && <Volume2 className="w-3 h-3 text-emerald-600" />}
                      <span>{item.voiceLanguage || 'Hindi'} voice</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-700">
                    <span className="font-medium block">{item.village}</span>
                    <span className="text-[10px] text-slate-400">{item.district}</span>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {item.departmentAssigned || 'Unassigned'}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      item.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.priority}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getStatusBadgeStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-700">
                    {item.supportersCount}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectComplaint(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title="View Grievance"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition cursor-pointer"
                        title="Update Status / Department"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status & Action Dialog */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base">
                  Update Official Status (#{editingComplaint.id})
                </h3>
                <p className="text-xs text-amber-300">{editingComplaint.title}</p>
              </div>
              <button
                onClick={() => setEditingComplaint(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">New Resolution Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Verified">Verified</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Assigned Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Public Works">Public Works (PWD)</option>
                    <option value="Water Supply">Water Supply (Jal Nigam)</option>
                    <option value="Electricity">Electricity (Discom)</option>
                    <option value="Healthcare">Healthcare (CMO)</option>
                    <option value="Sanitation">Sanitation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Priority Override</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Official Administrative Note / Directive *</label>
                <textarea
                  rows={3}
                  required
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="Enter details of field inspection, tender allocation, or completion verification..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              {newStatus === 'Resolved' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Completion Evidence Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={resolutionProofPhoto}
                    onChange={(e) => setResolutionProofPhoto(e.target.value)}
                    placeholder="https://... (Photo showing completed repair)"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Directive...' : 'Apply Status Update & Notify Citizen'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
