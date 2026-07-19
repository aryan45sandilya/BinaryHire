import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User as UserIcon, 
  Lock, 
  CheckCircle, 
  X, 
  Key,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Settings() {
  const { user, updateSettings } = useAuth();

  // Profile forms
  const [name, setName] = useState(user?.name || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  
  // Security form
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // States
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    
    try {
      await updateSettings({ name, department, avatar });
      setSuccessMsg("Desk profile specifications updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile details.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setSavingSecurity(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateSettings({ password });
      setSuccessMsg("Security ledger modified successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to alter password.");
    } finally {
      setSavingSecurity(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 selection:bg-accent-teal/10 selection:text-accent-teal font-sans">
      
      {/* Header Panel */}
      <div className="pb-6 border-b border-rule">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-ink">
          Desk Configurations
        </h1>
        <p className="text-xs text-ink-muted mt-1 font-mono">
          Update recruiter workspace credentials and desk access keys
        </p>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 bg-success-moss/10 border border-success-moss/30 text-success-moss text-xs rounded-none flex items-center gap-2.5 font-mono"
          >
            <CheckCircle className="w-4 h-4 text-success-moss shrink-0" />
            <span>{successMsg.toUpperCase()}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 bg-danger-brick/10 border border-danger-brick/30 text-danger-brick text-xs rounded-none flex items-center gap-2.5 font-mono"
          >
            <X className="w-4 h-4 text-danger-brick shrink-0" />
            <span>{errorMsg.toUpperCase()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Physical Employee Badge / Desk Card */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-surface border border-rule p-6 text-center relative ledger-card-index">
            <span className="absolute top-2 left-3 font-mono text-[8px] text-ink-muted uppercase font-bold">
              Desk Workspace Pass
            </span>
            <div className="mt-4 mb-4 relative inline-block">
              <img
                src={avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-none object-cover border-2 border-rule mx-auto grayscale hover:grayscale-0 transition-all duration-300"
              />
              <div className="absolute -bottom-2 -right-2">
                <span className="ledger-stamp stamp-offered text-[8px] px-1 py-0 scale-75 block">
                  VERIFIED
                </span>
              </div>
            </div>
            
            <h3 className="font-serif text-xl font-extrabold text-ink tracking-tight mt-2">
              {user?.name}
            </h3>
            
            <span className="text-[10px] font-mono bg-canvas border border-rule text-ink px-2.5 py-0.5 rounded-none font-bold uppercase tracking-wider mt-1.5 inline-block">
              {user?.role}
            </span>
            
            <div className="border-t border-rule mt-5 pt-4 text-left font-mono text-[10px] text-ink-muted space-y-1.5 leading-tight">
              <div>
                DEPARTMENT: <strong className="text-ink">{user?.department || "General HQ"}</strong>
              </div>
              <div className="truncate">
                EMAIL DIRECT: <strong className="text-ink">{user?.email}</strong>
              </div>
              <div>
                CABINET STATUS: <strong className="text-success-moss uppercase">CONNECTED</strong>
              </div>
            </div>
          </div>

          {/* Ledger Desk Note */}
          <div className="p-4 bg-canvas/40 border border-rule font-serif text-xs text-ink-muted italic leading-relaxed">
            &ldquo;Every record logged, interview scheduled, and match index executed is credited directly to this Recruiter Desk. Ensure your credentials match official corporate registration lists.&rdquo;
          </div>
        </div>

        {/* Right column: Configurations Forms */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Profile form card */}
          <div className="bg-surface border border-rule p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-rule mb-6">
              <UserIcon className="w-4 h-4 text-accent-teal" />
              <h2 className="font-serif text-lg font-bold text-ink">Recruiter Identification Ledger</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-sans text-ink-muted">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Workspace Avatar URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none focus:border-ink font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-accent-teal hover:bg-ink text-white font-mono font-bold text-xs rounded-none transition-all cursor-pointer"
                >
                  {savingProfile ? "SAVING DIRECTIVES..." : "UPDATE SPECIFICATIONS"}
                </button>
              </div>
            </form>
          </div>

          {/* Security credentials form card */}
          <div className="bg-surface border border-rule p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-rule mb-6">
              <Lock className="w-4 h-4 text-accent-teal" />
              <h2 className="font-serif text-lg font-bold text-ink">Desk Security Credentials</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-sans text-ink-muted">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">New Access Passkey</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Confirm Passkey</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSecurity}
                  className="px-4 py-2 bg-accent-teal hover:bg-ink text-white font-mono font-bold text-xs rounded-none transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{savingSecurity ? "ALTERING KEYS..." : "COMMIT KEY OVERWRITE"}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
