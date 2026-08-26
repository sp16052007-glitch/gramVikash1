import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  TrendingUp,
  Award,
  Sparkles,
  MapPin,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';
import { PetitionCard } from '../components/PetitionCard';
import { Petition, ComplaintCategory } from '../types';
import { useAuth } from '../context/AuthContext';

interface PetitionsPageProps {
  petitions: Petition[];
  onSelectPetition: (petition: Petition) => void;
  onRefreshPetitions: () => void;
}

export const PetitionsPage: React.FC<PetitionsPageProps> = ({
  petitions,
  onSelectPetition,
  onRefreshPetitions,
}) => {
  const { currentUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Roads');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800');
  const [targetGoal, setTargetGoal] = useState(250);
  const [village, setVillage] = useState(currentUser?.village || 'Rampur Gram Panchayat');
  const [district, setDistrict] = useState(currentUser?.district || 'Varanasi');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPetitions = petitions.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      p.title.toLowerCase().includes(q) ||
      p.story.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
    );
  });

  const handleCreatePetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim() || !currentUser) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/petitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          story: story.trim(),
          category,
          photoUrl,
          targetGoal: Number(targetGoal) || 250,
          village,
          district,
          state: currentUser.state || 'Uttar Pradesh',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreating(false);
        setTitle('');
        setStory('');
        onRefreshPetitions();
      }
    } catch (err) {
      console.error('Failed to create petition:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
            Collective Citizen Voice
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            Village Community Petitions
          </h1>
          <p className="text-xs text-slate-500">
            Gather signatures from fellow villagers. Petitions that reach their goal trigger an official District Collector review.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start a Village Petition</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search village petitions..."
          className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
        />
      </div>

      {/* Petitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPetitions.map((p) => (
          <PetitionCard
            key={p.id}
            petition={p}
            onSelect={onSelectPetition}
          />
        ))}
      </div>

      {/* Create Petition Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg">Start a Community Petition</h3>
                <p className="text-xs text-emerald-300">Rally your panchayat for infrastructure investment</p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePetition} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Petition Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build Solar High-Capacity Water Tower in Rampur"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Roads">Roads & Bridges</option>
                    <option value="Water">Water & Sanitation</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Healthcare">Healthcare PHC</option>
                    <option value="Education">School Upgrade</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Target Signature Goal</label>
                  <input
                    type="number"
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(Number(e.target.value))}
                    min={20}
                    max={5000}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Village / Panchayat</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">The Story & Community Impact *</label>
                <textarea
                  rows={4}
                  required
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Explain why this project is critical for your village, how many families will benefit, and the current hardships..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{submitting ? 'Publishing Petition...' : 'Launch Village Petition'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
