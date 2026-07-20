<div align="center">

<br/>

```
██████╗ ██╗███╗   ██╗ █████╗ ██████╗ ██╗   ██╗██╗  ██╗██╗██████╗ ███████╗
██╔══██╗██║████╗  ██║██╔══██╗██╔══██╗╚██╗ ██╔╝██║  ██║██║██╔══██╗██╔════╝
██████╔╝██║██╔██╗ ██║███████║██████╔╝ ╚████╔╝ ███████║██║██████╔╝█████╗  
██╔══██╗██║██║╚██╗██║██╔══██║██╔══██╗  ╚██╔╝  ██╔══██║██║██╔══██╗██╔══╝  
██████╔╝██║██║ ╚████║██║  ██║██║  ██║   ██║   ██║  ██║██║██║  ██║███████╗
╚═════╝ ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝
```

### *The Recruiter's Physical Ledger — A Modern Hiring OS*

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=flat-square&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)

<br/>

> A full-stack recruitment management platform with an **editorial ledger desk aesthetic** —  
> physical rubber stamps, fanned index cards, binder rings, and flip-counter metrics.

<br/>

</div>

---

## ✦ Overview

**BinaryHire** is a complete Applicant Tracking System (ATS) built as a single-page React application backed by an Express REST API. It covers the entire hiring workflow — from sourcing candidates and managing job specs to AI-powered screening and scheduling interviews — all wrapped in a distinctive physical stationery UI.

---

## ✦ Features

### 🔐 Authentication
- JWT-based login & registration with PBKDF2 password hashing
- Persistent sessions via `localStorage`
- Role-based access control — **Admin**, **Recruiter**, **HiringManager**
- Auto-logout on token expiry (401)

### 📋 Dashboard
- **Flip-counter metrics** — Active Roles, Sourced Talent, Pending Offers, Hired This Month (real date-range)
- **Fanning index card cabinet** — hover to fan out the latest candidates
- **Physical hiring sieve funnel** — live percentages across all pipeline stages
- **Desk day-planner** — real interview dates from candidate data, current week auto-calculated
- **Activity audit log** — timestamped feed of all recruiter actions
- **AI Co-Pilot** — Gemini-powered strategic hiring insight widget

### 👥 Candidates
- Full CRUD — add, edit, delete, duplicate candidates
- **Dual view** — card catalog (index cards) + ledger table rows
- Search by name, email, or skills
- Filter by pipeline status, experience level, and favorites
- **Inline form validation** — required fields, email format, phone format, interview date guard
- AI screening against any job spec (Gemini or mock fallback)
- CSV export of the current filtered list
- **RBAC gating** — edit/delete restricted to the owning recruiter or Admins

### 💼 Job Roles
- Full CRUD for job specifications
- **Search & filter** — by title, department, skills, manager; filter by status and type
- **Physical rubber-stamp** status badges (Active / Draft / Closed)
- **Inline form validation** — title, department, description, vacancies
- Admin-only publish, edit, and delete controls

### ⚙️ Settings
- Update name, department, avatar URL
- Change password with server-side PBKDF2 re-hash
- Employee badge display card

### 🏠 Landing Page
- Hero, feature highlights, stats strip, FAQ accordion, CTA section

---

## ✦ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4 |
| **Animations** | Motion (Framer Motion v12) |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express 4 |
| **Database** | File-based JSON store (`server-db.json`) |
| **Auth** | Custom JWT — HMAC-SHA256 + PBKDF2 |
| **AI** | Google Gemini (`@google/genai`) with mock fallback |
| **Build** | Vite 6, ESBuild, tsx |

---

## ✦ Project Structure

```
BinaryHire/
├── server.ts                  # Express REST API + Vite dev server
├── server-db.json             # Auto-generated JSON database
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Root layout, routing, auth flow
│   ├── index.css              # Tailwind v4 theme tokens + ledger styles
│   ├── types.ts               # All TypeScript interfaces & enums
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state, apiFetch helper
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx    # Desktop + mobile drawer navigation
│   └── pages/
│       ├── LandingPage.tsx    # Marketing landing page
│       ├── AuthPage.tsx       # Login / Register
│       ├── Dashboard.tsx      # Ledger overview & metrics
│       ├── Candidates.tsx     # Candidate CRUD & AI screening
│       ├── JobRoles.tsx       # Job spec CRUD & search
│       └── Settings.tsx       # Profile & password settings
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## ✦ Demo Credentials

Two seed accounts are pre-loaded:

| Role | Email | Password |
|---|---|---|
| **Admin** | `aryan45sandilya@gmail.com` | `password123` |
| **Recruiter** | `recruiter@binaryhire.co` | `password123` |

> The Admin account can publish/edit/delete job specs and manage all candidates.  
> The Recruiter account can only edit candidates they personally sourced.

---

## ✦ API Endpoints

```
POST   /api/auth/register       Register a new user
POST   /api/auth/login          Login and receive JWT
GET    /api/auth/me             Get current user profile
PUT    /api/auth/settings       Update profile / password

GET    /api/jobs                List all job roles
POST   /api/jobs                Create job role (auth required)
PUT    /api/jobs/:id            Update job role (auth required)
DELETE /api/jobs/:id            Delete job role (auth required)

GET    /api/candidates          List all candidates
POST   /api/candidates          Add candidate (auth required)
PUT    /api/candidates/:id      Update candidate (auth required)
DELETE /api/candidates/:id      Delete candidate (auth required)
POST   /api/candidates/:id/favorite   Toggle favorite status

GET    /api/logs                Recent activity logs
POST   /api/ai/screen           AI candidate screening (Gemini)
POST   /api/ai/insights         AI pipeline insights (Gemini)
---

## ✦ Design System

The UI uses a custom **physical ledger desk** aesthetic defined in `src/index.css`:

| Token | Value | Usage |
|---|---|---|
| `--color-canvas` | `#F5F0E8` | Page background (aged paper) |
| `--color-surface` | `#FDFAF5` | Card surfaces |
| `--color-ink` | `#1A1A18` | Primary text |
| `--color-ink-muted` | `#6B6B5A` | Secondary text |
| `--color-accent-teal` | `#2A7B6F` | Primary actions |
| `--color-accent-mustard` | `#C4933F` | Highlights, favorites |
| `--color-success-moss` | `#4A7C59` | Success states |
| `--color-danger-brick` | `#8B3A3A` | Error & delete actions |

**Fonts:** `Fraunces` (serif headings) · `IBM Plex Mono` (labels) · `IBM Plex Sans` (body)

---

<div align="center">

<br/>

Made with ☕ and a lot of ledger paper.

**[⬆ Back to top](#)**

</div>
