import React from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings as SettingsIcon, 
  LogOut, 
  BookOpen,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ currentTab, setCurrentTab, mobileOpen, setMobileOpen }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "candidates", label: "Candidates Folder", icon: Users },
    { id: "jobs", label: "Job Ledgers", icon: Briefcase },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  // Role-based access: only Admin can publish/delete job specs
  const isAdmin = user?.role === "Admin";

  const handleNav = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface border-r border-rule">
      {/* Brand Header */}
      <div className="p-6 border-b border-rule flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-accent-teal flex items-center justify-center text-white">
          <BookOpen className="w-4 h-4" id="sidebar-logo-icon" />
        </div>
        <div>
          <span className="font-serif text-xl font-bold tracking-tight text-ink">
            Binary<span className="text-accent-teal italic">Hire</span>
          </span>
          <div className="text-[9px] font-mono tracking-wider text-ink-muted uppercase font-semibold">
            Recruiter's Ledger
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1" id="sidebar-navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-none text-sm font-medium transition-all relative ${
                isActive
                  ? "bg-accent-teal text-white"
                  : "text-ink-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-mustard" />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-sans">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      {user && (
        <div className="p-4 border-t border-rule bg-canvas/40" id="sidebar-user-footer">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
              alt={user.name}
              className="w-10 h-10 rounded-none object-cover border border-rule"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink truncate font-sans">
                {user.name}
              </div>
              <div className="text-[10px] font-mono text-ink-muted truncate">
                {user.role} • {user.department || "Talent"}
              </div>
              {isAdmin && (
                <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-accent-mustard/20 border border-accent-mustard/30 text-accent-mustard font-mono text-[8px] font-bold uppercase tracking-wide">
                  ADMIN ACCESS
                </span>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            id="btn-logout"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-rule hover:border-danger-brick hover:bg-danger-brick/10 hover:text-danger-brick rounded-none text-xs font-mono font-semibold text-ink-muted transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Close Session</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-ink/20 backdrop-blur-xs"
            />
            {/* Content Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-72 shadow-2xl z-50"
            >
              <SidebarContent />
              {/* Close Button on drawer */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-[-48px] w-10 h-10 bg-surface border border-rule rounded-none flex items-center justify-center text-ink shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
