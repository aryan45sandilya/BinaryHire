import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Users,
  Activity,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Log {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetName: string;
  timestamp: string;
}

interface DashboardProps {
  onNavigate: (tabId: string) => void;
  onOpenCandidateModal: () => void;
  onOpenJobModal: () => void;
}

// Custom Flip counter for numbers (mechanical flip reel feel)
function FlipNumber({ value }: { value: number | string }) {
  const digits = String(value).split("");
  return (
    <div className="flex font-serif text-5xl md:text-6xl font-extrabold text-ink tracking-tight select-none">
      {digits.map((digit, idx) => (
        <div key={idx} className="relative overflow-hidden h-16 w-[0.6em] flex justify-center bg-transparent">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={digit}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ onNavigate, onOpenCandidateModal, onOpenJobModal }: DashboardProps) {
  const { apiFetch, user } = useAuth();
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const [selectedCampaign, setSelectedCampaign] = useState("All");
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [isFanned, setIsFanned] = useState(false);

  useEffect(() => {
    loadDashboardData();
    fetchAIInsight();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLogsLoading(true);
      const [candidatesData, jobsData, activityLogs] = await Promise.all([
        apiFetch("/api/candidates"),
        apiFetch("/api/jobs"),
        apiFetch("/api/logs")
      ]);

      setCandidates(candidatesData);
      setJobs(jobsData);
      setLogs(activityLogs.slice(0, 5));
    } catch (err) {
      console.error("Error loading dashboard content:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchAIInsight = async () => {
    try {
      setAiLoading(true);
      const res = await apiFetch("/api/ai/insights", { method: "POST" });
      setAiInsight(res.insight || "Prioritize high-fit talent reviews for key tech openings.");
    } catch (err) {
      console.error("AI Insights fetch failed:", err);
      setAiInsight("Reduce hiring dropoffs by prioritizing outreach for active candidates with zero-day notice periods.");
    } finally {
      setAiLoading(false);
    }
  };

  // Human-friendly date header
  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Funnel calculations based on candidate status
  const totalSourced = candidates.length;
  const totalScreened = candidates.filter(c => c.applicationStatus !== "Applied").length;
  const totalInterviewing = candidates.filter(c => c.applicationStatus === "Interviewing").length;
  const totalOffered = candidates.filter(c => c.applicationStatus === "Offered").length;

  const pctSourced = totalSourced > 0 ? 100 : 0;
  const pctScreened = totalSourced > 0 ? Math.round((totalScreened / totalSourced) * 100) : 0;
  const pctInterviewing = totalSourced > 0 ? Math.round((totalInterviewing / totalSourced) * 100) : 0;
  const pctOffered = totalSourced > 0 ? Math.round((totalOffered / totalSourced) * 100) : 0;

  // Step 4: Real "Hired This Month" — candidates with Offered status created this calendar month
  const now = new Date();
  const hiredThisMonth = candidates.filter(c => {
    if (c.applicationStatus !== "Offered") return false;
    const created = new Date(c.createdAt);
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  }).length;

  // Step 3: Build real week planner from candidates with interviewDate set
  const buildWeekDays = () => {
    const today = new Date();
    // Start from the most recent Monday
    const dayOfWeek = today.getDay(); // 0=Sun
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    return dayNames.map((name, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dateStr = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isoDate = day.toISOString().slice(0, 10);

      // Find candidate with interviewDate matching this day
      const match = candidates.find(c => c.interviewDate && c.interviewDate.slice(0, 10) === isoDate);
      const interview = match
        ? {
            candidate: match.name,
            time: new Date(match.interviewDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            role: match.currentCompany
          }
        : null;

      return { name, date: dateStr, interview };
    });
  };

  const daysOfWeek = buildWeekDays();

  // Render Rubber Stamp Status with custom rotation & border style
  const renderRubberStamp = (status: string) => {
    let styleClass = "";
    if (status === "Interviewing") styleClass = "stamp-interviewing";
    else if (status === "Offered") styleClass = "stamp-offered";
    else if (status === "Rejected") styleClass = "stamp-rejected";
    else styleClass = "stamp-applied";

    return (
      <motion.div 
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className={`ledger-stamp ${styleClass}`}
      >
        {status}
      </motion.div>
    );
  };

  return (
    <div className="space-y-10 p-6 lg:p-10 max-w-7xl mx-auto selection:bg-accent-teal/10 selection:text-accent-teal font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-rule">
        <div>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-ink">
            Ledger Overview
          </h1>
          <p className="text-xs text-ink-muted mt-2 flex items-center gap-2 font-mono">
            <Clock className="w-3.5 h-3.5 text-accent-teal" />
            <span>{getFormattedDate()}</span>
            <span>•</span>
            <span className="text-success-moss font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-moss animate-pulse" />
              Office Session Active
            </span>
          </p>
        </div>

        {/* Workspace Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenCandidateModal}
            id="quick-add-candidate"
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-teal text-white hover:bg-ink transition-all rounded-none text-xs font-mono font-bold tracking-tight shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>FILE CANDIDATE</span>
          </button>
        </div>
      </div>

      {/* SIGNATURE 1: Tally Counters Top Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-rule divide-y lg:divide-y-0 lg:divide-x divide-rule bg-transparent py-4">
        {/* Metric 1 */}
        <div className="p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider mb-2">Active Roles</span>
          <FlipNumber value={jobs.filter(j => j.status === "Active").length} />
          <span className="text-[10px] font-mono text-ink-muted mt-1">OPEN SPECIFICATIONS</span>
        </div>
        {/* Metric 2 */}
        <div className="p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider mb-2">Sourced Talent</span>
          <FlipNumber value={candidates.length} />
          <span className="text-[10px] font-mono text-ink-muted mt-1">FILED IN FOLDERS</span>
        </div>
        {/* Metric 3 */}
        <div className="p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider mb-2">Pending Offers</span>
          <FlipNumber value={candidates.filter(c => c.applicationStatus === "Offered").length} />
          <span className="text-[10px] font-mono text-ink-muted mt-1">STAMPED OFFER SENT</span>
        </div>
        {/* Metric 4 */}
        <div className="p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider mb-2">Hired This Month</span>
          <FlipNumber value={hiredThisMonth} />
          <span className="text-[10px] font-mono text-ink-muted mt-1">CLOSED CONTRACTS</span>
        </div>
      </div>

      {/* Main Ledger Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIGNATURE 3: Overlapping Candidate Folders (Index Cards) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">
                Candidate Index Folders
              </h2>
              <p className="text-xs text-ink-muted font-mono mt-0.5">
                Hover folder cabinet to fan out the latest candidate sheets
              </p>
            </div>
            <button
              onClick={() => onNavigate("candidates")}
              className="text-xs font-mono font-bold text-accent-teal hover:text-ink flex items-center gap-1"
            >
              <span>BOARD VIEW</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fanning Card Container */}
          <div 
            className="relative h-[340px] bg-canvas border border-dashed border-rule flex items-center justify-center p-4 overflow-hidden"
            onMouseEnter={() => setIsFanned(true)}
            onMouseLeave={() => setIsFanned(false)}
            onClick={() => setIsFanned(!isFanned)}
          >
            {candidates.length === 0 ? (
              <div className="text-center font-mono text-xs text-ink-muted">
                No active folders filed. Click "File Candidate" to start.
              </div>
            ) : (
              <div className="relative w-full max-w-[320px] h-[260px] flex items-center justify-center">
                {candidates.slice(0, 4).map((cand, idx) => {
                  // Determine rotation and x-offset based on fan state
                  const rotation = isFanned 
                    ? (idx - 1.5) * 12 
                    : (idx - 1.5) * 4;
                  
                  const xOffset = isFanned
                    ? (idx - 1.5) * 110
                    : (idx - 1.5) * 12;

                  const yOffset = isFanned ? 0 : idx * 6;

                  // Border indicator depending on application status
                  let borderCol = "ledger-card-index";
                  if (cand.applicationStatus === "Interviewing") borderCol = "ledger-card-index ledger-card-index-mustard";
                  else if (cand.applicationStatus === "Offered") borderCol = "ledger-card-index ledger-card-index-moss";
                  else if (cand.applicationStatus === "Rejected") borderCol = "ledger-card-index ledger-card-index-brick";

                  return (
                    <motion.div
                      key={cand.id}
                      animate={{
                        rotate: rotation,
                        x: xOffset,
                        y: yOffset,
                        scale: isFanned ? 1.02 : 1 - idx * 0.02,
                        zIndex: isFanned ? 20 : 10 - idx
                      }}
                      transition={{ type: "spring", stiffness: 220, damping: 20 }}
                      className={`absolute w-[240px] h-[250px] p-4 flex flex-col justify-between ${borderCol} cursor-pointer hover:shadow-lg bg-surface`}
                    >
                      {/* Folder Tab & Line Decoration */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[9px] text-ink-muted font-semibold">
                            FOLDER #{cand.id.substring(5, 9).toUpperCase()}
                          </span>
                          <span className="font-mono text-[9px] text-ink-muted">
                            EXP: {cand.experience} YRS
                          </span>
                        </div>
                        <h3 className="font-serif text-md font-bold text-ink leading-snug truncate">
                          {cand.name}
                        </h3>
                        <p className="font-mono text-[10px] text-ink-muted truncate">
                          {cand.currentCompany}
                        </p>
                      </div>

                      {/* Small ruled checklist mock */}
                      <div className="border-t border-rule pt-2 flex-1 flex flex-col gap-1.5 justify-center">
                        <div className="flex items-center gap-1.5 text-[9px] text-ink-muted font-mono">
                          <span className="w-1 h-1 bg-accent-teal rounded-full" />
                          <span className="truncate">Notice: {cand.noticePeriod} Days</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-ink-muted font-mono">
                          <span className="w-1 h-1 bg-accent-teal rounded-full" />
                          <span className="truncate">{cand.skills.slice(0, 2).join(", ")}</span>
                        </div>
                      </div>

                      {/* Physical status stamp badge */}
                      <div className="flex justify-end pt-2 border-t border-rule/50">
                        {renderRubberStamp(cand.applicationStatus)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            
            {/* Folder cabinet hint banner */}
            <div className="absolute bottom-2 inset-x-0 text-center">
              <span className="text-[9px] font-mono text-ink-muted font-semibold bg-canvas px-2.5 py-0.5 border border-rule">
                {isFanned ? "SECURED IN DESK" : "HOVER CABINET TO FAN OUT"}
              </span>
            </div>
          </div>
        </div>

        {/* SIGNATURE 2: Physical Sieve Hiring Funnel */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">
              The Hiring Sieve
            </h2>
            <p className="text-xs text-ink-muted font-mono mt-0.5">
              Candidate volume filtered through rigorous stages
            </p>
          </div>

          <div className="bg-surface border border-rule p-6 space-y-5 flex flex-col justify-center">
            {/* Funnel Sieve stage 1: Sourced (100% width) */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex justify-between text-[11px] font-serif italic text-ink mb-1">
                <span>I. Sourced profiles</span>
                <span className="font-mono not-italic font-bold text-ink-muted">{totalSourced} files</span>
              </div>
              <div className="w-full h-8 bg-canvas border border-rule flex items-center justify-between px-3">
                <div className="h-full bg-accent-teal/10 border-r border-rule flex items-center px-2">
                  <span className="font-mono text-[10px] font-bold text-accent-teal">100%</span>
                </div>
                <span className="font-mono text-[9px] text-ink-muted">RECRUITMENT LEDGER ENTRY</span>
              </div>
            </div>

            {/* Funnel Sieve stage 2: Screened (80% width) */}
            <div className="w-full flex flex-col items-center">
              <div className="w-[85%] flex justify-between text-[11px] font-serif italic text-accent-mustard mb-1">
                <span>II. Qualified / Evaluated</span>
                <span className="font-mono not-italic font-bold text-ink-muted">{totalScreened} profiles</span>
              </div>
              <div className="w-[85%] h-8 bg-canvas border border-rule flex items-center justify-between px-3">
                <div className="h-full bg-accent-mustard/10 border-r border-rule flex items-center px-2">
                  <span className="font-mono text-[10px] font-bold text-accent-mustard">{pctScreened}%</span>
                </div>
                <span className="font-mono text-[9px] text-ink-muted">AI ALIGNMENT MATCH</span>
              </div>
            </div>

            {/* Funnel Sieve stage 3: Interviewing (70% width) */}
            <div className="w-full flex flex-col items-center">
              <div className="w-[70%] flex justify-between text-[11px] font-serif italic text-accent-teal mb-1">
                <span>III. Examination Room</span>
                <span className="font-mono not-italic font-bold text-ink-muted">{totalInterviewing} active</span>
              </div>
              <div className="w-[70%] h-8 bg-canvas border border-rule flex items-center justify-between px-3">
                <div className="h-full bg-accent-teal/15 border-r border-rule flex items-center px-2">
                  <span className="font-mono text-[10px] font-bold text-accent-teal">{pctInterviewing}%</span>
                </div>
                <span className="font-mono text-[9px] text-ink-muted">DESK INTERVIEWS</span>
              </div>
            </div>

            {/* Funnel Sieve stage 4: Offered (55% width) */}
            <div className="w-full flex flex-col items-center">
              <div className="w-[55%] flex justify-between text-[11px] font-serif italic text-success-moss mb-1">
                <span>IV. Contracts Extended</span>
                <span className="font-mono not-italic font-bold text-ink-muted">{totalOffered} sent</span>
              </div>
              <div className="w-[55%] h-8 bg-canvas border border-rule flex items-center justify-between px-3">
                <div className="h-full bg-success-moss/10 border-r border-rule flex items-center px-2">
                  <span className="font-mono text-[10px] font-bold text-success-moss">{pctOffered}%</span>
                </div>
                <span className="font-mono text-[9px] text-ink-muted">OFFER STAMPED</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SIGNATURE 4: Desk Calendar Weekly Planner & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interviews day planner strip */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">
              Desk Day-Planner Strip
            </h2>
            <p className="text-xs text-ink-muted font-mono mt-0.5">
              Weekly scheduled examination schedules for candidates
            </p>
          </div>

          {/* Desktop Agenda with Punched Binder Holes */}
          <div className="relative bg-surface border border-rule p-6 pt-10">
            {/* Physical Binder Rings Decoration */}
            <div className="absolute top-[-10px] inset-x-0 flex justify-around pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-2.5 h-6 bg-zinc-400 rounded-full border border-rule shadow-md" />
                  <div className="w-3 h-3 bg-canvas rounded-full border border-rule shadow-inner -mt-2" />
                </div>
              ))}
            </div>

            {/* Day planner list styled like ruled calendar page */}
            <div className="divide-y divide-rule divide-dashed">
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <span className="font-serif italic text-sm text-ink-muted w-24 block">
                      {day.name}
                    </span>
                    <span className="font-mono text-xs text-accent-mustard bg-accent-mustard/10 px-2 py-0.5 border border-accent-mustard/20">
                      {day.date}
                    </span>
                  </div>

                  <div className="flex-1 md:pl-8">
                    {day.interview ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-serif text-xs font-bold text-ink">
                            {day.interview.candidate}
                          </span>
                          <span className="text-[10px] font-mono text-ink-muted block">
                            {day.interview.role}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-accent-teal font-semibold border border-accent-teal/30 px-2 py-0.5">
                          {day.interview.time}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-ink-muted italic">
                        No examination sessions filed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log / Activity */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">
              Ledger Ink Log
            </h2>
            <p className="text-xs text-ink-muted font-mono mt-0.5">
              Historic audit trail of sourcing entries
            </p>
          </div>

          <div className="bg-surface border border-rule p-6 flex flex-col h-[280px] justify-between">
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {logsLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-canvas animate-pulse w-full" />
                  <div className="h-4 bg-canvas animate-pulse w-5/6" />
                  <div className="h-4 bg-canvas animate-pulse w-2/3" />
                </div>
              ) : logs.length === 0 ? (
                <div className="font-mono text-xs text-ink-muted text-center py-8">
                  No ink records logged yet.
                </div>
              ) : (
                <div className="space-y-3.5" id="dashboard-activity-feed">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2.5 items-start text-xs border-b border-rule/30 pb-2.5">
                      <div className="w-2 h-2 rounded-full bg-accent-teal mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-ink leading-snug text-[11px]">
                          {log.action}
                        </p>
                        <span className="text-[9px] text-ink-muted font-mono block mt-0.5">
                          BY {log.userName.toUpperCase()} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-rule pt-4 mt-4 flex justify-between items-center text-[10px] font-mono text-ink-muted">
              <span>LEDGER SYNC SECURE</span>
              <span className="font-bold text-accent-teal">ONLINE</span>
            </div>
          </div>
        </div>

      </div>

      {/* Co-Pilot AI Advisor (Calm, strategic, premium ledger design) */}
      <div className="bg-surface border border-rule p-6" id="ai-insights-widget">
        <div className="flex items-center gap-2 border-b border-rule pb-3 mb-4">
          <Sparkles className="w-4 h-4 text-accent-mustard" />
          <h3 className="font-serif text-sm font-bold text-ink">
            Strategic Co-Pilot Dispatch
          </h3>
          <span className="ml-auto font-mono text-[9px] text-accent-teal font-bold bg-accent-teal/10 px-2 py-0.5 border border-accent-teal/20">
            INTELLIGENCE DESK
          </span>
        </div>

        {aiLoading ? (
          <div className="space-y-2 py-2">
            <div className="h-3 bg-canvas animate-pulse w-full" />
            <div className="h-3 bg-canvas animate-pulse w-4/5" />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-ink leading-relaxed font-serif italic border-l-2 border-accent-mustard pl-4">
              &ldquo;{aiInsight}&rdquo;
            </p>
            <p className="text-[10px] font-mono text-ink-muted mt-2">
              MATCHED AGAINST ACTIVE DEVIATIONS IN DESK PIPELINES AND RECRUITING VELOCITY INDEX.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
