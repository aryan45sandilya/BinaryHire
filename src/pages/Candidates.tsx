import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Search, 
  Download, 
  Plus, 
  Star, 
  Trash2, 
  Edit2, 
  Sparkles, 
  FileText,
  X,
  Copy,
  Calendar,
  Grid,
  List,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Candidate, JobRole, ApplicationStatus, AIScreenResult } from "../types";

export default function Candidates() {
  const { apiFetch, user } = useAuth();
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [expFilter, setExpFilter] = useState<string>("All");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  // Signature element #3 Toggle state: Default to "catalog" (fanned index card cabinet)
  const [viewMode, setViewMode] = useState<"catalog" | "ledger">("catalog");

  // Active details panel
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Screening Report States
  const [screeningJobId, setScreeningJobId] = useState<string>("");
  const [screenResult, setScreenResult] = useState<AIScreenResult | null>(null);
  const [screeningLoading, setScreeningLoading] = useState(false);

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formExp, setFormExp] = useState(0);
  const [formSkills, setFormSkills] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formCurrentSalary, setFormCurrentSalary] = useState("");
  const [formExpectedSalary, setFormExpectedSalary] = useState("");
  const [formNoticePeriod, setFormNoticePeriod] = useState(0);
  const [formResume, setFormResume] = useState("");
  const [formLinkedIn, setFormLinkedIn] = useState("");
  const [formGitHub, setFormGitHub] = useState("");
  const [formPortfolio, setFormPortfolio] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<ApplicationStatus>("Applied");
  const [formInterviewDate, setFormInterviewDate] = useState("");

  // Inline form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [candData, jobData] = await Promise.all([
        apiFetch("/api/candidates"),
        apiFetch("/api/jobs")
      ]);
      setCandidates(candData);
      setJobs(jobData);
      if (jobData.length > 0) {
        setScreeningJobId(jobData[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch candidates/jobs lists:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run AI Screening call
  const handleAIScreen = async () => {
    if (!selectedCandidate || !screeningJobId) return;
    try {
      setScreeningLoading(true);
      setScreenResult(null);
      const report = await apiFetch("/api/ai/screen", {
        method: "POST",
        body: JSON.stringify({
          candidateId: selectedCandidate.id,
          jobRoleId: screeningJobId
        })
      });
      setScreenResult(report);
    } catch (err) {
      console.error("AI screener failure:", err);
      alert("AI Screening failed. Please verify server connectivity.");
    } finally {
      setScreeningLoading(false);
    }
  };

  // Toggle candidate favorite star status
  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await apiFetch(`/api/candidates/${id}/favorite`, { method: "POST" });
      setCandidates(candidates.map(c => c.id === id ? updated : c));
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(updated);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  // Delete Candidate confirmation handler
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/candidates/${deleteId}`, { method: "DELETE" });
      setCandidates(candidates.filter(c => c.id !== deleteId));
      if (selectedCandidate?.id === deleteId) {
        setSelectedCandidate(null);
      }
      setDeleteId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Submit Candidate creation
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCandidateForm()) return;
    setSubmitError("");
    try {
      const skillsArr = formSkills.split(",").map(s => s.trim()).filter(Boolean);
      const payload = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        experience: Number(formExp),
        skills: skillsArr,
        currentCompany: formCompany,
        currentSalary: formCurrentSalary,
        expectedSalary: formExpectedSalary,
        noticePeriod: Number(formNoticePeriod),
        resumeText: formResume,
        linkedIn: formLinkedIn,
        gitHub: formGitHub,
        portfolio: formPortfolio,
        notes: formNotes,
        applicationStatus: formStatus,
        interviewDate: formInterviewDate || undefined
      };

      const created = await apiFetch("/api/candidates", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setCandidates([created, ...candidates]);
      setAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Create candidate failed:", err);
      setSubmitError(err.message || "Failed to save candidate. Please try again.");
    }
  };

  // Open Edit candidate modal prep
  const openEditModal = (c: Candidate) => {
    setSelectedCandidate(c);
    setFormName(c.name);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setFormExp(c.experience);
    setFormSkills(c.skills.join(", "));
    setFormCompany(c.currentCompany);
    setFormCurrentSalary(c.currentSalary);
    setFormExpectedSalary(c.expectedSalary);
    setFormNoticePeriod(c.noticePeriod);
    setFormResume(c.resumeText);
    setFormLinkedIn(c.linkedIn || "");
    setFormGitHub(c.gitHub || "");
    setFormPortfolio(c.portfolio || "");
    setFormNotes(c.notes);
    setFormStatus(c.applicationStatus);
    setFormInterviewDate(c.interviewDate ? c.interviewDate.slice(0, 10) : "");
    
    setEditModalOpen(true);
  };

  // Submit edits
  const handleEditCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    if (!validateCandidateForm()) return;
    setSubmitError("");
    try {
      const skillsArr = formSkills.split(",").map(s => s.trim()).filter(Boolean);
      const payload = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        experience: Number(formExp),
        skills: skillsArr,
        currentCompany: formCompany,
        currentSalary: formCurrentSalary,
        expectedSalary: formExpectedSalary,
        noticePeriod: Number(formNoticePeriod),
        resumeText: formResume,
        linkedIn: formLinkedIn,
        gitHub: formGitHub,
        portfolio: formPortfolio,
        notes: formNotes,
        applicationStatus: formStatus,
        interviewDate: formInterviewDate || undefined
      };

      const updated = await apiFetch(`/api/candidates/${selectedCandidate.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      setCandidates(candidates.map(c => c.id === selectedCandidate.id ? updated : c));
      setSelectedCandidate(updated);
      setEditModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Update candidate failed:", err);
      setSubmitError(err.message || "Failed to update candidate. Please try again.");
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormExp(0);
    setFormSkills("");
    setFormCompany("");
    setFormCurrentSalary("");
    setFormExpectedSalary("");
    setFormNoticePeriod(0);
    setFormResume("");
    setFormLinkedIn("");
    setFormGitHub("");
    setFormPortfolio("");
    setFormNotes("");
    setFormStatus("Applied");
    setFormInterviewDate("");
    setFormErrors({});
    setSubmitError("");
  };

  // Validate candidate form fields
  const validateCandidateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = "Full name is required.";
    if (!formEmail.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      errors.email = "Enter a valid email address.";
    }
    if (formPhone && !/^[\d\s\+\-\(\)]{7,15}$/.test(formPhone)) {
      errors.phone = "Enter a valid phone number.";
    }
    if (formExp < 0 || formExp > 50) errors.experience = "Experience must be between 0 and 50 years.";
    if (!formSkills.trim()) errors.skills = "At least one skill is required.";
    if (formStatus === "Interviewing" && !formInterviewDate) {
      errors.interviewDate = "Interview date is required when status is Interviewing.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Duplicate candidate shortcut
  const handleDuplicateCandidate = async (c: Candidate, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const payload = {
        ...c,
        name: `${c.name} (Copy)`,
        email: `copy.${Date.now()}.${c.email}`,
        id: undefined,
        createdAt: undefined,
        isFavorite: false
      };
      const duplicated = await apiFetch("/api/candidates", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setCandidates([duplicated, ...candidates]);
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
  };

  // Export current list to CSV
  const exportToCSV = () => {
    if (candidates.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Experience Yrs", "Skills", "Company", "Expected Salary", "Notice Period", "Status"];
    const rows = filteredCandidates.map(c => [
      c.name,
      c.email,
      c.phone,
      c.experience,
      `"${c.skills.join(", ")}"`,
      c.currentCompany,
      c.expectedSalary,
      c.noticePeriod,
      c.applicationStatus
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LedgerDesk_Candidates_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search and Filter implementation
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "All" || c.applicationStatus === statusFilter;
    
    let matchesExp = true;
    if (expFilter !== "All") {
      if (expFilter === "junior") matchesExp = c.experience < 3;
      else if (expFilter === "mid") matchesExp = c.experience >= 3 && c.experience <= 5;
      else if (expFilter === "senior") matchesExp = c.experience >= 6 && c.experience <= 8;
      else if (expFilter === "staff") matchesExp = c.experience >= 9;
    }

    const matchesFav = !favoriteOnly || c.isFavorite;

    return matchesSearch && matchesStatus && matchesExp && matchesFav;
  });

  // RBAC: can a user delete/edit this candidate?
  const canEditCandidate = (cand: Candidate) =>
    user?.role === "Admin" || cand.recruiterId === user?.id;

  // SIGNATURE 1: Physical Rubber Stamp Badges
  const renderRubberStamp = (status: ApplicationStatus) => {
    let styleClass = "";
    if (status === "Interviewing") styleClass = "stamp-interviewing";
    else if (status === "Offered") styleClass = "stamp-offered";
    else if (status === "Rejected") styleClass = "stamp-rejected";
    else styleClass = "stamp-applied";

    return (
      <span className={`ledger-stamp ${styleClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 selection:bg-accent-teal/10 selection:text-accent-teal font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-rule">
        <div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-ink">
            Candidates Folder Cabinet
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-mono">
            Sourced profiles, resume matching, and physical status stamping
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            id="btn-export-csv"
            disabled={filteredCandidates.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-rule bg-white hover:text-ink hover:border-ink rounded-none text-xs font-mono font-bold text-ink-muted transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPT. CSV</span>
          </button>
          <button
            onClick={() => { resetForm(); setAddModalOpen(true); }}
            id="btn-add-candidate"
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-teal text-white hover:bg-ink rounded-none text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>FILE APPLICANT</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Controls Toolbar */}
      <div className="bg-surface border border-rule p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center" id="filters-toolbar">
        {/* Instant Search input */}
        <div className="relative md:col-span-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, skills..."
            className="w-full pl-9 pr-4 py-2 bg-canvas/40 border border-rule text-xs focus:bg-white focus:outline-none transition-all placeholder:text-ink-muted/60"
          />
        </div>

        {/* Status Filter select */}
        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-canvas/40 border border-rule text-xs focus:bg-white focus:outline-none cursor-pointer font-mono font-semibold"
          >
            <option value="All">All Stages</option>
            <option value="Applied">Applied</option>
            <option value="Screening">AI Screening</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Experience Filter select */}
        <div className="md:col-span-2">
          <select
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value)}
            className="w-full px-3 py-2 bg-canvas/40 border border-rule text-xs focus:bg-white focus:outline-none cursor-pointer font-mono font-semibold"
          >
            <option value="All">All Experience</option>
            <option value="junior">Junior (&lt; 3 yrs)</option>
            <option value="mid">Mid (3-5 yrs)</option>
            <option value="senior">Senior (6-8 yrs)</option>
            <option value="staff">Staff (8+ yrs)</option>
          </select>
        </div>

        {/* Favorites only checkbox */}
        <div className="md:col-span-2 flex items-center justify-start pl-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-mono text-ink-muted font-bold">
            <input
              type="checkbox"
              checked={favoriteOnly}
              onChange={(e) => setFavoriteOnly(e.target.checked)}
              className="accent-accent-teal w-3.5 h-3.5 border-rule"
            />
            <span>Favorites</span>
          </label>
        </div>

        {/* SIGNATURE 3: Table view toggle (secondary option) */}
        <div className="md:col-span-2 flex items-center justify-end border-l border-rule/50 pl-2 gap-1">
          <button
            onClick={() => setViewMode("catalog")}
            title="Card Catalog Cabinet"
            className={`p-1.5 border ${viewMode === "catalog" ? "bg-accent-teal text-white border-accent-teal" : "bg-white border-rule text-ink-muted hover:text-ink"} transition-all`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("ledger")}
            title="Ledger Table Rows"
            className={`p-1.5 border ${viewMode === "ledger" ? "bg-accent-teal text-white border-accent-teal" : "bg-white border-rule text-ink-muted hover:text-ink"} transition-all`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Grid layout (Folders Catalog & AI Intelligence Details Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Candidates List/Catalog View */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white border border-rule p-6 animate-pulse space-y-3">
                  <div className="h-4 bg-canvas w-1/4" />
                  <div className="h-3 bg-canvas w-2/3" />
                  <div className="h-2 bg-canvas w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-16 text-center bg-white border border-rule">
              <FileText className="w-10 h-10 text-ink-muted/40 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold text-ink">No Folders Filed</h3>
              <p className="text-xs text-ink-muted mt-2 max-w-sm mx-auto font-mono">
                NO CORRESPONDING RECORDS WERE LOCATED FOR THIS QUERY. FILTER RESET ADVISED.
              </p>
            </div>
          ) : viewMode === "catalog" ? (
            /* Signature #3: Default Card Catalog layout of index cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="candidates-grid">
              {filteredCandidates.map((cand) => {
                const isSelected = selectedCandidate?.id === cand.id;
                
                // Color tabs for card index top decoration
                let borderStyleClass = "ledger-card-index";
                if (cand.applicationStatus === "Interviewing") borderStyleClass = "ledger-card-index ledger-card-index-mustard";
                else if (cand.applicationStatus === "Offered") borderStyleClass = "ledger-card-index ledger-card-index-moss";
                else if (cand.applicationStatus === "Rejected") borderStyleClass = "ledger-card-index ledger-card-index-brick";

                return (
                  <div
                    key={cand.id}
                    id={`candidate-row-${cand.id}`}
                    onClick={() => { setSelectedCandidate(cand); setScreenResult(null); }}
                    className={`p-5 flex flex-col transition-all cursor-pointer ${borderStyleClass} bg-surface ${
                      isSelected ? "ring-1 ring-accent-teal shadow-md" : "hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[9px] text-ink-muted font-bold">
                          REGIST. ID: {cand.id.substring(5, 11).toUpperCase()}
                        </span>
                        <button 
                          onClick={(e) => toggleFavorite(cand.id, e)}
                          className="text-ink-muted hover:text-accent-mustard transition-colors"
                        >
                          <Star className={`w-4 h-4 ${cand.isFavorite ? "fill-accent-mustard text-accent-mustard" : "text-ink-muted/40"}`} />
                        </button>
                      </div>

                      <div>
                        <h3 className="font-serif text-lg font-extrabold text-ink leading-tight">
                          {cand.name}
                        </h3>
                        <p className="font-mono text-[10px] text-ink-muted mt-0.5">
                          {cand.currentCompany}
                        </p>
                      </div>

                      {/* Skills listed gracefully */}
                      <div className="flex flex-wrap gap-1">
                        {cand.skills.slice(0, 3).map((skill, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.5 bg-canvas font-mono text-[9px] text-ink border border-rule font-medium">
                            {skill}
                          </span>
                        ))}
                        {cand.skills.length > 3 && (
                          <span className="font-mono text-[9px] text-ink-muted px-1">
                            +{cand.skills.length - 3} MORE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-rule pt-3 flex items-center justify-between mt-4">
                      <span className="font-mono text-[10px] text-ink-muted">
                        EXP: <strong className="text-ink">{cand.experience} YRS</strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {renderRubberStamp(cand.applicationStatus)}
                      </div>
                    </div>
                    {/* Action buttons row on catalog card */}
                    <div className="flex items-center justify-end gap-1 pt-2" onClick={(e) => e.stopPropagation()}>
                      {canEditCandidate(cand) && (
                        <>
                          <button
                            onClick={() => openEditModal(cand)}
                            title="Edit candidate"
                            className="p-1.5 border border-rule bg-white text-ink-muted hover:text-ink hover:border-ink transition-all inline-flex"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDuplicateCandidate(cand, e)}
                            title="Duplicate file"
                            className="p-1.5 border border-rule bg-white text-ink-muted hover:text-ink hover:border-ink transition-all inline-flex"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteId(cand.id)}
                            title="Purge record"
                            className="p-1.5 border border-rule bg-white text-danger-brick hover:bg-danger-brick/10 hover:border-danger-brick transition-all inline-flex"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Secondary option: Ledger rows table (No zebra striping, hand-ruled borders) */
            <div className="bg-surface border border-rule overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs" id="candidates-table">
                <thead>
                  <tr className="bg-canvas border-b border-rule font-mono text-ink-muted text-[10px] uppercase font-bold">
                    <th className="p-4 w-10"></th>
                    <th className="p-4">Candidate & Technical Experience</th>
                    <th className="p-4">Affiliation</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ledger Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {filteredCandidates.map((cand) => {
                    const isSelected = selectedCandidate?.id === cand.id;
                    return (
                      <tr 
                        key={cand.id} 
                        id={`candidate-row-${cand.id}`}
                        onClick={() => { setSelectedCandidate(cand); setScreenResult(null); }}
                        className={`hover:bg-canvas/30 transition-colors cursor-pointer ${
                          isSelected ? "bg-accent-teal/5 font-semibold" : ""
                        }`}
                      >
                        <td className="p-4" onClick={(e) => toggleFavorite(cand.id, e)}>
                          <button className="text-ink-muted/40 hover:text-accent-mustard transition-colors">
                            <Star className={`w-4 h-4 ${cand.isFavorite ? "fill-accent-mustard text-accent-mustard" : ""}`} />
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="font-serif text-sm font-bold text-ink">{cand.name}</div>
                          <div className="text-[10px] text-ink-muted mt-0.5 font-mono">
                            {cand.experience} YRS EXP • {cand.skills.slice(0, 3).join(", ")}
                          </div>
                        </td>
                        <td className="p-4 text-ink font-mono text-xs">
                          {cand.currentCompany}
                        </td>
                        <td className="p-4">
                          {renderRubberStamp(cand.applicationStatus)}
                        </td>
                        <td className="p-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          {canEditCandidate(cand) ? (
                            <>
                              <button
                                onClick={() => openEditModal(cand)}
                                title="Modify file"
                                className="p-1.5 border border-rule bg-white text-ink-muted hover:text-ink hover:border-ink transition-all inline-flex"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDuplicateCandidate(cand, e)}
                                title="Duplicate file"
                                className="p-1.5 border border-rule bg-white text-ink-muted hover:text-ink hover:border-ink transition-all inline-flex"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeleteId(cand.id)}
                                title="Purge record"
                                className="p-1.5 border border-rule bg-white text-danger-brick hover:bg-danger-brick/10 hover:border-danger-brick transition-all inline-flex"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <span className="font-mono text-[9px] text-ink-muted italic">View only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Sourcing & AI Screener Panel */}
        <div className="lg:col-span-4 bg-surface border border-rule p-6" id="details-screening-panel">
          {selectedCandidate ? (
            <div className="space-y-6">
              
              {/* Folder tab layout info */}
              <div className="pb-4 border-b border-rule flex justify-between items-start">
                <div>
                  <span className="font-mono text-[9px] text-ink-muted font-bold block mb-1">
                    CANDIDATE CABINET FILE
                  </span>
                  <h2 className="font-serif text-2xl font-extrabold text-ink leading-tight">
                    {selectedCandidate.name}
                  </h2>
                  <p className="text-[10px] text-ink-muted font-mono mt-1">
                    {selectedCandidate.email} • {selectedCandidate.phone}
                  </p>
                </div>
                <button
                  onClick={(e) => toggleFavorite(selectedCandidate.id, e)}
                  className="text-ink-muted hover:text-accent-mustard transition-colors"
                >
                  <Star className={`w-5 h-5 ${selectedCandidate.isFavorite ? "fill-accent-mustard text-accent-mustard" : "text-ink-muted/30"}`} />
                </button>
              </div>

              {/* Technical skills */}
              <div>
                <h3 className="font-mono text-[10px] font-bold text-ink uppercase tracking-wider mb-2.5">
                  Index Skills Ledger
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-canvas text-ink border border-rule font-mono text-[10px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Financial Expectations */}
              <div className="grid grid-cols-2 gap-4 text-xs border-y border-rule py-4 font-mono text-ink-muted">
                <div>
                  <span className="block font-sans font-bold text-ink text-[10px] uppercase tracking-wider mb-1">
                    Wage Alignment
                  </span>
                  {selectedCandidate.expectedSalary}
                </div>
                <div>
                  <span className="block font-sans font-bold text-ink text-[10px] uppercase tracking-wider mb-1">
                    Notice Interval
                  </span>
                  {selectedCandidate.noticePeriod} Days
                </div>
              </div>

              {/* AI Gemini Screener Panel (Elite workflow) */}
              <div className="bg-canvas/50 border border-rule p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-rule/50 pb-2">
                  <Sparkles className="w-4 h-4 text-accent-mustard" />
                  <span className="text-xs font-mono font-bold uppercase text-ink">
                    AI Sieve Assessment
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-mono font-semibold text-ink-muted uppercase">
                    Select Target Job Specification
                  </label>
                  <select
                    value={screeningJobId}
                    onChange={(e) => setScreeningJobId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-rule bg-white text-xs focus:outline-none cursor-pointer font-mono font-bold text-ink"
                  >
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleAIScreen}
                    disabled={screeningLoading || jobs.length === 0}
                    className="w-full py-2 bg-accent-teal text-white hover:bg-ink disabled:bg-canvas disabled:text-ink-muted text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {screeningLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-accent-mustard" />
                        <span>Run AI Sieve Test</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Screening Output Result */}
                <AnimatePresence>
                  {screenResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-rule pt-4 space-y-4"
                    >
                      {/* Score Indicator */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-ink-muted uppercase">Match Accuracy</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-sm text-accent-teal">{screenResult.matchScore}%</span>
                          <span className={`px-1.5 py-0.5 border text-[9px] font-bold uppercase ${
                            screenResult.fitLevel === "High" ? "bg-success-moss/10 text-success-moss border-success-moss/30" :
                            screenResult.fitLevel === "Medium" ? "bg-accent-mustard/10 text-accent-mustard border-accent-mustard/30" : "bg-danger-brick/10 text-danger-brick border-danger-brick/30"
                          }`}>
                            {screenResult.fitLevel} Fit
                          </span>
                        </div>
                      </div>

                      {/* Brief Analysis Summary */}
                      <p className="text-xs text-ink-muted leading-relaxed font-serif italic border-l-2 border-rule pl-3 py-1">
                        {screenResult.summary}
                      </p>

                      {/* Strengths Pros */}
                      <div className="space-y-1">
                        <span className="block text-[9px] font-mono font-bold text-success-moss uppercase">Alignment Indicators</span>
                        <ul className="list-disc pl-4 text-[11px] text-ink-muted font-sans space-y-1">
                          {screenResult.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                        </ul>
                      </div>

                      {/* Gaps Cons */}
                      <div className="space-y-1">
                        <span className="block text-[9px] font-mono font-bold text-danger-brick uppercase">Potential Deviations</span>
                        <ul className="list-disc pl-4 text-[11px] text-ink-muted font-sans space-y-1">
                          {screenResult.cons.map((con, i) => <li key={i}>{con}</li>)}
                        </ul>
                      </div>

                      {/* Recommended Questions */}
                      <div className="space-y-1 bg-white border border-rule p-3">
                        <span className="block text-[9px] font-mono font-bold text-ink uppercase mb-1">Target Examination Questions</span>
                        <ul className="list-decimal pl-4 text-[10px] text-ink-muted font-mono space-y-1 leading-snug">
                          {screenResult.recommendedQuestions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Raw Resume text view */}
              <div className="p-4 border border-rule bg-canvas/30 space-y-2">
                <h4 className="font-mono text-[10px] font-bold text-ink uppercase tracking-wider">
                  Raw Sourced Resume Text
                </h4>
                <div className="text-[10px] font-mono text-ink-muted bg-white border border-rule p-3 max-h-[150px] overflow-y-auto whitespace-pre-wrap leading-tight">
                  {selectedCandidate.resumeText || "No physical resume file copy filed."}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-ink-muted/50 font-mono text-xs">
              <FileText className="w-8 h-8 text-ink-muted/30 mx-auto mb-2" />
              <p>SELECT A FOLDER FILE TO EXAMINE DETAILS AND ACCESS THE AI SCREENING ENGINE.</p>
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-ink/20 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white border border-rule rounded-none p-6 shadow-2xl max-w-sm w-full relative z-10 space-y-4"
            >
              <div className="flex items-center gap-3 text-danger-brick">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-serif font-bold text-lg text-ink">Purge Candidate Record?</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed font-sans">
                Are you absolutely sure you want to completely purge this applicant folder? All associated logs, resume indexes, and AI matching matrices will be lost forever.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-3 py-1.5 border border-rule text-xs font-mono font-bold text-ink-muted rounded-none hover:bg-canvas"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDelete}
                  id="btn-confirm-delete"
                  className="px-3.5 py-1.5 bg-danger-brick hover:bg-ink text-white text-xs font-mono font-bold rounded-none"
                >
                  PURGE RECORD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Candidate Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddModalOpen(false)}
              className="absolute inset-0 bg-ink/20 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-rule rounded-none p-6 md:p-8 shadow-2xl max-w-2xl w-full relative z-10 overflow-y-auto max-h-[90vh] space-y-6"
            >
              <div className="flex items-center justify-between border-b border-rule pb-4">
                <h3 className="font-serif text-xl font-bold text-ink">File Candidate Profile</h3>
                <button onClick={() => setAddModalOpen(false)} className="text-ink-muted hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans" id="create-candidate-form">
                
                {/* Server-side submit error */}
                {submitError && (
                  <div className="md:col-span-2 flex items-center gap-2 p-3 bg-danger-brick/10 border border-danger-brick/30 text-danger-brick text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Full name */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Full Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => { setFormName(e.target.value); if (formErrors.name) setFormErrors(p => ({...p, name: ""})); }}
                    placeholder="Clara Montgomery"
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.name ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.name && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.name}</p>}
                </div>

                {/* Email & Phone */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Email *</label>
                  <input
                    type="text"
                    value={formEmail}
                    onChange={(e) => { setFormEmail(e.target.value); if (formErrors.email) setFormErrors(p => ({...p, email: ""})); }}
                    placeholder="clara.mont@gmail.com"
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.email ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.email && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => { setFormPhone(e.target.value); if (formErrors.phone) setFormErrors(p => ({...p, phone: ""})); }}
                    placeholder="+1 (555) 489-3011"
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.phone ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.phone && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.phone}</p>}
                </div>

                {/* Experience years & Skills */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Years of Experience</label>
                  <input
                    type="number"
                    value={formExp}
                    onChange={(e) => { setFormExp(Number(e.target.value)); if (formErrors.experience) setFormErrors(p => ({...p, experience: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.experience ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.experience && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.experience}</p>}
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Skills (Comma separated) *</label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => { setFormSkills(e.target.value); if (formErrors.skills) setFormErrors(p => ({...p, skills: ""})); }}
                    placeholder="Figma, React, TypeScript, Node.js"
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.skills ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.skills && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.skills}</p>}
                </div>

                {/* Current company & Expected Salary */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Current Company</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Atlassian"
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Expected Salary</label>
                  <input
                    type="text"
                    value={formExpectedSalary}
                    onChange={(e) => setFormExpectedSalary(e.target.value)}
                    placeholder="$160,000"
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>

                {/* Notice period */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Notice Period (Days)</label>
                  <input
                    type="number"
                    value={formNoticePeriod}
                    onChange={(e) => setFormNoticePeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Initial Pipeline Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => { setFormStatus(e.target.value as ApplicationStatus); if (formErrors.interviewDate) setFormErrors(p => ({...p, interviewDate: ""})); }}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Applied">Applied / Sourced</option>
                    <option value="Screening">AI Screening</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* Interview date — shown when status is Interviewing */}
                {formStatus === "Interviewing" && (
                  <div className="md:col-span-2">
                    <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Interview Date *</label>
                    <input
                      type="date"
                      value={formInterviewDate}
                      onChange={(e) => { setFormInterviewDate(e.target.value); if (formErrors.interviewDate) setFormErrors(p => ({...p, interviewDate: ""})); }}
                      className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.interviewDate ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                    />
                    {formErrors.interviewDate && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.interviewDate}</p>}
                  </div>
                )}

                {/* Resume copy Paste text */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Resume Copy Paste</label>
                  <textarea
                    rows={4}
                    value={formResume}
                    onChange={(e) => setFormResume(e.target.value)}
                    placeholder="Paste candidate resume credentials..."
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none font-mono"
                  />
                </div>

                {/* Feedbacks and recruiter notes */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Internal Phone Assessment Notes</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Sourced via LinkedIn. High systems design capability..."
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>

                {/* Submit footer */}
                <div className="md:col-span-2 border-t border-rule pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 border border-rule text-xs font-mono font-bold text-ink-muted rounded-none hover:bg-canvas"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-add-candidate"
                    className="px-4 py-2 bg-accent-teal text-white hover:bg-ink text-xs font-mono font-bold rounded-none"
                  >
                    SAVE CANDIDATE
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Candidate Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditModalOpen(false)}
              className="absolute inset-0 bg-ink/20 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-rule rounded-none p-6 md:p-8 shadow-2xl max-w-2xl w-full relative z-10 overflow-y-auto max-h-[90vh] space-y-6"
            >
              <div className="flex items-center justify-between border-b border-rule pb-4">
                <h3 className="font-serif text-xl font-bold text-ink">Modify Candidate Profile</h3>
                <button onClick={() => setEditModalOpen(false)} className="text-ink-muted hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditCandidate} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans" id="edit-candidate-form">

                {/* Server-side submit error */}
                {submitError && (
                  <div className="md:col-span-2 flex items-center gap-2 p-3 bg-danger-brick/10 border border-danger-brick/30 text-danger-brick text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Full name */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Full Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => { setFormName(e.target.value); if (formErrors.name) setFormErrors(p => ({...p, name: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.name ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.name && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.name}</p>}
                </div>

                {/* Email & Phone */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Email *</label>
                  <input
                    type="text"
                    value={formEmail}
                    onChange={(e) => { setFormEmail(e.target.value); if (formErrors.email) setFormErrors(p => ({...p, email: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.email ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.email && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => { setFormPhone(e.target.value); if (formErrors.phone) setFormErrors(p => ({...p, phone: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.phone ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.phone && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.phone}</p>}
                </div>

                {/* Experience & Skills */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Years of Experience</label>
                  <input
                    type="number"
                    value={formExp}
                    onChange={(e) => { setFormExp(Number(e.target.value)); if (formErrors.experience) setFormErrors(p => ({...p, experience: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.experience ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.experience && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.experience}</p>}
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Skills (Comma separated) *</label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => { setFormSkills(e.target.value); if (formErrors.skills) setFormErrors(p => ({...p, skills: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.skills ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {formErrors.skills && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.skills}</p>}
                </div>

                {/* Notice and Status */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Notice Period (Days)</label>
                  <input
                    type="number"
                    value={formNoticePeriod}
                    onChange={(e) => setFormNoticePeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Pipeline Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => { setFormStatus(e.target.value as ApplicationStatus); if (formErrors.interviewDate) setFormErrors(p => ({...p, interviewDate: ""})); }}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Applied">Applied / Sourced</option>
                    <option value="Screening">AI Screening</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* Interview date — shown when status is Interviewing */}
                {formStatus === "Interviewing" && (
                  <div className="md:col-span-2">
                    <label className="block font-mono font-bold text-ink mb-1 flex items-center gap-1 uppercase text-[10px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Interview Date *</span>
                    </label>
                    <input
                      type="date"
                      value={formInterviewDate}
                      onChange={(e) => { setFormInterviewDate(e.target.value); if (formErrors.interviewDate) setFormErrors(p => ({...p, interviewDate: ""})); }}
                      className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${formErrors.interviewDate ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                    />
                    {formErrors.interviewDate && <p className="text-danger-brick text-[10px] font-mono mt-1">{formErrors.interviewDate}</p>}
                  </div>
                )}

                {/* Notes and resume */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Resume Copy Paste</label>
                  <textarea
                    rows={4}
                    value={formResume}
                    onChange={(e) => setFormResume(e.target.value)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>

                {/* Submit */}
                <div className="md:col-span-2 border-t border-rule pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-rule text-xs font-mono font-bold text-ink-muted rounded-none hover:bg-canvas"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-edit-candidate"
                    className="px-4 py-2 bg-accent-teal text-white hover:bg-ink text-xs font-mono font-bold rounded-none"
                  >
                    UPDATE FILE
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
