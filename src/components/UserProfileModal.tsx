import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Shield,
  Briefcase,
  CheckCircle2,
  Edit3,
  Save,
  LogOut,
  Sparkles,
  AlertCircle,
  Building2,
  Calendar,
  Wifi,
  Globe2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { currentUser, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [village, setVillage] = useState(currentUser?.village || '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [state, setState] = useState(currentUser?.state || 'Uttar Pradesh');
  const [department, setDepartment] = useState(currentUser?.department || 'Public Works');
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email);
      setVillage(currentUser.village || '');
      setDistrict(currentUser.district || '');
      setState(currentUser.state || 'Uttar Pradesh');
      setDepartment(currentUser.department || 'Public Works');
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setSaving(true);

    try {
      const success = await updateProfile({
        fullName,
        phone,
        email,
        village,
        district,
        state,
        department: currentUser.role === 'government' ? department : undefined,
      });

      if (success) {
        setFeedbackMsg({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: 'error', text: 'Failed to update profile. Please try again.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Network error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    onClose();
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Profile Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 pb-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                id="profile-header-back-btn"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-white/20 shadow-xs"
                title={isEditing ? 'Cancel editing and return' : 'Return to previous page'}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Back to View' : 'Back (वापस)'}</span>
              </button>

              <span className="hidden sm:flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Verified GramVikas Profile</span>
              </span>
            </div>

            <button
              id="close-profile-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Avatar & Floating Card Header */}
        <div className="px-6 relative -mt-10 pb-4 border-b border-slate-100 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName)}`}
                alt={currentUser.fullName}
                className="w-20 h-20 rounded-2xl object-cover bg-white p-1 shadow-xl border-2 border-white ring-2 ring-emerald-500/30"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Verified Session" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 leading-tight">
                  {currentUser.fullName}
                </h2>
                {currentUser.role === 'admin' ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                    District Magistrate (DM)
                  </span>
                ) : currentUser.role === 'government' ? (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-300">
                    {currentUser.department} Executive
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Rural Citizen
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.village}, {currentUser.district}, {currentUser.state}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="toggle-edit-profile-btn"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isEditing
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
            <button
              id="profile-modal-logout-btn"
              onClick={handleLogoutClick}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* EDIT FORM or PROFILE DISPLAY */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>Update Account Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name (पूरा नाम)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone (मोबाइल नंबर)
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address (ईमेल)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Village / Panchayat (ग्राम पंचायत)
                  </label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    District (ज़िला)
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State (राज्य)
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {currentUser.role === 'government' && (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Assigned Department (विभाग)
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Public Works">Public Works Department (PWD)</option>
                      <option value="Water Supply & Sanitation">Jal Nigam / Rural Water Supply</option>
                      <option value="Rural Electrification">Rural Electrification / Discom</option>
                      <option value="Primary Health">Primary Healthcare & Family Welfare</option>
                      <option value="Sanitation & Panchayati Raj">Swachh Bharat & Panchayati Raj</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-950 text-white border border-emerald-500/30 space-y-1 sm:col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30 shrink-0">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Device IP Identity</div>
                    <div className="text-xs font-mono font-bold text-emerald-100 flex items-center gap-1.5">
                      <span>{currentUser.ipAddress || '49.36.128.45 (Active Verified)'}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-400/30">
                  Network Linked
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gram Panchayat & Village</div>
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentUser.village || 'Rampur Gram Panchayat'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administrative Region</div>
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{currentUser.district}, {currentUser.state}</span>
                </div>
              </div>

              {currentUser.latitude && currentUser.longitude && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Map Coordinates Pin</div>
                  <div className="text-xs font-mono font-semibold text-slate-700 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lat: {currentUser.latitude.toFixed(4)}°, Lng: {currentUser.longitude.toFixed(4)}°</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Dedicated Back Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            id="profile-bottom-back-btn"
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
              } else {
                onClose();
              }
            }}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>{isEditing ? 'Cancel & Go Back' : 'Back to Dashboard (वापस जाएं)'}</span>
          </button>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
