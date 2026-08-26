import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Shield,
  Briefcase,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wifi,
  Compass,
  Upload,
  BadgeCheck,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { RegisterMapLocationPicker, LocationData } from './RegisterMapLocationPicker';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, allUsers, switchUser, clientIp, boundIpInfo, checkIpStatus } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRegisterType, setSelectedRegisterType] = useState<'citizen' | 'admin'>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [adminDesignation, setAdminDesignation] = useState('District Magistrate & Collector (DM)');
  const [adminDepartment, setAdminDepartment] = useState('All District Departments (Super Admin)');
  const [officerIdNumber, setOfficerIdNumber] = useState('NIC-UP-94821');
  const [officerProofDoc, setOfficerProofDoc] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  );
  const [location, setLocation] = useState<LocationData>({
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    village: 'Rampur Gram Panchayat',
    latitude: 25.3176,
    longitude: 82.9739,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOfficerProofDoc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const credential = email.trim() || 'ramesh.patel@gramvikas.in';
        const success = await login(credential);
        if (success) {
          onClose();
        } else {
          setErrorMsg('User not found with this email/phone. Try one of the 1-Click Demo accounts or Register.');
        }
      } else {
        if (boundIpInfo?.isBound && boundIpInfo.boundRole !== selectedRegisterType) {
          setErrorMsg(`Security Notice: This IP is already locked to ${boundIpInfo.boundRole?.toUpperCase()} role (${boundIpInfo.boundUserName}). 1 IP Address is restricted to 1 Role.`);
          setLoading(false);
          return;
        }

        if (!fullName.trim()) {
          setErrorMsg(
            selectedRegisterType === 'citizen'
              ? 'Please enter your Full Name (पूरा नाम). Location is selected from the map.'
              : 'Please enter the District Administrator / Nodal Officer Name.'
          );
          setLoading(false);
          return;
        }

        if (selectedRegisterType === 'admin') {
          if (!officerIdNumber.trim()) {
            setErrorMsg('Officer ID Number is mandatory for Admin registration.');
            setLoading(false);
            return;
          }
          if (!officerProofDoc) {
            setErrorMsg('Official ID Proof Document is mandatory for Admin registration.');
            setLoading(false);
            return;
          }
        }

        const res = await register({
          fullName: fullName.trim(),
          state: location.state,
          district: location.district,
          village: location.village,
          latitude: location.latitude,
          longitude: location.longitude,
          role: selectedRegisterType,
          department: selectedRegisterType === 'admin' ? adminDepartment : undefined,
          officerIdNumber: selectedRegisterType === 'admin' ? officerIdNumber.trim() : undefined,
          officerProofDoc: selectedRegisterType === 'admin' ? officerProofDoc : undefined,
          officerDesignation: selectedRegisterType === 'admin' ? adminDesignation : undefined,
        });

        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || 'Registration failed. Please check your inputs.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = async (userId: string) => {
    await switchUser(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg leading-tight">
                {mode === 'login' ? 'Sign in to GramVikas' : 'Register with IP & Map Location'}
              </h3>
              <p className="text-xs text-emerald-300">Your Voice. Your Village. Your Change.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Quick Demo Accounts for Hackathon Judges */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
            <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Evaluation Roles</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemoSelect(u.id)}
                  className="text-left p-2 rounded-xl bg-white hover:bg-emerald-100/60 border border-slate-200 hover:border-emerald-300 transition text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="truncate pr-1">
                    <span className="font-bold text-slate-900 block truncate">{u.fullName}</span>
                    <span className="text-[10px] text-slate-500 block truncate capitalize">
                      {u.role === 'admin' ? 'District Admin' : u.role === 'government' ? `${u.department} Govt` : 'Citizen'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 shrink-0">Select →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              id="modal-mode-register"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'register' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register (IP & Map)
            </button>
            <button
              type="button"
              id="modal-mode-login"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' ? (
              <>
                {/* STEP 1: Two Portions Selection */}
                <div>
                  <div className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>1. Select Registration Type</span>
                    <span className="text-[10px] text-slate-400 font-normal">Citizen vs Admin</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* CITIZEN PORTION */}
                    <button
                      type="button"
                      id="modal-select-citizen-btn"
                      onClick={() => setSelectedRegisterType('citizen')}
                      className={`p-3 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        selectedRegisterType === 'citizen'
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                          selectedRegisterType === 'citizen' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">
                          Send Issue
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900">Rural Citizen</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Send village complaints & voice notes</div>
                    </button>

                    {/* ADMIN PORTION */}
                    <button
                      type="button"
                      id="modal-select-admin-btn"
                      onClick={() => setSelectedRegisterType('admin')}
                      className={`p-3 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        selectedRegisterType === 'admin'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                          selectedRegisterType === 'admin' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded">
                          Admin
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900">District Admin (DM)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Receive location-wise problem feeds</div>
                    </button>
                  </div>
                </div>

                {/* Auto IP Identity Banner */}
                <div className={`p-3 text-white rounded-2xl border flex items-center justify-between ${
                  selectedRegisterType === 'citizen' ? 'bg-slate-900 border-emerald-500/40' : 'bg-slate-900 border-amber-500/40'
                }`}>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{selectedRegisterType === 'citizen' ? 'Citizen Device IP:' : 'Command Center IP:'}</span>
                        <span className="font-mono text-emerald-400">{clientIp || '49.36.128.45'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedRegisterType === 'citizen'
                          ? 'No mobile/password required. Links automatically to your complaints.'
                          : 'Official District Administration verified session.'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-400/30">
                    Auto-Linked
                  </span>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {selectedRegisterType === 'citizen' ? 'Your Full Name (नागरिक का पूरा नाम) *' : 'Officer Full Name (अधिकारी का नाम) *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      id="modal-reg-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={selectedRegisterType === 'citizen' ? 'e.g. Ramesh Patel / रमेश पटेल' : 'e.g. Rajesh Sharma, IAS'}
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Admin Additional Options & Officer Proof */}
                {selectedRegisterType === 'admin' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Designation</label>
                      <select
                        value={adminDesignation}
                        onChange={(e) => setAdminDesignation(e.target.value)}
                        className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                      >
                        <option value="District Magistrate & Collector (DM)">District Magistrate & Collector (DM)</option>
                        <option value="Chief Development Officer (CDO)">Chief Development Officer (CDO)</option>
                        <option value="Sub-Divisional Magistrate (SDM)">Sub-Divisional Magistrate (SDM)</option>
                        <option value="District Grievance Nodal Officer">District Grievance Nodal Officer</option>
                      </select>
                    </div>

                    <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-amber-950 flex items-center gap-1.5">
                          <BadgeCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Officer Proof Required</span>
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                          Mandatory
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-amber-950 mb-0.5">
                          Officer / Employee Service ID Number *
                        </label>
                        <input
                          type="text"
                          required
                          id="modal-admin-officer-id"
                          value={officerIdNumber}
                          onChange={(e) => setOfficerIdNumber(e.target.value)}
                          placeholder="e.g. NIC-UP-94821 / IAS-2018"
                          className="w-full text-xs font-mono pl-3 pr-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-amber-950 mb-0.5">
                          Government ID Badge / Proof *
                        </label>
                        <div className="flex gap-2 items-center">
                          <label className="flex-1 px-3 py-2 bg-white hover:bg-amber-100/60 border border-dashed border-amber-400 rounded-lg text-[11px] font-bold text-amber-900 cursor-pointer flex items-center justify-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-amber-700" />
                            <span>Upload ID Badge Scan</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setOfficerIdNumber('NIC-DM-2024-UP98');
                              setOfficerProofDoc('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
                            }}
                            className="px-2.5 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg text-[10px] font-bold shrink-0"
                          >
                            Sample Badge
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Location Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {selectedRegisterType === 'citizen' ? 'Your Village & Map Location *' : 'District Administrative Zone HQ *'}
                  </label>
                  <RegisterMapLocationPicker
                    location={location}
                    onChange={setLocation}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email / Mobile Number *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh.patel@gramvikas.in or phone"
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              id="modal-submit-btn"
              disabled={loading}
              className={`w-full py-3 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-4 ${
                mode === 'register' && selectedRegisterType === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <Compass className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                  ? 'Sign In to Dashboard'
                  : selectedRegisterType === 'citizen'
                  ? 'Register as Citizen & Send Issues ➔'
                  : 'Register as Admin & Receive Problems ➔'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
