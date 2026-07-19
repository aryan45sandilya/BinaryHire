export type UserRole = "Admin" | "Recruiter" | "HiringManager";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  createdAt: string;
}

export type JobStatus = "Active" | "Closed" | "Draft";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Remote";

export interface JobRole {
  id: string;
  title: string;
  department: string;
  employmentType: EmploymentType;
  salaryRange: string;
  description: string;
  requiredSkills: string[];
  hiringManager: string;
  vacancies: number;
  status: JobStatus;
  location: string;
  experienceRequired: string; // e.g., "3-5 years"
  createdAt: string;
}

export type ApplicationStatus =
  | "Applied"
  | "Screening"
  | "Interviewing"
  | "Offered"
  | "Rejected"
  | "Archived";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: number; // Years of experience
  skills: string[];
  currentCompany: string;
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: number; // in days
  resumeText: string;
  linkedIn?: string;
  gitHub?: string;
  portfolio?: string;
  notes: string;
  applicationStatus: ApplicationStatus;
  interviewDate?: string;
  recruiterId: string;
  recruiterName: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: "Candidate" | "Job" | "Auth" | "System" | "AI";
  targetName: string;
  timestamp: string;
}

export interface AIScreenResult {
  candidateId: string;
  jobRoleId: string;
  matchScore: number; // 0-100
  fitLevel: "High" | "Medium" | "Low";
  summary: string;
  pros: string[];
  cons: string[];
  recommendedQuestions: string[];
  screenedAt: string;
}
