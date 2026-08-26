import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { LandingPage } from './pages/LandingPage';
import { ReportProblemPage } from './pages/ReportProblemPage';
import { ExploreIssuesPage } from './pages/ExploreIssuesPage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { PetitionsPage } from './pages/PetitionsPage';
import { PetitionDetailsPage } from './pages/PetitionDetailsPage';
import { CommunityMapPage } from './pages/CommunityMapPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';
import { useUserRoleRouting } from './hooks/useUserRoleRouting';
import { Complaint, Petition, PlatformStats } from './types';

function MainAppContent() {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Hook to monitor user role and automatically route to appropriate dashboard upon login
  useUserRoleRouting({
    currentUser,
    currentTab,
    setCurrentTab,
  });

  // Selected item states for detail views
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);

  // Data Store
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      if (data.complaints) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    }
  };

  const fetchPetitions = async () => {
    try {
      const res = await fetch('/api/petitions');
      const data = await res.json();
      if (data.petitions) {
        setPetitions(data.petitions);
      }
    } catch (err) {
      console.error('Failed to fetch petitions:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const refreshAllData = async () => {
    await Promise.all([fetchComplaints(), fetchPetitions(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setCurrentTab('complaint-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPetition = (petition: Petition) => {
    setSelectedPetition(petition);
    setCurrentTab('petition-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportSuccess = (newComplaint: Complaint) => {
    fetchComplaints();
    fetchStats();
    setSelectedComplaint(newComplaint);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'complaint-details') setSelectedComplaint(null);
          if (tab !== 'petition-details') setSelectedPetition(null);
        }}
        onOpenAuthModal={handleOpenAuth}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            onNavigate={setCurrentTab}
            onSelectComplaint={handleSelectComplaint}
            onSelectPetition={handleSelectPetition}
            complaints={complaints}
            petitions={petitions}
            stats={stats}
          />
        )}

        {currentTab === 'report' && (
          <ReportProblemPage
            onSuccess={handleReportSuccess}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreIssuesPage
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
            onNavigateReport={() => setCurrentTab('report')}
          />
        )}

        {currentTab === 'petitions' && (
          <PetitionsPage
            petitions={petitions}
            onSelectPetition={handleSelectPetition}
            onRefreshPetitions={fetchPetitions}
          />
        )}

        {currentTab === 'map' && (
          <CommunityMapPage
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
            onNavigateReport={() => setCurrentTab('report')}
          />
        )}

        {currentTab === 'how-it-works' && (
          <HowItWorksPage
            onNavigateReport={() => setCurrentTab('report')}
            onNavigateExplore={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'login' && (
          <LoginPage
            onNavigate={setCurrentTab}
            onLoginSuccess={() => refreshAllData()}
          />
        )}

        {currentTab === 'citizen-dashboard' && (
          <CitizenDashboard
            complaints={complaints}
            petitions={petitions}
            onSelectComplaint={handleSelectComplaint}
            onSelectPetition={handleSelectPetition}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'admin-dashboard' && (
          <AdminDashboard
            complaints={complaints}
            petitions={petitions}
            onSelectComplaint={handleSelectComplaint}
            onRefreshData={refreshAllData}
          />
        )}

        {currentTab === 'govt-dashboard' && (
          <GovernmentDashboard
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
            onRefreshData={refreshAllData}
          />
        )}

        {currentTab === 'complaint-details' && selectedComplaint && (
          <ComplaintDetailsPage
            complaint={selectedComplaint}
            onBack={() => setCurrentTab('explore')}
            onNavigateToPetitionCreate={(title, category, village) => {
              setCurrentTab('petitions');
            }}
          />
        )}

        {currentTab === 'petition-details' && selectedPetition && (
          <PetitionDetailsPage
            petition={selectedPetition}
            onBack={() => setCurrentTab('petitions')}
            onRefresh={fetchPetitions}
          />
        )}
      </main>

      {/* Floating AI Assistant Widget ("GramVikas Saathi") */}
      <AIAssistantWidget />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Global Civic-Tech Footer */}
      <Footer onNavClick={setCurrentTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
