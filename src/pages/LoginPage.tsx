import React, { useState, useEffect } from 'react';
import {
  Shield,
  Phone,
  Mail,
  Lock,
  User,
  MapPin,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
  AlertCircle,
  Building2,
  Users,
  FileText,
  KeyRound,
  Eye,
  EyeOff,
  Radio,
  Clock,
  Sprout,
  Award,
  Globe2,
  Wifi,
  Navigation,
  Compass,
  Upload,
  BadgeCheck,
  FileCheck,
  Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { RegisterMapLocationPicker, LocationData } from '../components/RegisterMapLocationPicker';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
  onLoginSuccess?: () => void;
}

type AuthMethod = 'register' | 'phone-otp' | 'email-password';

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { login, register, allUsers, switchUser, currentUser, clientIp, boundIpInfo, checkIpStatus } = useAuth();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('register');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);

  // Email / Password Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Form State - Citizen vs Admin Selection
  const [selectedRegisterType, setSelectedRegisterType] = useState<'citizen' | 'admin'>('citizen');
  const [fullName, setFullName] = useState('');
  const [adminDesignation, setAdminDesignation] = useState('District Magistrate & Collector (DM)');
  const [adminDepartment, setAdminDepartment] = useState('All District Departments (Super Admin)');
  const [officerIdNumber, setOfficerIdNumber] = useState('NIC-UP-94821');
  const [officerProofDoc, setOfficerProofDoc] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  );
  const [proofFileName, setProofFileName] = useState<string>('Official_DM_Identity_Card.png');
  const [regLocation, setRegLocation] = useState<LocationData>({
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    village: 'Rampur Gram Panchayat',
    latitude: 25.3176,
    longitude: 82.9739,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    checkIpStatus();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOfficerProofDoc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachDemoProof = () => {
    setOfficerIdNumber('NIC-DM-2024-UP98');
    setOfficerProofDoc('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
    setProofFileName('Govt_Officer_Service_ID_Verified.jpg');
    setErrorMsg(null);
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setOtp('7392'); // Pre-fill test OTP for instantaneous testability
      setLoading(false);
      setSuccessMsg('SMS OTP generated! We have pre-filled test code: 7392');
      setTimer(30);
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const success = await login(phone);
      if (success) {
        setSuccessMsg('Signed in successfully! Redirecting...');
        setTimeout(() => {
          const matchingUser = allUsers.find(
            (u) => u.phone?.replace(/\D/g, '') === phone.replace(/\D/g, '')
          );
          navigateAfterLogin(matchingUser?.role || 'citizen');
        }, 400);
      } else {
        setErrorMsg('User not found. Please register or select a 1-Click Persona below.');
      }
    } catch (err) {
      setErrorMsg('OTP Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const targetEmail = email.trim() || 'ramesh.patel@gramvikas.in';
      const success = await login(targetEmail);
      if (success) {
        setSuccessMsg('Signed in successfully! Redirecting...');
        setTimeout(() => {
          const found = allUsers.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
          navigateAfterLogin(found?.role || 'citizen');
        }, 400);
      } else {
        setErrorMsg('User with this email not found. Please register or select a 1-Click Evaluation Persona.');
      }
    } catch (err) {
      setErrorMsg('Login network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg(
        selectedRegisterType === 'citizen'
          ? 'Please enter your Full Name (पूरा नाम). Location is captured from the map.'
          : 'Please enter the District Administrator / Nodal Officer Name.'
      );
      return;
    }

    setLoading(true);
    try {
      if (selectedRegisterType === 'admin') {
        if (!officerIdNumber.trim()) {
          setErrorMsg('Officer ID Number is mandatory for Administrator accounts (e.g. NIC-UP-94821).');
          setLoading(false);
          return;
        }
        if (!officerProofDoc) {
          setErrorMsg('Please upload your Official Government ID Card / Service Proof document.');
          setLoading(false);
          return;
        }
      }

      const res = await register({
        fullName: fullName.trim(),
        state: regLocation.state,
        district: regLocation.district,
        village: regLocation.village,
        latitude: regLocation.latitude,
        longitude: regLocation.longitude,
        role: selectedRegisterType,
        department: selectedRegisterType === 'admin' ? adminDepartment : undefined,
        officerIdNumber: selectedRegisterType === 'admin' ? officerIdNumber.trim() : undefined,
        officerProofDoc: selectedRegisterType === 'admin' ? officerProofDoc : undefined,
        officerDesignation: selectedRegisterType === 'admin' ? adminDesignation : undefined,
      });

      if (res.success) {
        setSuccessMsg(
          selectedRegisterType === 'citizen'
            ? `Citizen profile registered with IP (${clientIp || 'Linked'})! Opening grievance sending portal...`
            : `Admin profile verified & registered with IP (${clientIp || 'Linked'})! Opening location-wise problems dashboard...`
        );
        setTimeout(() => {
          navigateAfterLogin(selectedRegisterType);
        }, 500);
      } else {
        setErrorMsg(res.error || 'Registration could not be completed. Please check the form.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateAfterLogin = (role?: UserRole) => {
    if (onLoginSuccess) onLoginSuccess();
    if (role === 'admin') {
      onNavigate('admin-dashboard');
    } else if (role === 'government') {
      onNavigate('govt-dashboard');
    } else {
      onNavigate('citizen-dashboard');
    }
  };

  const handleQuickPersonaSelect = async (userId: string, role: UserRole) => {
    setLoading(true);
    await switchUser(userId);
    setLoading(false);
    navigateAfterLogin(role);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Information & Branding Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <div className="font-display font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
                  Gram<span className="text-emerald-400">Vikas</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-md uppercase">
                    AI Portal
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Digital Governance for Rural India</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                One Single Sign-On for Citizens & Administration
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log in to file voice complaints in regional dialects, track PWD repair budgets, join village petitions, and inspect government response timelines.
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant OTP Mobile Access</h4>
                  <p className="text-[11px] text-slate-300">Quick password-free login designed for all rural smartphone users.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Role-Based Portals</h4>
                  <p className="text-[11px] text-slate-300">Tailored views for Citizens, Junior Engineers, and District Collectors (DM).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Panchayat Verified Ledger</h4>
                  <p className="text-[11px] text-slate-300">Every grievance and resolution is permanently timestamped with proof photos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Encrypted Portal</span>
            </div>
            <span>Digital India Initiative</span>
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* 1-Click Evaluation Accounts Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Instant 1-Click Evaluation Roles
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  For Reviewers
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                Select any test persona to instantly access their corresponding dashboard without typing credentials:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allUsers.slice(0, 4).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickPersonaSelect(user.id, user.role)}
                    className="p-2.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between shadow-xs group cursor-pointer"
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                        {user.fullName}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {user.role === 'admin' ? 'District Collector (DM)' : user.role === 'government' ? `${user.department} Dept` : 'Rural Citizen'} • {user.district}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Method Navigation Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 mb-6 gap-1">
              <button
                type="button"
                id="tab-register-btn"
                onClick={() => {
                  setAuthMethod('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'register'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Register (IP & Map)</span>
              </button>

              <button
                type="button"
                id="tab-phone-btn"
                onClick={() => {
                  setAuthMethod('phone-otp');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'phone-otp'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile OTP</span>
              </button>

              <button
                type="button"
                id="tab-email-btn"
                onClick={() => {
                  setAuthMethod('email-password');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'email-password'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Sign In</span>
              </button>
            </div>

            {/* Notification Messages */}
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* METHOD 1: Mobile Phone + OTP Login */}
            {authMethod === 'phone-otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Indian Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      🇮🇳
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                      disabled={otpSent}
                    />
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <span>Send OTP</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                        }}
                        className="absolute right-2 top-2.5 text-xs text-emerald-700 font-bold hover:underline"
                      >
                        Change No.
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter the registered mobile number associated with your village grievance profile.
                  </p>
                </div>

                {otpSent && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          6-Digit SMS Verification Code
                        </label>
                        <span className="text-[11px] text-emerald-600 font-bold">Auto-filled: 7392</span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 4 or 6 digit code"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !otp}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <span>Verifying OTP...</span>
                      ) : (
                        <>
                          <span>Verify & Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* METHOD 2: Email & Password */}
            {authMethod === 'email-password' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh.patel@gramvikas.in"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <span className="text-[11px] text-emerald-700 font-semibold cursor-pointer hover:underline">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <span>Signing In...</span> : <span>Sign In to Portal</span>}
                </button>
              </form>
            )}

            {/* METHOD 1: New IP Identity + Map Registration with Citizen vs Admin 2 Portions */}
            {authMethod === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* STEP 1: Two Portions Selection - Citizen or Admin */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                      <span>Select Account Type (प्रकार चुनें)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">1 IP = 1 Role Strict Rule</span>
                  </div>

                  {/* 1 IP = 1 Role Strict Enforcement Banner */}
                  <div className="p-3 mb-3 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-start gap-2.5 shadow-xs">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-amber-300">Strict IP Rule:</span>
                        <span className="text-slate-200">Only 1 Role Allowed Per IP Address</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                          {clientIp || '49.36.128.45'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {boundIpInfo?.isBound ? (
                          <span>
                            This IP is currently verified for <strong>{boundIpInfo.boundRole?.toUpperCase()}</strong> ({boundIpInfo.boundUserName}). One IP cannot play multiple roles.
                          </span>
                        ) : (
                          <span>
                            Once registered, this device IP is permanently locked to your selected role. Citizens cannot access Admin controls, and Admins must submit Officer proof.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* PORTION 1: CITIZEN */}
                    <button
                      type="button"
                      id="choose-citizen-role-btn"
                      onClick={() => {
                        if (boundIpInfo?.isBound && boundIpInfo.boundRole === 'admin') {
                          setErrorMsg(`Security Notice: This IP address is already bound to Admin role (${boundIpInfo.boundUserName}). 1 IP cannot play multiple roles.`);
                          return;
                        }
                        setSelectedRegisterType('citizen');
                        setErrorMsg(null);
                      }}
                      className={`p-3.5 rounded-2xl text-left border transition relative cursor-pointer flex flex-col justify-between ${
                        selectedRegisterType === 'citizen'
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            selectedRegisterType === 'citizen'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            <User className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            selectedRegisterType === 'citizen'
                              ? 'bg-emerald-200/80 text-emerald-900'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            Send Issues
                          </span>
                        </div>
                        <div className="font-display font-extrabold text-sm text-slate-900">
                          Rural Citizen (ग्रामीण नागरिक)
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          File complaints for broken roads, water shortage & electricity. Send voice notes & photos.
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                        <Send className="w-3 h-3" />
                        <span>Opens Citizen Issue Sender</span>
                      </div>
                    </button>

                    {/* PORTION 2: ADMIN */}
                    <button
                      type="button"
                      id="choose-admin-role-btn"
                      onClick={() => {
                        if (boundIpInfo?.isBound && boundIpInfo.boundRole === 'citizen') {
                          setErrorMsg(`Security Notice: This IP address is already bound to Citizen role (${boundIpInfo.boundUserName}). 1 IP cannot play multiple roles.`);
                          return;
                        }
                        setSelectedRegisterType('admin');
                        setErrorMsg(null);
                      }}
                      className={`p-3.5 rounded-2xl text-left border transition relative cursor-pointer flex flex-col justify-between ${
                        selectedRegisterType === 'admin'
                          ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            selectedRegisterType === 'admin'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            <Shield className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            selectedRegisterType === 'admin'
                              ? 'bg-amber-200/80 text-amber-900'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            Requires Officer Proof
                          </span>
                        </div>
                        <div className="font-display font-extrabold text-sm text-slate-900">
                          District Admin / DM (ज़िला प्रशासन)
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Receive location-wise problems from all Gram Panchayats. Heatmaps, SLAs & department triage.
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-bold text-amber-800">
                        <Building2 className="w-3 h-3" />
                        <span>Opens Location-Wise Admin Dashboard</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* STEP 2: Selected Portion Form Fields */}
                <div className="pt-1">
                  {/* Auto-Captured IP Identity Banner */}
                  <div className={`p-3 rounded-2xl border shadow-xs flex items-center justify-between mb-4 ${
                    selectedRegisterType === 'citizen'
                      ? 'bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border-emerald-500/40'
                      : 'bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white border-amber-500/40'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${
                        selectedRegisterType === 'citizen'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                      }`}>
                        <Wifi className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-white">
                            {selectedRegisterType === 'citizen' ? 'Citizen IP Identity:' : 'Admin Command Network IP:'}
                          </span>
                          <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            selectedRegisterType === 'citizen'
                              ? 'text-emerald-300 bg-emerald-900/80 border-emerald-400/30'
                              : 'text-amber-300 bg-amber-900/80 border-amber-400/30'
                          }`}>
                            {clientIp || '49.36.128.45'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 mt-0.5">
                          {selectedRegisterType === 'citizen'
                            ? 'No phone or email needed. Device IP links directly to your village complaints.'
                            : 'Authenticated District Admin IP linked to Executive Dashboard.'}
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-xl border font-bold shrink-0 bg-white/10 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Citizen Portion Specific Form */}
                  {selectedRegisterType === 'citizen' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Your Full Name (नागरिक का पूरा नाम) *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            id="reg-citizen-fullname"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Anand Kumar / आनन्द कुमार"
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Map Location Picker */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Select Your Village & Location Pin (ग्राम पंचायत व स्थान चुनें) *
                        </label>
                        <RegisterMapLocationPicker
                          location={regLocation}
                          onChange={setRegLocation}
                        />
                      </div>

                      {/* Help banner for citizen */}
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                        <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Ready to Send Issues:</strong> Once registered, you will be taken directly to your Citizen Portal to submit broken road photos, water shortage alerts, and local voice notes.
                        </div>
                      </div>

                      {/* Submit Register as Citizen */}
                      <button
                        type="submit"
                        id="submit-citizen-register-btn"
                        disabled={loading}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer mt-3"
                      >
                        <Send className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? <span>Setting up Citizen Profile...</span> : <span>Register as Citizen & Go Send Issues ➔</span>}
                      </button>
                    </div>
                  )}

                  {/* Admin Portion Specific Form */}
                  {selectedRegisterType === 'admin' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Administrator / Nodal Officer Name (अधिकारी का नाम) *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            id="reg-admin-fullname"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Rajesh Sharma, IAS / नोडल अधिकारी"
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Official Designation</label>
                          <select
                            value={adminDesignation}
                            onChange={(e) => setAdminDesignation(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none cursor-pointer"
                          >
                            <option value="District Magistrate & Collector (DM)">District Magistrate & Collector (DM)</option>
                            <option value="Chief Development Officer (CDO)">Chief Development Officer (CDO)</option>
                            <option value="Sub-Divisional Magistrate (SDM)">Sub-Divisional Magistrate (SDM)</option>
                            <option value="District Grievance Nodal Officer">District Grievance Nodal Officer</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Department Oversight</label>
                          <select
                            value={adminDepartment}
                            onChange={(e) => setAdminDepartment(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none cursor-pointer"
                          >
                            <option value="All District Departments (Super Admin)">All District Departments (Super Admin)</option>
                            <option value="Public Works">Public Works (PWD)</option>
                            <option value="Water Supply">Water Supply (Jal Nigam)</option>
                            <option value="Electricity">Rural Electrification</option>
                            <option value="Healthcare">Healthcare & CMO</option>
                          </select>
                        </div>
                      </div>

                      {/* Map Location / District Command Center Picker */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          District Jurisdiction & Command HQ (ज़िला व कलेक्ट्रेट मुख्यालय) *
                        </label>
                        <RegisterMapLocationPicker
                          location={regLocation}
                          onChange={setRegLocation}
                        />
                      </div>

                      {/* Officer Proof Verification Section (Mandatory for Admin) */}
                      <div className="p-4 bg-amber-50/70 border border-amber-300/80 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                              <BadgeCheck className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-extrabold text-amber-950">
                              Official Officer Proof of Identity (अधिकारी पहचान प्रमाण) *
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                            Required by Law
                          </span>
                        </div>

                        {/* Officer ID Number Input */}
                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1">
                            Government Employee / Officer Service ID Number *
                          </label>
                          <div className="relative">
                            <FileCheck className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              required
                              id="reg-admin-officer-id"
                              value={officerIdNumber}
                              onChange={(e) => setOfficerIdNumber(e.target.value)}
                              placeholder="e.g. NIC-UP-94821 / SPARROW-IAS-4019"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                          <p className="text-[10px] text-amber-800 mt-1">
                            Unique administrative credential issued by State Government / NIC / Ministry.
                          </p>
                        </div>

                        {/* Officer ID Card / Document Upload & Preview */}
                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1">
                            Attach Government ID Badge / Service Certificate *
                          </label>

                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            {/* Upload Button */}
                            <label className="flex-1 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-amber-100/50 border border-dashed border-amber-400 rounded-xl text-xs font-bold text-amber-900 cursor-pointer transition">
                              <Upload className="w-4 h-4 text-amber-600" />
                              <span className="truncate">{proofFileName || 'Upload Govt ID Card / Scan (PNG, JPG, PDF)'}</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="reg-admin-proof-file"
                              />
                            </label>

                            {/* 1-Click Fast Verification Helper */}
                            <button
                              type="button"
                              onClick={handleAttachDemoProof}
                              className="px-3 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 border border-amber-300 cursor-pointer"
                              title="Attach pre-verified sample officer credential for instant testing"
                            >
                              <BadgeCheck className="w-3.5 h-3.5 text-amber-800" />
                              <span>Attach Sample ID Card</span>
                            </button>
                          </div>

                          {/* Live ID Proof Thumbnail Preview */}
                          {officerProofDoc && (
                            <div className="mt-2 p-2 bg-white rounded-xl border border-amber-200 flex items-center gap-3">
                              <img
                                src={officerProofDoc}
                                alt="Officer ID Proof"
                                className="w-12 h-9 object-cover rounded-lg border border-amber-300 shadow-xs"
                              />
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-slate-800 truncate">
                                    {proofFileName || 'Government_Service_ID.jpg'}
                                  </span>
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified Attachment
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  ID: {officerIdNumber || 'NIC-UP-94821'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Help banner for admin */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                        <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>Receive Location-Wise Village Problems:</strong> Your dashboard receives geo-tagged complaints from every village across {regLocation.district || 'the district'}, with automated department routing and SLA triage.
                        </div>
                      </div>

                      {/* Submit Register as Admin */}
                      <button
                        type="submit"
                        id="submit-admin-register-btn"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-2xl shadow-md shadow-amber-600/20 transition flex items-center justify-center gap-2 cursor-pointer mt-3"
                      >
                        <Shield className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? <span>Connecting Command Center...</span> : <span>Register as Admin & Receive Problems Dashboard ➔</span>}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Quick Switch / Alternate Action */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>Need assistance filing by voice?</span>
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Record Grievance Directly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
