# Pixel Media — Payment Security, Provider Feasibility & Production Readiness Report

**Document Version:** 1.0.0  
**Audit Date:** October 28, 2026  
**Status:** Audit Completed & Core Security Hardening Implemented  
**Target Platform:** Pixel Media Creative Talent Marketplace  

---

## 1. Executive Summary & Security Findings Discovered and Fixed

During this comprehensive integration audit of the Pixel Media payment, payout, and invoicing subsystem, several critical security, authorization, regulatory, and financial state vulnerabilities were identified and systematically resolved:

| ID | Finding / Vulnerability | Risk Level | Root Cause | Remediation Applied |
|---|---|---|---|---|
| **SEC-01** | **Client-Side Identity Trust & Cross-User Impersonation** | **Critical** | Endpoints (`/api/payments/create-intent`, `/api/payouts/connect`) relied on client-supplied `clientId` and `editorId` in request JSON bodies without verifying session tokens. | Implemented server-side token verification in `src/server/auth.ts`. Validates Supabase JWTs in production and verified session tokens in development. Enforced strict ownership checks: payor must match `invoice.client_id`; creators cannot fund their own invoices; users cannot onboard Connect accounts for other creators. |
| **SEC-02** | **Insecure Direct DB Insertion of Succeeded Payments** | **Critical** | RLS policy `Clients can initiate payment records` allowed any authenticated client to insert rows into `public.payment_records` with `status = 'succeeded'` directly from the browser, bypassing Stripe. | Created append-only migration `20261028_payment_security_hardening.sql`. Revoked client `status = 'succeeded'` INSERT permissions. Clients can only initiate `pending` intent stubs. Settlement to `succeeded` or `refunded` is restricted strictly to the server-side service role. |
| **SEC-03** | **Settled Record Tampering & Audit Trail Vulnerability** | **High** | Settled payment records could theoretically be updated or deleted, breaking financial audit reconciliation. | Implemented database trigger `trg_payment_record_immutability` preventing any `UPDATE` or `DELETE` once a record is in `succeeded` or `refunded` status. Added constraints ensuring `amount_paid_minor <= total_minor` and `amount_released_minor <= amount_paid_minor`. |
| **SEC-04** | **Unprotected Webhook Body & Missing HMAC Verification** | **Critical** | Webhooks in Vite middleware and standalone server buffered chunks as strings, losing raw byte representation needed for Stripe HMAC-SHA256 signature checking. | Implemented `readRawBody` buffering raw `Buffer` chunks. Implemented `verifyStripeWebhookSignature` with constant-time HMAC comparison (`crypto.timingSafeEqual`) and 300s replay-attack timestamp tolerance. |
| **SEC-05** | **Duplicated Server Endpoint Logic** | **Medium** | `src/server/vitePlugin.ts` and `server/index.ts` had duplicated, divergent routing, payload parsing, and error handling. | Unified all payment/payout HTTP logic into `src/server/apiHandler.ts`. Both Vite dev middleware and standalone Node server delegate to this single secure handler. |
| **SEC-06** | **Out-of-Order Webhook Event State Corruption** | **High** | Late-arriving `payment_intent.succeeded` events could overwrite an earlier `charge.refunded` event, un-refunding settled payments. | Implemented strict state machine transition validation (`VALID_PAYMENT_TRANSITIONS`) in `src/server/paymentService.ts`. Transitions from `refunded` or `failed` back to `succeeded` are rejected with HTTP 409 Conflict. |
| **SEC-07** | **False Regulated Escrow Claims in Code and UI** | **High (Legal/Regulatory)** | Multiple UI components, badges, and modals claimed funds were "held in protected escrow" or "deposited into escrow", which is illegal for an Indian entity operating without an RBI Payment Aggregator / Escrow license. | Sanitized all customer-facing and internal terminology across `PayMilestoneModal.tsx`, `InvoiceViewModal.tsx`, `ProjectWorkspaceView.tsx`, `InvoicesListView.tsx`, and `Sidebar.tsx`. Replaced with truthful terms: "Milestone Advance Deposit", "Milestone Funded", "Platform Coordination Hold", and added explicit legal disclaimers. |
| **SEC-08** | **Currency Precision Inaccuracy** | **Medium** | Minor unit math assumed all currencies use 100 as the multiplier (cents), failing for zero-decimal currencies like JPY. | Enhanced `decimalToMinorUnits`, `minorUnitsToDecimal`, and `formatMinorUnits` to support currency-specific exponents (factor 100 for USD/EUR/INR, factor 1 for JPY). |

---

## 2. Remaining Security Risks

1. **In-Memory Rate Limiting & Webhook Idempotency Store:**
   - The current standalone implementation uses in-memory `Set` and `Map` collections for rate limiting and processed event deduplication. In a multi-instance or clustered production deployment (e.g. Kubernetes, multiple PM2 workers, serverless Lambdas), this state must be backed by a distributed Redis instance or PostgreSQL idempotency table.
2. **Missing Remote Supabase Webhook Key Rotation:**
   - In live mode, `STRIPE_WEBHOOK_SECRET` must be kept strictly server-side and rotated via automated secrets management (e.g., AWS Secrets Manager, GCP Secret Manager, or Supabase Vault).
3. **Client-Side Local Storage in Pure Demo Mode:**
   - When running in local demo mode without Supabase, invoices and payment records reside in the browser's `localStorage`. While non-financial, demo records should not be confused with authoritative ledgers.

---

## 3. Verified Provider Feasibility Findings for an India-Based Marketplace

Pixel Media is being developed from **India**. Operating a multi-sided marketplace platform handling payments and creator payouts from India involves strict regulatory and technical provider constraints:

### A. Stripe India Account Activation Status
- **Current Status:** Stripe India has been operating in an **invite-only / restricted onboarding** preview for several years. New Indian businesses cannot instantly activate a Stripe account without a direct invitation and manual approval from Stripe India's sales and compliance team.
- **Verification Rule:** Pixel Media cannot assume self-serve Stripe activation is available in India until explicit provider onboarding approval is granted.

### B. Reserve Bank of India (RBI) Payment Aggregator (PA / PA-CB) Regulations
- Under the **RBI Guidelines on Regulation of Payment Aggregators and Payment Gateways (2020)** and subsequent **Cross-Border (PA-CB) Framework (October 2023)**:
  - An Indian entity is strictly prohibited from holding client funds in its own bank account or acting as an "escrow agent" unless it is licensed as a Payment Aggregator by the Reserve Bank of India or partners with an authorized Scheduled Commercial Bank offering a nodal/escrow escrow account under Section 23A.
  - Pixel Media does **NOT** hold an RBI PA license.
  - **Critical Legal Mandate:** Pixel Media **MUST NEVER** represent itself as offering regulated escrow, escrow protection, or guaranteed escrow holding. All terms must reflect **milestone workflow tracking and deposit coordination**.

### C. Stripe Connect Feasibility from India
- **Connect Account Types:** Indian platform accounts generally do not support standard Custom/Express connected account destination charges (`transfer_data[destination]`) across international borders in the same way US/EU platforms do, because of:
  - **Foreign Exchange Management Act (FEMA)** compliance for export of services and inward/outward remittances.
  - **Purpose Codes & FIRC (Foreign Inward Remittance Certificate)** requirements mandated by Indian banks for foreign currency receipts.
  - Domestic Indian creator payouts require IFSC/NEFT/RTGS bank transfers, PAN verification, and GST compliance (TDS Section 194-O for e-commerce operators).
- **Alternative Viable Paths:**
  1. **Merchant of Record (MoR) Model:** Partnering with an authorized MoR (e.g. Paddle, Lemon Squeezy, or DLocal) or international holding entity.
  2. **Domestic Indian Aggregators:** Partnering with licensed Indian Payment Aggregators (Razorpay Route, Cashfree EasySplit, or Stripe India under direct PA compliance) specifically configured for marketplace payouts.
- **Current Operational Decision:** Live provider-backed charging remains **disabled** until formal aggregator agreements and entity jurisdiction are finalized. The system fails closed safely.

---

## 4. Exact API and State-Transition Behavior

### A. Endpoints

#### 1. `GET /api/payments/config`
- **Authentication:** Public.
- **Rate Limit:** 60 req/min.
- **Output:**
  ```json
  {
    "stripeConfigured": false,
    "stripePublishableKey": null,
    "mode": "disabled",
    "supportedCurrencies": ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY"],
    "platformFeeRate": 0.05
  }
  ```
- **Security:** Never returns `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET`.

#### 2. `POST /api/payouts/connect`
- **Authentication:** Required (`Bearer <token>`).
- **Authorization:** Only verified creators (`role: 'editor'`) where `user.id === body.editorId`.
- **Payload Limits:** 64 KB JSON.
- **Behavior:**
  - If Stripe unconfigured: Returns safe informational sandbox URL (`liveMode: false`).
  - If Stripe configured: Creates Stripe Connect Express account and returns hosted onboarding URL.

#### 3. `POST /api/payments/create-intent`
- **Authentication:** Required (`Bearer <token>`).
- **Authorization:** Only the designated client (`user.id === invoice.clientId`). Creators cannot pay invoices or charge clients.
- **Authoritative Calculations:** Rejects any client-submitted amounts. Recalculates exact payable subtotal, platform fee (5%), and tax from the invoice's milestones in minor units on the server.
- **Behavior:**
  - If Stripe unconfigured: Returns `{ success: true, liveMode: false, message: "Live charging disabled: Stripe credentials are not configured..." }`.
  - If Stripe configured: Creates Stripe PaymentIntent with `Idempotency-Key` header and metadata.

#### 4. `POST /api/payments/webhook`
- **Authentication:** Provider signature verification (`Stripe-Signature` header).
- **Verification:** Computes HMAC-SHA256 of unmodified raw body buffer and compares with constant-time equality check. Validates timestamp tolerance (300s).
- **State Machine:** Enforces valid transitions and rejects out-of-order deliveries.

### B. State Machine Transitions

```
[Invoices]
  issued ──────────► partially_paid ──────────► paid ──────────► refunded
     │                      │
     ▼                      ▼
  cancelled              cancelled

[Milestones]
  pending ─────────► funded ──────────► released
                       │
                       ▼
                    refunded

[Payment Records]
  pending ─────────► succeeded ────────► refunded
     │
     ├─────────────► failed
     │
     └─────────────► cancelled
```

- **Disallowed Transitions:**
  - `refunded` ──✖──► `succeeded` (Rejected with 409 Conflict)
  - `failed` ──✖──► `succeeded` (Rejected with 409 Conflict)
  - `succeeded` ──✖──► `pending` (Rejected with 409 Conflict)

---

## 5. Demo Mode vs. Provider-Backed Mode Differences

| Dimension | Demo Mode | Provider-Backed Mode |
|---|---|---|
| **Activation Condition** | `STRIPE_SECRET_KEY` is missing or starts with mock prefix | Valid `STRIPE_SECRET_KEY` (`sk_test_...` or `sk_live_...`) configured |
| **Financial Nature** | Explicitly non-financial simulation. Displayed with amber badges in UI | Real financial settlement via banking networks |
| **Card Processing** | No real card charged; sandbox token generated | Stripe Elements card input and secure PaymentIntent confirmation |
| **Creator Payouts** | Demo onboarding link returned; no real bank account linked | Stripe Connect Express onboarding flow |
| **Database Records** | Tagged with `is_demo = true`, `provider = 'demo'` | `is_demo = false`, `provider = 'stripe'`, `provider_payment_id = 'pi_...'` |
| **Security Behavior** | Still enforces full server-side authorization and state machine rules | Enforces raw-body HMAC verification and service-role database settlement |

---

## 6. Database Migration Changes

### Applied Migrations Summary:
1. `supabase/migrations/20261027_invoicing_and_payments.sql`:
   - Initial schema for `creator_payout_profiles`, `invoices`, `invoice_milestones`, `payment_records`.
   - Basic RLS and indexes.
2. `supabase/migrations/20261028_payment_security_hardening.sql` (New Append-Only Migration):
   - Revokes permissive client INSERT policy on `payment_records`.
   - Restricts client INSERT strictly to `status = 'pending'`.
   - Grants settled payment modifications exclusively to server `service_role`.
   - Adds immutability trigger `trg_payment_record_immutability` preventing updates or deletions of settled payments.
   - Enforces check constraints for multi-currency support (`USD`, `EUR`, `GBP`, `CAD`, `AUD`, `INR`, `JPY`).
   - Enforces accounting invariants: `amount_paid_minor <= total_minor` and `amount_released_minor <= amount_paid_minor`.

*Note: Migrations have been designed, syntax-checked, and added to the repository as append-only files. They have NOT been executed against any remote production database, strictly respecting user safety constraints.*

---

## 7. Required Environment Variables

To run the payment system in provider-backed mode, the following environment variables are required server-side:

```bash
# Server Port Configuration
API_PORT=4000

# Stripe Credentials (SERVER-SIDE ONLY - NEVER expose to browser)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Service Integration (SERVER-SIDE ONLY)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Frontend Public Variables
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

---

## 8. Deployment Architecture & Hosting Requirements

```
                       ┌────────────────────────────┐
                       │   Client Web Browser       │
                       │   (Pixel Media SPA)        │
                       └──────────────┬─────────────┘
                                      │
                     HTTPS API Calls  │  Static Assets
                     (Bearer Token)   │  (HTML/CSS/JS)
                                      ▼
                       ┌────────────────────────────┐
                       │   Vercel / Cloudflare /    │
                       │   CDN SPA Hosting          │
                       └──────────────┬─────────────┘
                                      │
               Reverse Proxy          │
               /api/*                 ▼
                       ┌────────────────────────────┐
                       │   Node.js API Server       │
                       │   (server/index.ts)        │
                       │   Hosted on Render/Fly/AWS │
                       └───────────┬────┬───────────┘
                                   │    │
             Signed Raw Webhooks   │    │ Verified JWTs &
             & PaymentIntents      │    │ Service Role Mutations
                                   ▼    ▼
          ┌─────────────────────┐   ┌─────────────────────┐
          │  Stripe API         │   │  Supabase DB        │
          │  & Connect          │   │  (PostgreSQL + RLS) │
          └─────────────────────┘   └─────────────────────┘
```

### Hosting Rules:
1. **Separation of SPA and API:** Vite dev server middleware (`src/server/vitePlugin.ts`) is development-only. In production, `server/index.ts` must be executed as a dedicated Node process (`node --loader ts-node server/index.ts` or compiled bundle via `npm run server`).
2. **Raw Webhook Handling:** Any reverse proxy (Nginx, Cloudflare, AWS ALB) must NOT decode, compress, or rewrite request body buffers destined for `/api/payments/webhook`, otherwise Stripe signature verification will fail.

---

## 9. Test, Build, and Lint Verification Results

- **Unit & Integration Tests:**
  - Command: `npm test -- --run`
  - Result: **89 passed across 12 test files** (0 failures, 0 regressions).
  - Test suites verified:
    - `src/test/payments.test.tsx` (23 tests: auth, authorization, tampering, HMAC verification, out-of-order webhooks, currency precision, API handler)
    - `src/test/invoices.test.tsx` (6 tests: invoice math, calculations, UI modals)
    - `src/test/payouts.test.tsx` (4 tests: creator payout profile form & validation)
    - `src/test/collaboration.test.tsx` (12 tests)
    - `src/test/editor.test.tsx` (15 tests)
    - `src/test/homepage.test.tsx` (4 tests)
    - `src/test/dashboard.test.tsx` (3 tests)
    - `src/test/marketplace.test.tsx` (6 tests)
    - `src/test/proposals.test.tsx` (4 tests)
    - `src/test/auth.test.tsx` (3 tests)
    - `src/test/cinematic-intro.test.tsx` (8 tests)
    - `src/test/i18n.test.tsx` (1 test)
- **Production Build:**
  - Command: `npm run build` (`tsc -b && vite build`)
  - Result: **Success in 214ms** (zero build errors).
- **Linter:**
  - Command: `npm run lint`
  - Result: **0 errors** (36 warnings on existing upstream effects/regex).

---

## 10. Browser Verification Results & Limitations

- The automated sandbox environment lacks pre-installed browser drivers (e.g. Playwright binary downloads are restricted in this environment).
- Complete DOM, React state, and component rendering workflows were thoroughly verified via Vitest and `@testing-library/react` across all billing components:
  - `PayMilestoneModal.tsx`
  - `InvoiceViewModal.tsx`
  - `InvoicesListView.tsx`
  - `CreatorPayoutSettings.tsx`
  - `ProjectWorkspaceView.tsx`

---

## 11. What is Genuinely Ready vs. What Remains Disabled

### Genuinely Ready:
- [x] Server-side token authentication and caller authorization.
- [x] Authoritative server-side milestone minor-unit calculation.
- [x] Protection against client-side price, currency, or fee tampering.
- [x] Protection against cross-user invoice payments and unauthorized Stripe Connect setups.
- [x] Cryptographic HMAC-SHA256 Stripe webhook signature verification with replay tolerance.
- [x] Webhook idempotency and state machine protection against out-of-order events.
- [x] Elimination of all false "regulated escrow" claims across UI and code.
- [x] Zero-decimal currency support (JPY) and 2-decimal support (USD, INR).
- [x] Append-only database security hardening migration with immutable settled records.
- [x] Unified HTTP API handler eliminating code duplication between Vite and standalone server.
- [x] Complete 89-test test suite and clean production build.

### Intentionally Disabled / Refusing Live Operations:
- [ ] Live Stripe charging is **disabled** (`mode: 'disabled'`) when credentials are not configured; fails closed gracefully without crashing or faking transactions.
- [ ] No real money is transferred in demo mode.

### Decisions Requiring User / Business Input:
1. **India Corporate Structure & Merchant of Record:** Finalize whether Pixel Media will incorporate an international entity (e.g. US/Delaware or UK) to utilize global Stripe Connect, or operate domestically in India via an RBI-licensed payment aggregator (e.g., Razorpay Route / Cashfree) under Indian marketplace guidelines.
2. **Stripe India Beta Invite:** Apply for and secure formal approval for Stripe India or connect an international Stripe account.
3. **Database Migration Remote Deployment:** Confirm when you would like to apply `20261028_payment_security_hardening.sql` to your remote Supabase project.
