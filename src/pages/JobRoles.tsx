import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Briefcase, 
  MapPin, 
  User as UserIcon, 
  Plus, 
  Trash2, 
  Edit2, 
  X,
  AlertTriangle,
  Users,
  Layers,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JobRole, JobStatus, EmploymentType } from "../types";

export default function JobRoles() {
  const { apiFetch, user } = useAuth();
  
  const [jobs, setJobs] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilterJobs, setStatusFilterJobs] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Form validation errors
  const [jobFormErrors, setJobFormErrors] = useState<Record<string, string>>({});
  const [jobSubmitError, setJobSubmitError] = useState("");

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobRole | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formType, setFormType] = useState<EmploymentType>("Full-time");
  const [formSalary, setFormSalary] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSkills, setFormSkills] = useState("");
  const [formManager, setFormManager] = useState("");
  const [formVacancies, setFormVacancies] = useState(1);
  const [formStatus, setFormStatus] = useState<JobStatus>("Active");
  const [formLocation, setFormLocation] = useState("");
  const [formExpReq, setFormExpReq] = useState("");

  // Role-based access (derived from user, after all hooks)
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/jobs");
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateJobForm()) return;
    setJobSubmitError("");
    try {
      const skillsArr = formSkills.split(",").map(s => s.trim()).filter(Boolean);
      const payload = {
        title: formTitle,
        department: formDept,
        employmentType: formType,
        salaryRange: formSalary,
        description: formDesc,
        requiredSkills: skillsArr,
        hiringManager: formManager,
        vacancies: Number(formVacancies),
        status: formStatus,
        location: formLocation,
        experienceRequired: formExpReq
      };

      const created = await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setJobs([created, ...jobs]);
      setAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Create job opening failed:", err);
      setJobSubmitError(err.message || "Failed to create job. Please try again.");
    }
  };

  const openEditModal = (job: JobRole) => {
    setSelectedJob(job);
    setFormTitle(job.title);
    setFormDept(job.department);
    setFormType(job.employmentType);
    setFormSalary(job.salaryRange);
    setFormDesc(job.description);
    setFormSkills(job.requiredSkills.join(", "));
    setFormManager(job.hiringManager);
    setFormVacancies(job.vacancies);
    setFormStatus(job.status);
    setFormLocation(job.location);
    setFormExpReq(job.experienceRequired);

    setEditModalOpen(true);
  };

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!validateJobForm()) return;
    setJobSubmitError("");
    try {
      const skillsArr = formSkills.split(",").map(s => s.trim()).filter(Boolean);
      const payload = {
        title: formTitle,
        department: formDept,
        employmentType: formType,
        salaryRange: formSalary,
        description: formDesc,
        requiredSkills: skillsArr,
        hiringManager: formManager,
        vacancies: Number(formVacancies),
        status: formStatus,
        location: formLocation,
        experienceRequired: formExpReq
      };

      const updated = await apiFetch(`/api/jobs/${selectedJob.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      setJobs(jobs.map(j => j.id === selectedJob.id ? updated : j));
      setEditModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Update job failed:", err);
      setJobSubmitError(err.message || "Failed to update job. Please try again.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/jobs/${deleteId}`, { method: "DELETE" });
      setJobs(jobs.filter(j => j.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Delete job failed:", err);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDept("");
    setFormType("Full-time");
    setFormSalary("");
    setFormDesc("");
    setFormSkills("");
    setFormManager("");
    setFormVacancies(1);
    setFormStatus("Active");
    setFormLocation("");
    setFormExpReq("");
    setJobFormErrors({});
    setJobSubmitError("");
  };

  // Validate job form fields
  const validateJobForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = "Job title is required.";
    if (!formDept.trim()) errors.dept = "Department is required.";
    if (!formDesc.trim()) errors.desc = "Role description is required.";
    if (formVacancies < 1) errors.vacancies = "At least 1 vacancy is required.";
    setJobFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Filtered jobs for search
  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      j.title.toLowerCase().includes(q) || 
      j.department.toLowerCase().includes(q) ||
      j.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
      j.hiringManager.toLowerCase().includes(q);
    const matchesStatus = statusFilterJobs === "All" || j.status === statusFilterJobs;
    const matchesType = typeFilter === "All" || j.employmentType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const renderRubberStampStatus = (status: JobStatus) => {
    let styleClass = "";
    if (status === "Active") styleClass = "stamp-offered"; // Use the moss green theme for Active
    else if (status === "Closed") styleClass = "stamp-rejected"; // Use the brick red theme for Closed
    else styleClass = "stamp-applied"; // Default black ink for Draft

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
            Job Spec. Folders
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-mono">
            Corporate headcount directives, skill rubrics, and active spec ledgers
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => { resetForm(); setAddModalOpen(true); }}
            id="btn-add-job"
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-teal text-white hover:bg-ink rounded-none text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>PUBLISH NEW JOB SPEC</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface border border-rule p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, department, skills, manager..."
            className="w-full pl-9 pr-4 py-2 bg-canvas/40 border border-rule text-xs focus:bg-white focus:outline-none transition-all placeholder:text-ink-muted/60"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={statusFilterJobs}
            onChange={(e) => setStatusFilterJobs(e.target.value)}
            className="w-full px-3 py-2 bg-canvas/40 border border-rule text-xs focus:bg-white focus:outline-none cursor-pointer font-mono font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-canvas/40 border border-rule text-xs focus:bg-white focus:outline-none cursor-pointer font-mono font-semibold"
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
        <div className="md:col-span-1 text-right">
          <span className="font-mono text-[10px] text-ink-muted font-bold">{filteredJobs.length} SPECS</span>
        </div>
      </div>

      {/* Grid of Job Roles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(n => (
            <div key={n} className="bg-white border border-rule p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-canvas w-1/3" />
              <div className="space-y-2">
                <div className="h-3 bg-canvas w-3/4" />
                <div className="h-3 bg-canvas w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white border border-rule p-16 text-center max-w-md mx-auto">
          <Briefcase className="w-10 h-10 text-ink-muted/40 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-ink">No Job Specifications Filed</h3>
          <p className="text-xs text-ink-muted mt-2 font-mono leading-relaxed">
            SETUP ACTIVE VACANCIES AND CORPORATE BLUEPRINTS TO INITIATE RECRUITMENT MATCHES.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="job-postings-grid">
          {filteredJobs.map((job) => {
            // Apply card index styling
            let borderStyleClass = "ledger-card-index";
            if (job.status === "Closed") borderStyleClass = "ledger-card-index ledger-card-index-brick";
            else if (job.status === "Draft") borderStyleClass = "ledger-card-index ledger-card-index-mustard";
            else borderStyleClass = "ledger-card-index ledger-card-index-moss";

            return (
              <div 
                key={job.id} 
                id={`job-card-${job.id}`} 
                className={`p-6 bg-surface border border-rule flex flex-col justify-between hover:shadow-md transition-shadow relative ${borderStyleClass}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-extrabold text-ink leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-canvas font-mono text-[9px] text-ink border border-rule font-bold uppercase">
                          {job.department}
                        </span>
                        <span className="text-[10px] text-ink-muted font-mono uppercase font-bold">
                          {job.employmentType}
                        </span>
                      </div>
                    </div>
                    <div>
                      {renderRubberStampStatus(job.status)}
                    </div>
                  </div>

                  <p className="text-xs text-ink-muted leading-relaxed font-serif italic border-l-2 border-rule pl-3 py-1 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Requirements details lists */}
                  <div className="grid grid-cols-2 gap-y-2 pt-4 border-t border-rule text-[11px] font-mono text-ink-muted font-bold">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-ink-muted/50 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-extrabold text-[10px] text-ink shrink-0">$</span>
                      <span>{job.salaryRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-ink-muted/50 shrink-0" />
                      <span className="truncate">Mgr: {job.hiringManager}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-ink-muted/50 shrink-0" />
                      <span>Vacancies: <strong className="text-ink">{job.vacancies}</strong></span>
                    </div>
                  </div>

                  {/* Skills indicators */}
                  <div className="space-y-2 pt-2">
                    <span className="block font-mono text-[9px] font-extrabold text-ink uppercase tracking-wider">
                      Required Competency Matrix
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-canvas border border-rule font-mono text-[9px] text-ink-muted font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action buttons - Admin only */}
                <div className="border-t border-rule pt-4 mt-6 flex items-center justify-between">
                  <span className="text-[9px] text-ink-muted font-mono uppercase font-bold">
                    Posted: {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  {isAdmin ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => openEditModal(job)}
                        className="p-1.5 border border-rule bg-white text-ink-muted hover:text-ink hover:border-ink transition-all inline-flex cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(job.id)}
                        className="p-1.5 border border-rule bg-white text-danger-brick hover:bg-danger-brick/10 hover:border-danger-brick transition-all inline-flex cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono text-[9px] text-ink-muted italic">View only</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

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
                <h3 className="font-serif font-bold text-lg text-ink">Confirm Spec Purge</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed font-sans">
                Are you absolutely sure you want to completely purge this job specification folder? Deleting it will irrevocably wipe all candidate matching associations currently tracked on the dashboard funnel.
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
                  id="btn-confirm-delete-job"
                  className="px-3.5 py-1.5 bg-danger-brick hover:bg-ink text-white text-xs font-mono font-bold rounded-none"
                >
                  PURGE SPEC
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Job Modal */}
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
                <h3 className="font-serif text-xl font-bold text-ink">File Corporate Job Opening</h3>
                <button onClick={() => setAddModalOpen(false)} className="text-ink-muted hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans" id="create-job-form">

                {/* Server-side submit error */}
                {jobSubmitError && (
                  <div className="md:col-span-2 flex items-center gap-2 p-3 bg-danger-brick/10 border border-danger-brick/30 text-danger-brick text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{jobSubmitError}</span>
                  </div>
                )}

                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Job Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => { setFormTitle(e.target.value); if (jobFormErrors.title) setJobFormErrors(p => ({...p, title: ""})); }}
                    placeholder="Senior Full Stack Engineer"
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${jobFormErrors.title ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {jobFormErrors.title && <p className="text-danger-brick text-[10px] font-mono mt-1">{jobFormErrors.title}</p>}
                </div>

                {/* Department & Employment Type */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Department *</label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => { setFormDept(e.target.value); if (jobFormErrors.dept) setJobFormErrors(p => ({...p, dept: ""})); }}
                    placeholder="e.g. Engineering"
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${jobFormErrors.dept ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {jobFormErrors.dept && <p className="text-danger-brick text-[10px] font-mono mt-1">{jobFormErrors.dept}</p>}
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Employment Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as EmploymentType)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                {/* Location & Experience requirements */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Location / Working Arrangement</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="San Francisco, CA (Remote)"
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Experience Required</label>
                  <input
                    type="text"
                    value={formExpReq}
                    onChange={(e) => setFormExpReq(e.target.value)}
                    placeholder="e.g. 5+ years"
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>

                {/* Salary & Vacancies */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Salary Range / Budget</label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    placeholder="$150,000 - $180,000"
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Vacancies</label>
                  <input
                    type="number"
                    value={formVacancies}
                    onChange={(e) => { setFormVacancies(Number(e.target.value)); if (jobFormErrors.vacancies) setJobFormErrors(p => ({...p, vacancies: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${jobFormErrors.vacancies ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {jobFormErrors.vacancies && <p className="text-danger-brick text-[10px] font-mono mt-1">{jobFormErrors.vacancies}</p>}
                </div>

                {/* Hiring Manager & Posting Status */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Hiring Manager</label>
                  <input
                    type="text"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Hiring Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as JobStatus)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Skills tags comma list */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>

                {/* Role Description */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Role Description *</label>
                  <textarea
                    rows={4}
                    value={formDesc}
                    onChange={(e) => { setFormDesc(e.target.value); if (jobFormErrors.desc) setJobFormErrors(p => ({...p, desc: ""})); }}
                    placeholder="Write details about the role expectations, day-to-day work, and benefits..."
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none font-sans transition-colors ${jobFormErrors.desc ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {jobFormErrors.desc && <p className="text-danger-brick text-[10px] font-mono mt-1">{jobFormErrors.desc}</p>}
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
                    id="btn-submit-add-job"
                    className="px-4 py-2 bg-accent-teal text-white hover:bg-ink text-xs font-mono font-bold rounded-none"
                  >
                    PUBLISH OPENING
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Job Modal */}
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
                <h3 className="font-serif text-xl font-bold text-ink">Modify Specification Opening</h3>
                <button onClick={() => setEditModalOpen(false)} className="text-ink-muted hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditJob} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans" id="edit-job-form">

                {/* Server-side submit error */}
                {jobSubmitError && (
                  <div className="md:col-span-2 flex items-center gap-2 p-3 bg-danger-brick/10 border border-danger-brick/30 text-danger-brick text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{jobSubmitError}</span>
                  </div>
                )}

                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Job Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => { setFormTitle(e.target.value); if (jobFormErrors.title) setJobFormErrors(p => ({...p, title: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${jobFormErrors.title ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {jobFormErrors.title && <p className="text-danger-brick text-[10px] font-mono mt-1">{jobFormErrors.title}</p>}
                </div>

                {/* Dept & Type */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Department *</label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => { setFormDept(e.target.value); if (jobFormErrors.dept) setJobFormErrors(p => ({...p, dept: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${jobFormErrors.dept ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {jobFormErrors.dept && <p className="text-danger-brick text-[10px] font-mono mt-1">{jobFormErrors.dept}</p>}
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Employment Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as EmploymentType)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                {/* Location & Experience */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Location / Working Arrangement</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Experience Required</label>
                  <input
                    type="text"
                    value={formExpReq}
                    onChange={(e) => setFormExpReq(e.target.value)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>

                {/* Salary & Vacancies */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Salary Range / Budget</label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Vacancies</label>
                  <input
                    type="number"
                    value={formVacancies}
                    onChange={(e) => { setFormVacancies(Number(e.target.value)); if (jobFormErrors.vacancies) setJobFormErrors(p => ({...p, vacancies: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none transition-colors ${jobFormErrors.vacancies ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {jobFormErrors.vacancies && <p className="text-danger-brick text-[10px] font-mono mt-1">{jobFormErrors.vacancies}</p>}
                </div>

                {/* Manager & Status */}
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Hiring Manager</label>
                  <input
                    type="text"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Hiring Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as JobStatus)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Skills */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    className="w-full px-3 py-2 border border-rule rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block font-mono font-bold text-ink mb-1 uppercase text-[10px]">Role Description *</label>
                  <textarea
                    rows={4}
                    value={formDesc}
                    onChange={(e) => { setFormDesc(e.target.value); if (jobFormErrors.desc) setJobFormErrors(p => ({...p, desc: ""})); }}
                    className={`w-full px-3 py-2 border rounded-none bg-canvas/20 focus:bg-white text-xs focus:outline-none font-sans transition-colors ${jobFormErrors.desc ? "border-danger-brick bg-danger-brick/5" : "border-rule"}`}
                  />
                  {jobFormErrors.desc && <p className="text-danger-brick text-[10px] font-mono mt-1">{jobFormErrors.desc}</p>}
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
                    id="btn-submit-edit-job"
                    className="px-4 py-2 bg-accent-teal text-white hover:bg-ink text-xs font-mono font-bold rounded-none"
                  >
                    UPDATE DIRECTIVE
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
