# Pixel Media — Client Portal (Phase 1)

Production-oriented creative services website and client portal for **Pixel Media**.

---

## 🚀 Overview

Pixel Media is a high-end post-production and creative agency platform. **Phase 1** delivers the end-to-end client portal, robust authentication, service catalog, showcase portfolio, support help center, and client pipeline management. The interactive timeline editor is scheduled for **Phase 2** (accessible via a dedicated preview route).

---

## ✨ Features Implemented in Phase 1

### 1. Authentication & Security
- **Email & Password Authentication**: Full sign-up and login with input validation and clear feedback.
- **Google OAuth Login**: Direct integration with Supabase OAuth / client simulation.
- **Session Persistence & Loading States**: Automatic session restore across page refreshes.
- **Protected Client Routes**: Automatic redirect to `/login` with return URL preservation when accessing protected views.
- **Client Data Isolation**: Every client only accesses their own projects, requests, and tickets.
- **Row-Level Security (RLS)**: Complete SQL schema provided in `supabase/schema.sql` enforcing `auth.uid() = client_id` at the database level.
- **Dual Runtime Modes**: Runs seamlessly out of the box with a local persistent client vault, or switches to real Supabase production cloud by setting `.env`.

### 2. Client Dashboard
- **Overview**:
  - Personalized welcome banner with client name and organization.
  - 4 Real-time metric counters: *Active Projects*, *Under Review*, *Completed Work*, and *Active Inquiries*.
  - Quick action shortcuts: *Request New Service*, *Explore Portfolio*, and *Open Support Ticket*.
  - Live production pipeline list with progress bars, status badges, deadlines, and deliverables links.
  - Thoughtful empty states with direct call-to-actions for new clients.
- **Portfolio Showcase**:
  - Creative benchmarks across commercial video, image retouching, audio production, esports highlights, brand design, and 3D motion graphics.
  - Interactive category filter tabs.
  - Detailed modal with project scope, deliverables breakdown, and tech stack tags.
  - Transparent demo content identification.
- **Editing Services (All 6 Disciplines)**:
  1. **Video Editing & Post-Production** (Commercials, speed ramping, color grade, 4K/9:16 cuts)
  2. **High-End Image Retouching** (Frequency separation, 16-bit TIFFs, commercial plates)
  3. **Audio Production & Podcast Mastering** (EBU R128 loudness standards, spectral de-noise, stems)
  4. **Esports & Gaming Content** (Fragmovies, tournament recaps, stream overlays, stinger transitions)
  5. **Brand Identity & Graphic Design** (Vector guidelines, key visuals, digital marketing systems)
  6. **3D Motion Graphics & Animation** (Keynotes, Lottie animations, 3D reveals, particle FX)
  - Dedicated detail view for each discipline with turnaround times, deliverables list, production workflow stages, and supported formats.
  - Direct **"Request This Service"** action launching an interactive modal pre-filled with the category.
- **Help Center & Inquiries**:
  - Studio knowledge base FAQs with real-time text search and accordion expand/collapse.
  - Validated inquiry submission form with urgency priorities and category tags.
  - **"My Inquiries History"** tab tracking client tickets and status.
- **Language Settings (i18n)**:
  - 4 Fully translated languages: **English (en)**, **Hindi (hi)**, **German (de)**, and **French (fr)**.
  - Deep translation architecture translating navigation, overview, status badges, services, help center, and actions.
  - Persisted in localStorage and synchronized with `document.documentElement.lang`.
- **Editor Placeholder (Phase 2 Preview)**:
  - Dedicated `/editor` route featuring a preview of the upcoming browser-native timeline engine (WebGL, WebCodecs, and real-time client collaborative annotations).

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Build Tool**: Vite 8
- **Routing**: React Router DOM 7
- **Database / Auth Client**: `@supabase/supabase-js` 2 (with Row-Level Security)
- **Icons**: Lucide React
- **Design System**: Vanilla CSS with custom tokens (minimal, sleek dark aesthetic, responsive sidebar/mobile drawer, no generic AI styling)
- **Testing**: Vitest + React Testing Library + `@testing-library/jest-dom`

---

## 📂 Project Structure

```
editing/
├── .env.example               # Documented environment variables
├── README.md                  # Project documentation & run guide
├── supabase/
│   └── schema.sql             # Supabase schema, RLS policies, and triggers
├── src/
│   ├── types/
│   │   └── index.ts           # Central TypeScript definitions
│   ├── i18n/
│   │   ├── translations.ts    # Complete EN, HI, DE, FR dictionaries
│   │   └── LanguageContext.tsx# Reusable language provider
│   ├── lib/
│   │   └── supabase.ts        # Supabase client initializer & config check
│   ├── context/
│   │   ├── AuthContext.tsx    # Auth state, login/signup/OAuth, session storage
│   │   └── ClientDataContext.tsx # Client-scoped data store & Supabase integration
│   ├── data/
│   │   ├── initialData.ts     # User-isolated demo seed data generator
│   │   ├── portfolioData.ts   # 6 Service catalogs and portfolio showcase
│   │   └── helpData.ts        # Knowledge base FAQs
│   ├── components/
│   │   ├── common/            # Modal, Toast, Badge, EmptyState
│   │   ├── layout/            # Sidebar, Topbar, ProtectedRoute, DashboardLayout
│   │   ├── dashboard/         # OverviewSection, ServiceRequestModal
│   │   ├── portfolio/         # PortfolioSection
│   │   ├── services/          # ServicesSection
│   │   ├── help/              # HelpCenterSection
│   │   └── editor/            # EditorPlaceholder
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── styles/
│   │   └── index.css          # Core design system and responsive layout
│   ├── test/                  # Test suites (auth, i18n, dashboard)
│   ├── App.tsx                # App routes & provider hierarchy
│   └── main.tsx
```

---

## ⚙️ Setup & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Supabase URL and anonymous public key:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```
> **Note**: If `.env` is left empty, the application runs automatically in **Local Demo Vault** mode, allowing immediate inspection and testing without any cloud setup!

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

### 4. Run Test Suite
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
```

---

## 🔒 Security & Database Row Level Security (RLS)

When deploying to a Supabase project:
1. Open your Supabase Dashboard SQL Editor.
2. Execute the migration script located at `supabase/schema.sql`.
3. The script automatically enables Row Level Security (RLS) on:
   - `profiles` (Users can only read/update their own profile)
   - `projects` (Clients can only read/create their own projects)
   - `service_requests` (Clients can only read/create their own requests)
   - `support_tickets` (Clients can only read/create their own tickets)
   - Automatic trigger `handle_new_user` on `auth.users` to provision client profiles upon sign-up.

---

## 📋 Completion Checklist (Phase 1)

- [x] Sign up, login, Google OAuth, and logout.
- [x] Protected routes with automatic redirects.
- [x] Responsive client dashboard with sidebar and mobile navigation.
- [x] All 6 editing categories visible, usable, and orderable.
- [x] Showcase portfolio with category filtering and deliverables preview.
- [x] Help Center with searchable FAQs, ticket submission, and history.
- [x] 4-language i18n support (English, Hindi, German, French) with persistence.
- [x] Client-specific data access isolation enforced.
- [x] Phase 2 Editor placeholder route prepared.
- [x] Automated test suites passing and production build verified.
