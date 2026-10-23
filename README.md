# Pixel Pedia — Freelancing Marketplace for Video Editors & Creators

A production-grade, two-sided freelancing marketplace connecting clients (studios, creators, brands) with world-class video editors, colorists, sound designers, and motion graphics artists.

---

## 🚀 Overview

Pixel Pedia is a modern freelancing platform tailored for high-end post-production workflows:
- **Clients** discover vetted editors by discipline and software, inspect verified showreels and deliverables, and send structured project briefs with milestones and budget ranges.
- **Editors** build public portfolio showcases, set their starting rate cards and availability, manage incoming inquiries, and deliver master projects.
- **Admins** manage content moderation, trust & safety reports, and category taxonomy.
- **Seamless Dual-Mode**: Operates out of the box with an offline-first **Local Demo Vault** (pre-populated with realistic creators and portfolios) and connects seamlessly to **Supabase Cloud** for production persistence with Row Level Security (RLS).

---

## ✨ Core Features & User Workflows

### 1. Multi-Role Authentication & Onboarding
- **Role Selection on Signup**: Users choose between **Client (Hire an Editor)** or **Editor (Creator / Freelancer)**.
- **Instant Role Switcher**: A switcher in the sidebar and top navigation allows evaluators to toggle between **Client Mode**, **Editor Mode**, and **Admin Mode** in one click.
- **Session Persistence**: Automatic session restoration in both Supabase cloud and local mode.
- **Role-Aware Profile**: Stores bio, headline, experience tier (`beginner` vs `pro`), starting price, location, availability (`available`, `busy`, `unavailable`), and portfolio website.

### 2. Talent Discovery & Live Search (`/explore`)
- **Multi-Filter Engine**:
  - Filter by discipline categories (Commercial Film, 3D Motion, DaVinci Grading, Sound Design, Esports, Retouching).
  - Filter by production software (Adobe Premiere Pro, After Effects, DaVinci Resolve, Blender, Cinema 4D, Photoshop, etc.).
  - Filter by experience level (`Pro` verified vs `Rising Creator`).
  - Filter by real-time availability (`Available Now` vs `Busy`).
  - Sort by relevance, starting rate (low to high, high to low).
- **Editor Cards**:
  - High-res avatar with online availability indicator.
  - Headline, location, and verified badges.
  - Interactive portfolio reel preview (3 hero plates).
  - Software proficiency chips.
  - Starting investment price and direct "Hire" CTA.

### 3. Editor Public Profile & Portfolio (`/editors/:id`)
- **Profile Header**: Cover banner, avatar, headline, bio, experience badge, availability status, and rate card.
- **Tabbed Experience**:
  - **Portfolio Showcase**: Category-filtered gallery of commercial cuts and showreels.
  - **Services & Software**: List of disciplines offered and full software stack.
  - **About & Workflow**: Creative philosophy and client history.
- **Portfolio Detail Lightbox**:
  - High-definition media preview and external video playback (YouTube/Vimeo/Behance/Drive).
  - Technical specs: Lead editor role, duration/year, software used tags, and full description.
  - Direct "Start a Project Like This" button that pre-populates the brief modal.
  - Trust & Safety reporting trigger.

### 4. Structured Project Brief & Hire Modal
- Eliminates vague messages by structuring project requests:
  - **Project Title & Discipline**: Category classification.
  - **Creative Brief**: Storytelling guidance, pacing, and target audience.
  - **Deliverables**: Format requirements (4K Master, 9:16 vertical social cuts, dialogue stems, project files).
  - **Timeline**: Target delivery deadline date.
  - **Budget**: Min/Max USD range or "Ask for custom quote" toggle.
  - **Inspiration Links**: Dynamic add/remove inputs for reference URLs.
  - **Footage Storage**: Cloud drive links (Drive, Dropbox, Frame.io) and asset notes.

### 5. Role-Adaptive Dashboard (`/dashboard`)
- **Client View**:
  - Overview KPI counters: Active Briefs, Completed Work, Available Talent.
  - **My Project Briefs** tab (`/dashboard/requests`): Track all submitted briefs, status badges (`pending`, `accepted`, `completed`, `declined`), and full brief modal.
- **Editor View**:
  - Overview KPI counters: Pending Inquiries, Active Jobs, Published Works, Starting Rate.
  - **Incoming Client Requests** tab (`/dashboard/requests`): Inspect client briefs with one-click **Accept Brief**, **Decline**, or **Mark Completed** actions.
  - **Portfolio Manager** tab (`/dashboard/portfolio`): Visual CRUD to add new pieces, edit titles/tags, toggle **Publish / Unpublish**, and delete works.
  - **Profile & Rates** tab (`/dashboard/profile`): Edit professional headline, starting rates, availability toggle, experience tier, and public directory visibility.
- **Admin View**:
  - **Trust & Safety Moderation Queue** (`/dashboard/moderation`): Investigate user reports with **Resolve & Action** or **Dismiss** workflows.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Vanilla CSS Design System with dark mode tokens (`src/styles/marketplace.css`)
- **Routing**: React Router 7
- **Database & Auth**: Supabase (PostgreSQL with RLS) + Local Demo Vault
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library + jsdom

---

## 📦 Project Structure

```
├── src/
│   ├── components/
│   │   ├── dashboard/         # Role-based dashboard views (Requests, Portfolio, Profile, Moderation)
│   │   ├── layout/            # Sidebar with role switcher, Topbar, DashboardLayout, ProtectedRoute
│   │   ├── marketplace/       # MarketplaceNavbar, ProjectRequestModal, PortfolioDetailModal, ReportModal
│   │   └── common/            # Toast, Modal, Badge, EmptyState
│   ├── context/
│   │   ├── AuthContext.tsx    # Role-based auth context with Supabase + Local demo mode
│   │   └── ClientDataContext.tsx
│   ├── data/
│   │   ├── categories.ts      # Taxonomy of editing disciplines and services
│   │   └── demoEditors.ts     # Realistic demo creators and portfolios
│   ├── hooks/
│   │   └── useMarketplace.ts  # Dual-mode data hooks (discovery, profile, portfolio, briefs, reports)
│   ├── pages/
│   │   ├── HomePage.tsx       # Flagship marketplace landing page
│   │   ├── ExplorePage.tsx    # Editor discovery and search directory
│   │   ├── EditorProfilePage.tsx # Public creator profile and reel showcase
│   │   ├── LoginPage.tsx      # Authentication login
│   │   └── SignupPage.tsx     # Role-aware registration (Client vs Editor)
│   ├── styles/
│   │   ├── index.css          # Core design tokens
│   │   └── marketplace.css    # Marketplace design system
│   ├── test/                  # Comprehensive Vitest test suite (6 test suites, 32 tests)
│   └── types/index.ts         # Marketplace data contracts
├── supabase/
│   └── marketplace_schema.sql # Complete PostgreSQL schema with RLS and seed data
└── README.md
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Supabase URL and anonymous key:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```
*(If left unset, the application automatically runs in **Local Demo Vault** mode with instant access to demo creators, briefs, and portfolios!)*

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Test Suite
```bash
npm test -- --run
```

### 5. Build for Production
```bash
npm run build
```

---

## 🔒 Database & Row Level Security (RLS)

To deploy to Supabase:
1. Open your Supabase Dashboard SQL Editor.
2. Run the script located at `supabase/marketplace_schema.sql`.
3. RLS policies secure:
   - `profiles`: Publicly readable if published; writable only by profile owner.
   - `portfolio_items`: Publicly readable if published; writable only by editor.
   - `project_requests`: Read/write access restricted strictly to involved client and editor.
   - `reports`: Writable by reporter; readable/updatable by admins.
