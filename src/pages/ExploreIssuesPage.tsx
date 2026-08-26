import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  PlusCircle,
  MapPin,
  Sparkles,
  TrendingUp,
  Clock,
  ThumbsUp,
  Droplets,
  Zap,
  Hammer,
  Layers,
  HeartPulse,
  GraduationCap,
  Building,
} from 'lucide-react';
import { ComplaintCard } from '../components/ComplaintCard';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';

interface ExploreIssuesPageProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateReport: () => void;
}

const CATEGORY_TABS: { id: string; label: string; icon?: any }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'Roads', label: 'Roads & Bridges', icon: Hammer },
  { id: 'Water', label: 'Water & Pumps', icon: Droplets },
  { id: 'Electricity', label: 'Electricity', icon: Zap },
  { id: 'Drainage', label: 'Drainage & Waste', icon: Layers },
  { id: 'Healthcare', label: 'Health Clinics', icon: HeartPulse },
  { id: 'Education', label: 'Schools', icon: GraduationCap },
  { id: 'Sanitation', label: 'Sanitation', icon: Building },
];

export const ExploreIssuesPage: React.FC<ExploreIssuesPageProps> = ({
  complaints,
  onSelectComplaint,
  onNavigateReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'supporters' | 'newest' | 'priority'>('supporters');

  // Extract unique districts
  const districts = useMemo(() => {
    const list = Array.from(new Set(complaints.map((c) => c.district)));
    return ['all', ...list];
  }, [complaints]);

  // Filtered & Sorted complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        // Search query
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.village.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q);

        // Category
        const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;

        // Status
        const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

        // District
        const matchesDistrict = selectedDistrict === 'all' || c.district === selectedDistrict;

        return matchesSearch && matchesCategory && matchesStatus && matchesDistrict;
      })
      .sort((a, b) => {
        if (sortBy === 'supporters') {
          return b.supportersCount - a.supportersCount;
        } else if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          // Urgent first
          const priorityWeight = (p: string) => (p === 'High' ? 3 : p === 'Medium' ? 2 : 1);
          return priorityWeight(b.priority) - priorityWeight(a.priority);
        }
      });
  }, [complaints, searchTerm, selectedCategory, selectedStatus, selectedDistrict, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
            Public Village Grievances
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Explore Village Issues & Track Action
          </h1>
          <p className="text-xs text-slate-500">
            Browse verified citizen grievances across Indian Gram Panchayats and back them with community support.
          </p>
        </div>

        <button
          onClick={onNavigateReport}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Problem in Your Village</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              id="explore-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, village (e.g. Rampur), district, or ID..."
              className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* District Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Districts</option>
              {districts.filter((d) => d !== 'all').map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="supporters">Most Supported</option>
              <option value="newest">Newest First</option>
              <option value="priority">High Priority</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <strong>{filteredComplaints.length}</strong> grievance{filteredComplaints.length === 1 ? '' : 's'}
          {selectedDistrict !== 'all' && <span> in <strong>{selectedDistrict}</strong></span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Triage Active</span>
        </div>
      </div>

      {/* Complaints Grid */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-800">No Grievances Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No reported issues matched your current search filters. You can clear the filters or be the first to report one.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSelectedDistrict('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onSelect={onSelectComplaint}
            />
          ))}
        </div>
      )}
    </div>
  );
};
