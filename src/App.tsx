import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import JobRoles from "./pages/JobRoles";
import Settings from "./pages/Settings";
import { Menu, Bell, Search, Sparkles, Terminal } from "lucide-react";

function AppContent() {
  const { user, loading, logout } = useAuth();
  
  // Navigation tabs state
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Auth state toggles for landing pages
  const [authView, setAuthView] = useState<"landing" | "login" | "register">("landing");

  // Notifications drawer simulation
  const [showNotifications, setShowNotifications] = useState(false);

  // Global modals control passed to Dashboard triggers
  const [triggerCandidateModal, setTriggerCandidateModal] = useState(false);
  const [triggerJobModal, setTriggerJobModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center font-mono text-xs">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-burnt-orange border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-text">Synchronizing BinaryHire session...</p>
        </div>
      </div>
    );
  }

  // Not logged in routing flow
  if (!user) {
    if (authView === "login") {
      return (
        <div className="relative">
          <button 
            onClick={() => setAuthView("landing")} 
            className="absolute top-6 left-6 text-xs font-semibold font-mono text-slate-text hover:text-burnt-orange flex items-center gap-1 cursor-pointer z-50 bg-white border border-neutral-200 px-3 py-1.5 rounded-md shadow-xs"
          >
            ← Back to Product Home
          </button>
          <AuthPage initialMode="login" />
        </div>
      );
    }
    if (authView === "register") {
      return (
        <div className="relative">
          <button 
            onClick={() => setAuthView("landing")} 
            className="absolute top-6 left-6 text-xs font-semibold font-mono text-slate-text hover:text-burnt-orange flex items-center gap-1 cursor-pointer z-50 bg-white border border-neutral-200 px-3 py-1.5 rounded-md shadow-xs"
          >
            ← Back to Product Home
          </button>
          <AuthPage initialMode="register" />
        </div>
      );
    }
    return (
      <LandingPage 
        onLoginClick={() => setAuthView("login")} 
        onRegisterClick={() => setAuthView("register")} 
      />
    );
  }

  // Authenticated Dashboard Layout Flow
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <Dashboard 
            onNavigate={setCurrentTab}
            onOpenCandidateModal={() => {
              setCurrentTab("candidates");
              // Wait briefly for candidates page to mount, then trigger
              setTimeout(() => {
                const btn = document.getElementById("btn-add-candidate");
                if (btn) btn.click();
              }, 100);
            }}
            onOpenJobModal={() => {
              setCurrentTab("jobs");
              setTimeout(() => {
                const btn = document.getElementById("btn-add-job");
                if (btn) btn.click();
              }, 100);
            }}
          />
        );
      case "candidates":
        return <Candidates />;
      case "jobs":
        return <JobRoles />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentTab} onOpenCandidateModal={() => {}} onOpenJobModal={() => {}} />;
    }
  };

  return (
    <div className="flex h-screen bg-warm-bg overflow-hidden relative">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        mobileOpen={mobileSidebarOpen} 
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Contents Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header navbar */}
        <header className="h-16 bg-white border-b border-neutral-200 shrink-0 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              id="mobile-sidebar-toggle"
              className="lg:hidden p-1.5 text-slate-text hover:text-charcoal transition-colors border border-neutral-200 rounded-md bg-neutral-50/50"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Global Context Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-text font-mono">
              <span className="font-bold text-charcoal">BinaryHire OS</span>
              <span>/</span>
              <span className="capitalize">{currentTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notifications icon */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              id="notifications-indicator"
              className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 text-slate-text hover:text-charcoal transition-all relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-burnt-orange rounded-full" />
            </button>

            {/* Notifications panel toggle */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl p-4 z-40 space-y-3" id="notifications-panel">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-xs font-bold text-charcoal">Recruiter Alerts</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-text hover:text-charcoal text-[10px]">
                    Dismiss
                  </button>
                </div>
                <div className="space-y-3 text-xs font-light">
                  <div className="p-2 border border-orange-100 bg-orange-50/20 rounded-md">
                    <span className="font-bold text-charcoal block">AI Evaluation Ready</span>
                    Screen report initialized for Clara Montgomery.
                  </div>
                  <div className="p-2 border border-neutral-100 bg-neutral-50 rounded-md">
                    <span className="font-bold text-charcoal block">Interview Scheduled</span>
                    Ray Chen is scheduled for Monday, July 20, 2026.
                  </div>
                </div>
              </div>
            )}

            {/* Simple Workspace Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-white rounded-lg text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
              <span>Standard Portal</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page content */}
        <main className="flex-1">
          {renderTabContent()}
        </main>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
