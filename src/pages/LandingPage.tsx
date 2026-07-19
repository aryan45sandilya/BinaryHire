import React, { useState } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  HelpCircle, 
  Terminal,
  ChevronDown,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: "14 days", label: "AVERAGE TIME-TO-HIRE" },
    { value: "85%", label: "SCREENING MATCH PRECISION" },
    { value: "40 hrs+", label: "RECRUITER TIME SAVED/MO" },
    { value: "12,000+", label: "CANDIDATES EVALUATED" },
  ];

  const features = [
    {
      title: "Gemini Smart Screening",
      desc: "Instantly screen candidate resume copies against active job specifications. Receive unbiased match accuracy indices, alignment indicators, and tailored interview questions.",
    },
    {
      title: "Sieve Hiring Pipeline",
      desc: "Monitor candidates with our custom mechanical hiring funnel visualizations. Track conversion velocity across all team departments with zero clutter.",
    },
    {
      title: "Desk Multi-Role Access",
      desc: "Built for true collaboration between Admin, Recruiters, and Hiring Managers. Keep candidate folder feedback secure and audit logs cleanly indexed.",
    },
  ];

  const faqs = [
    {
      q: "How does the smart resume matching screener work?",
      a: "Our screening engine integrates Gemini server-side. It parses raw candidate resume text and matches it directly against specified departments, experience expectations, and skill rubrics to output an accurate alignment index.",
    },
    {
      q: "Is applicant data stored securely?",
      a: "Yes. All folders, resume texts, and feedback notes are stored securely in our container-persisted database. Route accesses are JWT-authorized.",
    },
    {
      q: "Can I customize the active job specifications?",
      a: "Absolutely. BinaryHire supports full CRUD management of job roles and candidate folders with global search, favorites tagging, and CSV exports.",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink selection:bg-accent-teal/10 selection:text-accent-teal font-sans">
      
      {/* Landing Navbar */}
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-accent-teal flex items-center justify-center text-white font-mono font-bold">
              <Terminal className="w-4.5 h-4.5 text-canvas" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-ink">
              Binary<span className="text-accent-teal font-extrabold">Hire</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLoginClick}
              id="btn-landing-login"
              className="text-xs font-mono font-bold uppercase hover:text-accent-teal transition-colors cursor-pointer"
            >
              SIGN IN
            </button>
            <button
              onClick={onRegisterClick}
              id="btn-landing-get-started"
              className="bg-accent-teal text-white hover:bg-ink text-xs px-4 py-2 rounded-none font-mono font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>GET STARTED</span>
              <ArrowRight className="w-3.5 h-3.5 text-canvas" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 text-center relative overflow-hidden">
        {/* Paper blueprint background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#d8dbd2_1px,transparent_1px)] [background-size:20px_20px] opacity-60 -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-rule text-xs font-mono font-bold text-ink-muted mb-6">
            <span className="w-1.5 h-1.5 bg-accent-teal" />
            <span>THE RECRUITER'S DESK: ARCHITECTED FOR ACTION</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tight text-ink max-w-4xl mx-auto leading-tight mb-6">
            Precision sourcing and AI screening, rebuilt as a physical <span className="text-accent-teal italic">ledger desk</span>.
          </h1>

          <p className="text-base text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-light">
            Ditch generic, over-designed CRM layouts. BinaryHire is structured like a physical office workspace: candidates are filed in fanned index card drawers, statuses are stamped with rubber ink, and specs are kept in clean paper ledgers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={onRegisterClick}
              id="btn-hero-cta"
              className="w-full sm:w-auto bg-accent-teal hover:bg-ink text-white px-8 py-3.5 rounded-none font-mono font-bold transition-all shadow-xs flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <span>BOOTSTRAP WORKSPACE</span>
              <ArrowRight className="w-4 h-4 text-canvas" />
            </button>
            <button
              onClick={onLoginClick}
              id="btn-hero-login"
              className="w-full sm:w-auto border border-rule bg-white hover:bg-canvas px-8 py-3.5 rounded-none font-mono font-bold transition-all text-xs cursor-pointer"
            >
              ACCESS DESK PORTAL
            </button>
          </div>
        </motion.div>

        {/* Beautiful Physical Workspace Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-16 border border-rule rounded-none bg-surface shadow-2xl overflow-hidden max-w-5xl mx-auto"
        >
          {/* Mock Document Header */}
          <div className="bg-canvas px-6 py-3 border-b border-rule flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rule" />
              <span className="w-2.5 h-2.5 bg-rule" />
              <span className="w-2.5 h-2.5 bg-rule" />
            </div>
            <div className="text-[10px] font-mono text-ink-muted uppercase font-bold">
              DESK LEDGER PREVIEW // cabinet_id_042
            </div>
            <div className="w-12" />
          </div>

          {/* Interactive Mock Layout representing "Index folders" and "Stamp badges" */}
          <div className="p-6 md:p-8 bg-canvas/30 text-left grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Folder column 1 */}
            <div className="bg-surface border border-rule p-5 relative ledger-card-index">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                  Sourced Profiles
                </span>
                <span className="font-mono text-xs text-ink font-bold border border-rule px-1.5 bg-canvas">
                  12
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-3 border border-rule bg-canvas/20">
                  <div className="font-serif font-bold text-sm text-ink">Clara Montgomery</div>
                  <div className="text-[10px] font-mono text-ink-muted mt-0.5">Staff Designer • Atlassian</div>
                </div>
                <div className="p-3 border border-rule bg-canvas/20">
                  <div className="font-serif font-bold text-sm text-ink">Alistair Finch</div>
                  <div className="text-[10px] font-mono text-ink-muted mt-0.5">Systems Architect</div>
                </div>
              </div>
            </div>

            {/* Folder column 2 */}
            <div className="bg-surface border border-rule p-5 relative ledger-card-index ledger-card-index-moss">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-success-moss">
                  AI SCREEN EVALUATION
                </span>
                <span className="font-mono text-xs text-success-moss font-bold border border-rule px-1.5 bg-canvas">
                  03
                </span>
              </div>
              <div className="p-3 border border-rule bg-canvas/20 relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-serif font-bold text-sm text-ink">Dr. Aris Thorne</span>
                  <span className="font-mono text-[9px] font-bold bg-white px-1.5 py-0.5 border border-success-moss/30 text-success-moss">
                    94% MATCH
                  </span>
                </div>
                <p className="text-[10px] text-ink-muted line-clamp-2 leading-relaxed">
                  MIT systems engineering background with 8 years building core compiler pipelines. High spec match.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="ledger-stamp stamp-offered text-[8px]">
                    RECOMMENDED
                  </span>
                </div>
              </div>
            </div>

            {/* Folder column 3 */}
            <div className="bg-surface border border-rule p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-ink-muted uppercase font-bold mb-2">Hiring Velocity</div>
                <div className="text-3xl font-serif font-extrabold text-ink tracking-tight">
                  -24.5%
                </div>
                <div className="text-[10px] text-ink-muted font-mono leading-tight mt-1.5">
                  REDUCTION IN PIPELINE DROPOFFS UNDER LEDGER STEWARDSHIP.
                </div>
              </div>
              <div className="border-t border-rule pt-4 mt-4">
                <div className="text-[10px] font-mono font-bold text-ink uppercase mb-1">
                  AI Real-time Directive
                </div>
                <p className="text-[10px] text-ink-muted leading-relaxed font-serif italic border-l-2 border-rule pl-2.5">
                  &ldquo;Schedule Clara Montgomery immediately. Sourced compensation is aligned with standard specifications.&rdquo;
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Statistics Section (IBM Plex Mono heavy) */}
      <section className="bg-white border-y border-rule py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map((stat, i) => (
            <div key={i} className="text-center lg:text-left border-l-2 border-rule pl-6">
              <div className="text-3xl md:text-4xl font-serif font-extrabold text-accent-teal mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] text-ink-muted font-mono font-bold tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl font-extrabold text-ink max-w-xl mx-auto leading-tight">
            An elegant full-stack architecture stripped of unrequested complexity.
          </h2>
          <p className="text-xs text-ink-muted mt-2 font-mono uppercase tracking-wider">
            NO TECH-LARPING. NO AI-SLOP GLOWING BLOBS. ZERO UNNECESSARY TELEMETRY.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            return (
              <div key={i} className="bg-surface border border-rule p-8 relative ledger-card-index">
                <h3 className="font-serif text-xl font-extrabold text-ink mb-3">
                  {feat.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed font-sans">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-20 border-t border-rule">
        <h2 className="font-serif text-2xl font-extrabold text-center text-ink mb-10">
          Frequently Answered Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div key={i} className="bg-surface border border-rule overflow-hidden transition-colors">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-mono font-bold text-xs hover:bg-canvas/30 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 text-ink uppercase">
                    <HelpCircle className="w-4.5 h-4.5 text-accent-teal shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="p-5 pt-0 text-xs text-ink-muted border-t border-rule leading-relaxed font-sans font-light bg-canvas/10">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-7xl mx-auto px-6 pb-24 pt-12 text-center">
        <div className="bg-ink text-white p-8 md:p-14 relative overflow-hidden shadow-2xl border border-rule">
          <div className="absolute inset-0 bg-[radial-gradient(#2d332f_1px,transparent_1px)] [background-size:20px_20px] opacity-25 -z-10" />
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-tight mb-4">
            Ready to establish your recruitment desk ledger?
          </h2>
          <p className="text-canvas/60 text-xs max-w-md mx-auto mb-8 font-mono uppercase tracking-wider">
            PROVISION AN ADMINISTRATOR DESK, REGISTER SPECIFICATIONS, AND INITIATE SECURE GEMINI TRIAGE.
          </p>
          <button
            onClick={onRegisterClick}
            id="btn-cta-bottom"
            className="bg-accent-teal hover:bg-canvas hover:text-ink text-white font-mono font-bold px-8 py-3.5 rounded-none transition-all shadow-xs inline-flex items-center gap-2 text-xs cursor-pointer"
          >
            <span>ESTABLISH DESK</span>
            <ArrowRight className="w-4 h-4 text-canvas" />
          </button>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-rule bg-surface py-12 text-center text-xs text-ink-muted font-mono font-bold uppercase">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent-teal flex items-center justify-center text-white">
              <Terminal className="w-4 h-4 text-canvas" />
            </div>
            <span className="font-serif text-sm text-ink font-bold tracking-tight lowercase">binaryhire.co</span>
          </div>
          <div className="font-light text-[10px] text-ink-muted/60 normal-case">
            © 2026 BinaryHire Recruiting Technologies Inc. Rebuilt for Recruiter Portfolio Review.
          </div>
        </div>
      </footer>
    </div>
  );
}
