import React, { useState } from 'react';
import {
  Sprout,
  PlusCircle,
  Compass,
  FileText,
  MapPin,
  HelpCircle,
  Bell,
  User,
  Shield,
  Briefcase,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LogIn,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfileModal } from './UserProfileModal';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onOpenVoiceModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuthModal,
}) => {
  const { currentUser, allUsers, switchUser, logout, notifications, unreadNotifsCount, markNotificationsAsRead } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Sprout },
    { id: 'report', label: 'Report Problem', icon: PlusCircle, highlight: true },
    { id: 'explore', label: 'Explore Issues', icon: Compass },
    { id: 'petitions', label: 'Petitions', icon: FileText },
    { id: 'map', label: 'Community Map', icon: MapPin },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Shield className="w-3 h-3" /> District Admin</span>;
      case 'government':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Briefcase className="w-3 h-3" /> Govt Officer</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><User className="w-3 h-3" /> Citizen</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Demo Bar for Hackathon Judges */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium text-[11px]">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Hackathon Demo Role:
          </span>
          <span className="font-semibold text-white">{currentUser?.fullName}</span>
          <span className="text-slate-400 hidden sm:inline">({currentUser?.village}, {currentUser?.district})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="top-login-portal-btn"
            onClick={() => handleNavClick('login')}
            className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            <LogIn className="w-3 h-3 text-emerald-400" />
            <span>Login Portal</span>
          </button>

          <div className="relative">
            <button
              id="demo-role-switcher-btn"
              onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium transition cursor-pointer"
            >
              <span>Switch Role</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {demoSwitchOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Select Persona for Evaluation
                </div>
                <div className="space-y-1">
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setDemoSwitchOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition cursor-pointer ${
                        currentUser?.id === user.id ? 'bg-emerald-50 text-emerald-950 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          {user.fullName}
                          {user.role === 'admin' && <Shield className="w-3 h-3 text-amber-600" />}
                          {user.role === 'government' && <Briefcase className="w-3 h-3 text-blue-600" />}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {user.role === 'government' ? `${user.department} Dept` : user.role === 'admin' ? 'District Collector / DM' : 'Rural Citizen'} • {user.district}
                        </div>
                      </div>
                      {currentUser?.id === user.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">Gram<span className="text-emerald-600">Vikas</span></span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">AI</span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 -mt-0.5 hidden sm:block">
                  Your Voice. Your Village. Your Change.
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                      item.highlight
                        ? isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        : isActive
                        ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'} ${item.highlight && isActive ? 'text-white' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Dynamic Role Link */}
              {currentUser?.role === 'admin' && (
                <button
                  id="nav-link-admin"
                  onClick={() => handleNavClick('admin-dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                    currentTab === 'admin-dashboard'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Portal</span>
                </button>
              )}

              {currentUser?.role === 'government' && (
                <button
                  id="nav-link-govt"
                  onClick={() => handleNavClick('govt-dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                    currentTab === 'govt-dashboard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Govt Portal</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={() => {
                  setNotifsOpen(!notifsOpen);
                  if (!notifsOpen && unreadNotifsCount > 0) {
                    markNotificationsAsRead();
                  }
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                    <div className="font-bold text-sm text-slate-800">Notifications & Updates</div>
                    <span className="text-[11px] text-emerald-600 font-medium">{notifications.length} updates</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (notif.complaintId) {
                              setCurrentTab('explore');
                            }
                            setNotifsOpen(false);
                          }}
                          className={`p-2.5 rounded-lg transition cursor-pointer hover:bg-slate-50 ${
                            !notif.isRead ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {notif.type === 'resolved' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-slate-800">{notif.title}</div>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard / User Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="user-profile-btn"
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-transparent transition cursor-pointer group"
                  title="Click to view/edit your profile"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-300 group-hover:border-emerald-500"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-700">{currentUser.fullName}</div>
                    <div className="text-[10px] text-slate-500 leading-none">{getRoleBadge(currentUser.role)}</div>
                  </div>
                </button>

                <button
                  id="navbar-profile-pill-btn"
                  onClick={() => setProfileModalOpen(true)}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>My Profile</span>
                </button>

                <button
                  id="auth-logout-btn"
                  onClick={async () => {
                    await logout();
                    handleNavClick('home');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="navbar-login-btn"
                  onClick={() => handleNavClick('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Login
                </button>
                <button
                  id="navbar-register-btn"
                  onClick={() => handleNavClick('login')}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`p-3 rounded-xl text-left font-medium text-xs flex items-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Role & Profile Direct Links for Mobile */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between"
                >
                  <span>My Profile ({currentUser.fullName})</span>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                </button>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    handleNavClick('home');
                  }}
                  className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center justify-between"
                >
                  <span>Log Out</span>
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between"
              >
                <span>Sign In / Create Account</span>
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            )}

            <button
              onClick={() => handleNavClick('citizen-dashboard')}
              className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Citizen Dashboard</span>
              <User className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button
              onClick={() => handleNavClick('admin-dashboard')}
              className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center justify-between"
            >
              <span>District Admin Portal</span>
              <Shield className="w-3.5 h-3.5 text-amber-600" />
            </button>
            <button
              onClick={() => handleNavClick('govt-dashboard')}
              className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 flex items-center justify-between"
            >
              <span>Government Officer Portal</span>
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onNavigate={handleNavClick}
      />
    </header>
  );
};
