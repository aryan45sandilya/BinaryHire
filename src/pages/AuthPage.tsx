import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  X, 
  Key,
  Eye,
  EyeOff,
  Terminal,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthPageProps {
  initialMode: "login" | "register";
}

export default function AuthPage({ initialMode }: AuthPageProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Recruiter");
  const [department, setDepartment] = useState("");
  
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Simple password strength calculator
  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-rule", percent: 0 };
    let score = 0;
    if (password.length >= 6) score += 33;
    if (/[A-Z]/.test(password)) score += 33;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 34;

    if (score <= 33) return { label: "WEAK", color: "bg-danger-brick", percent: 33 };
    if (score <= 66) return { label: "FAIR", color: "bg-accent-mustard", percent: 66 };
    return { label: "STRONG", color: "bg-success-moss", percent: 100 };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        await register(name, email, password, role, department);
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please review details.");
    } finally {
      setSubmitting(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 selection:bg-accent-teal/10 selection:text-accent-teal font-sans">
      <div className="w-full max-w-5xl bg-surface border border-rule shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Elegant Brand Intro Card */}
        <div className="bg-ink p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle grid pattern background to replicate high-end ledger texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#2d332f_1px,transparent_1px)] [background-size:20px_20px] opacity-35 -z-10" />
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-accent-teal flex items-center justify-center text-white font-mono font-bold">
              <Terminal className="w-4.5 h-4.5 text-canvas" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-white">
              Binary<span className="text-accent-teal font-extrabold">Hire</span>
            </span>
          </div>

          {/* Slogan */}
          <div className="my-12 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 text-[10px] font-mono tracking-wider text-canvas uppercase">
              <Sparkles className="w-3 h-3 text-accent-mustard" />
              <span>Workspace Active Ledger</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight leading-tight text-white">
              The Recruiter's Desk.
            </h2>
            <p className="text-xs text-canvas/70 font-light leading-relaxed font-sans">
              Log in to search and filter elite candidate index folders, manage open job directives, and run Gemini-powered screening match-indexes on raw resumes.
            </p>
          </div>

          {/* Footer Metrics */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-[10px] text-canvas/60 font-mono">
            <div>
              <span className="font-serif font-bold text-white block text-sm">85% ACCURACY</span>
              AI match accuracy metric
            </div>
            <div>
              <span className="font-serif font-bold text-white block text-sm">REAL-TIME</span>
              Gemini decision support
            </div>
          </div>
        </div>

        {/* Right Side: Form Module */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-surface">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-extrabold text-ink" id="auth-title">
              {mode === "login" ? "Recruiter Workspace Sign-In" : "Register Recruiter Account"}
            </h1>
            <p className="text-xs text-ink-muted mt-2 font-mono">
              {mode === "login" 
                ? "ENTER KEY CREDENTIALS TO ACCESS DESK WORKSPACE." 
                : "PROVISION RECRUITER LEDGER KEY FOR NEW DESK."}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                id="auth-error-msg"
                className="p-3.5 bg-danger-brick/10 border border-danger-brick/30 text-danger-brick text-xs rounded-none flex items-start gap-2.5 mb-5 font-mono"
              >
                <span>{error.toUpperCase()}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-4 font-sans" id="auth-form">
            {mode === "register" && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-ink-muted/50" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aryan Sandilya"
                      className="w-full pl-9 pr-4 py-2.5 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role selection & Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Portal Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2.5 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Recruiter">Recruiter</option>
                      <option value="Admin">Administrator</option>
                      <option value="HiringManager">Hiring Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Sourcing"
                      className="w-full px-3 py-2.5 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Business Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-ink-muted/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono font-bold text-ink uppercase text-[10px]">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => alert("Credentials can be reset via Settings once logged in. Standard login is password123")}
                    className="text-[9px] font-mono text-accent-teal hover:underline font-bold uppercase"
                  >
                    FORGOT PASSKEY?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-ink-muted/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-ink-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength visual indicator for registrations */}
              {mode === "register" && password && (
                <div className="mt-2.5 space-y-1 bg-canvas/30 p-2.5 border border-rule">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-ink-muted uppercase">
                    <span>Passkey Strength: {strength.label}</span>
                    <span>{strength.percent}%</span>
                  </div>
                  <div className="w-full h-1 bg-canvas rounded-none overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                  </div>
                  <p className="text-[9px] text-ink-muted font-sans font-light">
                    Passkey requires 6 characters minimum, capital letter, and numeric characters.
                  </p>
                </div>
              )}
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 accent-accent-teal border-rule rounded-none"
                  />
                  <span className="text-ink-muted font-mono font-bold text-[10px] uppercase">Remember my session</span>
                </label>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              id="btn-auth-submit"
              disabled={submitting}
              className="w-full bg-accent-teal text-white hover:bg-ink disabled:bg-canvas disabled:text-ink-muted py-3 rounded-none font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs mt-3 cursor-pointer"
            >
              {submitting ? (
                <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-none animate-spin" />
              ) : (
                <>
                  <span>{mode === "login" ? "SIGN IN TO WORKSPACE" : "BOOTSTRAP PORTAL LEDGER"}</span>
                  <ArrowRight className="w-4 h-4 text-canvas" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="text-center text-xs mt-6 pt-4 border-t border-rule font-mono">
            <span className="text-ink-muted">
              {mode === "login" ? "New to BinaryHire?" : "Already possess an account?"}
            </span>{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              id="btn-toggle-auth-mode"
              className="text-accent-teal hover:underline font-bold transition-colors uppercase"
            >
              {mode === "login" ? "Create recruitment account" : "Sign in existing session"}
            </button>
          </div>
          
          {/* Default accounts disclosure */}
          {mode === "login" && (
            <div className="mt-6 p-3 bg-canvas/30 border border-rule text-[10px] text-ink-muted font-mono leading-normal">
              <span className="font-bold text-ink uppercase">Pre-Seeded Credentials:</span>
              <br />
              Email: <span className="font-semibold text-ink">aryan45sandilya@gmail.com</span>
              <br />
              Password: <span className="font-semibold text-ink">password123</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
