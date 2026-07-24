# Project Handoff — Current State

Concise, factual snapshot for a brand-new session to continue the project. No re-audit; facts gathered from git, migrations, architecture docs, and the latest phase reports.

## 1. Branch & latest commit
- **Branch:** `refactor/nextjs-innovation-platform` (main branch is `main`; not pushed)
- **Latest commit:** `b0cde54` — docs: document Phase 5B document-analysis pipeline

## 2. Completed phases
All complete. Doc paths under `docs/architecture/` unless noted.

| Phase | Status | Doc | Key doc commit |
|---|---|---|---|
| 0 — MVP blueprint | ✅ | `docs/*.md` (mvp-scope, authorization, roles-and-permissions, data-dictionary, status-definitions, compliance-rules, document-analysis, …) | `7a7992b` |
| 1B — Foundation audit | ✅ | `docs/audits/phase-1b-foundation-audit.md` (+ coverage matrix) | `8b7e220` |
| 2A — Schema alignment | ✅ | `phase-2a-schema-alignment.md` | `2e90282`, `f4c7acf`, `0eb79bb` |
| 2B — Identity lifecycle | ✅ | `phase-2b-identity-lifecycle.md` | `50f0bd7` |
| 2C — Authorization/scope/immutability | ✅ | `phase-2c-authorization.md` | `83a56d5` |
| 3A — Ideas foundation | ✅ | `phase-3a-ideas-foundation.md` | `41f0041` |
| 3B — Idea evaluation | ✅ | `phase-3b-idea-evaluation.md` | `1f100d3` |
| 3C — Decisions, conversion, Kanban | ✅ | `phase-3c-decisions-conversion-kanban.md` | `bd067b0` |
| 4A — Solutions registry | ✅ | `phase-4a-solutions-registry.md` | `c90efc1` |
| 4B — Solution lifecycle/publishing/sharing | ✅ | `phase-4b-solution-lifecycle.md` | `e434a5b` |
| 5A — Evidence management | ✅ | `phase-5a-evidence-management.md` | `013c357` |
| 5A.1 — Evidence binary storage | ✅ | `phase-5a1-evidence-storage.md` | `456a94f` |
| 5B — AI document analysis | ✅ | `phase-5b-document-analysis.md` | `b0cde54` |

(Each phase has feat/test commits preceding its docs commit; see `git log`.)

## 3. Stack & deployment target
- **Framework:** Next.js 14.2.35 (App Router, RTL Arabic, server actions).
- **ORM/DB:** Prisma 5.22 + PostgreSQL 16.
- **Auth:** Auth.js v5 (next-auth 5.0.0-beta.25), credentials + JWT; Entra-ID-ready.
- **Storage:** provider abstraction (`src/server/storage/`) — S3-compatible default (`@aws-sdk/client-s3`), works with AWS S3 / Cloudflare R2 / MinIO; in-memory adapter for dev/tests. Binaries never in Postgres/ephemeral FS.
- **Document extractors:** `pdf-parse` (PDF), `mammoth` (DOCX), `exceljs` (XLSX) — local, self-hosted.
- **Analysis provider:** `HeuristicAnalysisProvider` (offline, rule-based) behind an abstraction; LLM provider not yet selected.
- **Deployment target:** Vercel + managed PostgreSQL + S3/R2 storage (self-hosted MinIO/Docker also supported). Not yet deployed.

## 4. Quality gates (last verified this session)
- **Tests:** 239 passing (10 test files) via `vitest` against a disposable PostgreSQL.
- **Lint:** ✅ `npm run lint` clean.
- **Typecheck:** ✅ `npm run typecheck` clean.
- **Build:** ✅ `npm run build` (20 routes).

## 5. Database status
- **Migrations:** 8 tracked, apply cleanly from zero. Schema in sync (no drift).
- **Latest migration:** `20260723101704_evidence_audit_entity_type` (adds `EVIDENCE` to `LinkedEntityType`).
- Full list: `20260722005753_init`, `_align_mvp_schema`, `_ideas_status_default_draft`, `_registration_intake_fields`, `_authorization_scope_fields`, `_idea_department_relation`, `20260722223244_idea_info_requests`, `20260723101704_evidence_audit_entity_type`.
- **Phase 5B added no migration** (DocumentAnalysis/AnalysisSuggestion already existed from 2A).

## 6. Major implemented modules
- **Authentication** — `src/auth.ts`, `src/auth.config.ts`, `src/modules/auth/`, `src/modules/registration/` (register → PENDING → admin approve/reject; login gated on APPROVED+ACTIVE).
- **Authorization** — `src/server/authorization/` (permission, scope, resource-share, field, immutability) + `src/server/authz.ts` + `src/server/access-context.ts` + `src/server/audit.ts`.
- **Ideas** — `src/modules/ideas/` (create/draft/submit/withdraw/archive).
- **Evaluations** — `src/modules/ideas/evaluation-service.ts` (initial/technical review, more-info requests/responses).
- **Decisions + Conversion** — `src/modules/ideas/decision-service.ts`, `conversion-service.ts`.
- **Kanban** — persisted governance board reading real ideas (`src/app/(app)/governance/`).
- **Solutions registry** — `src/modules/solutions/` (create/edit/scope/completeness).
- **Lifecycle/Publishing/Sharing** — `src/modules/solutions/lifecycle-service.ts`, `sharing-service.ts`, `history-service.ts`.
- **Evidence** — `src/modules/evidence/` (registry, upload, lifecycle, linking, timeline, approval-rate).
- **Storage** — `src/server/storage/` (S3 + memory).
- **Document Analysis** — `src/modules/document-analysis/` (extractor, provider, pipeline, review UI).

## 7. Critical invariants — MUST NEVER be broken
1. **Extraction success never implies approval** — the analysis pipeline never touches `Evidence.reviewStatus`.
2. **AI output never mutates approved records** — analysis/suggestion review refuse APPROVED/ARCHIVED evidence; accepting a suggestion never sets `reviewStatus=APPROVED`.
3. **All authorization is server-side** — guards run in services/actions, never client-side; UI hiding is never the control.
4. **Scope filtering is mandatory** — reads go through `*ScopeWhere`/`requireScope`; deny-by-default when no grant.
5. **Finalized decisions are immutable** — `IdeaDecision.finalizedAt` set → `assertMutable` blocks in-place edits; only supersede/reopen (audited).
6. **Verified measurements are immutable** — VERIFIED `ImpactMeasurement` → supersede/reopen only.
7. **Viewer sees only published projections** — `PUBLISHED` scope + `publishedAt`; APPROVED-only evidence on published solutions.
8. **Resource shares are deny-by-default** — inactive/expired/revoked shares grant nothing; partner writes limited to `allowedActions`/`allowedFields`.

Other standing rules: no hard deletes (archive only); every mutation writes `AuditLog`; readiness/approval-rate labels are NOT compliance/DGA readiness.

## 8. Known limitations & security risks
- **No rate limiting** on `/register` or credentials login — **HIGH-priority** carryover (no durable store selected).
- **Analysis provider is a simple heuristic** — suggestion quality is limited until an LLM provider is selected.
- **Extraction is text-layer only** — OCR for scanned PDFs out of scope (`needsOCR` flagged); XLSX handles a single structured block only.
- **Analysis run is on-demand/synchronous** in the action — no worker/queue; large files may exceed a serverless budget.
- No antivirus scan of uploaded binaries; no background retention job for orphaned objects.
- Dependency advisories noted in earlier phases (Next.js line); next-auth is a beta.
- Downloads audited but not rate-limited.

## 9. Deferred items
- Rate limiting; LLM analysis provider + provider selection; OCR; async analysis worker; IMPACT_ROW → `ImpactMeasurement` conversion; direct-to-storage upload presigning; deployment (CI/CD, Vercel, managed PG, storage bucket).

## 10. Next phase — Phase 6 (Compliance Readiness Engine)
- **Not started.** Scope (per `docs/compliance-rules.md` + `docs/mvp-scope.md` §2.7):
  - Configurable requirement scoring: `ComplianceSection`/`ComplianceRequirement` + `RequirementFieldRule`/`RequirementEvidenceRule` (weights, mandatory gates, optional criteria, `allowNA`, `gateCeiling`) — all **data-driven, no hard-coded 50/50**.
  - Governed **N/A** via `ComplianceNA` (request → approve, audited; never automatic).
  - Readiness computed from **real records + APPROVED evidence only**; AI confidence excluded; labelled **"estimated/internal"** (never "DGA").
  - On-screen compliance file per requirement (readiness, gaps, missing evidence/records, deep links) + print/basic export.
- **Expected deliverables:** compliance module (service + actions + UI routes), integration tests (weights/gates/N/A/readiness rollup), `docs/architecture/phase-6-compliance-engine.md`, migration only if a genuinely required field is missing.
- **Invariants to honor:** see the memory note `compliance-optional-criteria-rules` (optional criteria must never compensate for an unmet mandatory gate, never push a score above 100%, and stay separated from required fields/evidence).

## 11. Read first (next session)
1. `docs/handoffs/current-project-state.md` (this file)
2. `docs/compliance-rules.md`, `docs/mvp-scope.md` (§2.7), `docs/status-definitions.md`
3. `docs/architecture/phase-2c-authorization.md` (reuse the guards)
4. `prisma/schema.prisma` — the compliance models (`ComplianceSection`, `ComplianceRequirement`, `RequirementFieldRule`, `RequirementEvidenceRule`, `ComplianceNA`, `ComplianceRequirementVersion`)
5. `src/server/authorization/` and `src/server/audit.ts`
6. `src/modules/evidence/service.ts` (APPROVED evidence + EvidenceLink → the readiness input)

## 12. Restore local dev environment
```bash
# 1) Disposable PostgreSQL 16 (Docker Desktop must be running)
docker run -d --name innov-verify-db \
  -e POSTGRES_USER=verify -e POSTGRES_PASSWORD=verify_throwaway \
  -e POSTGRES_DB=innovation_verify -p 5544:5432 postgres:16-alpine

# 2) Point tooling at it (do NOT commit)
export DATABASE_URL="postgresql://verify:verify_throwaway@localhost:5544/innovation_verify?schema=public"

# 3) Install, migrate, generate, seed
npm install
npx prisma migrate deploy
npx prisma generate
npm run db:seed          # NODE_ENV!=production seeds demo users (admin/editor/partner/viewer)

# 4) Quality gates
npm run test             # vitest — needs DATABASE_URL
npm run lint && npm run typecheck && npm run build

# 5) Run the app against the dev DB (gitignored .env.local)
printf 'DATABASE_URL="postgresql://verify:verify_throwaway@localhost:5544/innovation_verify?schema=public"\nSTORAGE_DRIVER="memory"\n' > .env.local
npm run dev
```
Seeded logins (dev): `admin@innovation.local` / `Admin@12345`; `editor|partner|viewer@innovation.local` / `Demo@12345`.

## 13. Untracked files that must NOT be committed
- `.claude/` — local tooling config (untracked).
- `.env`, `.env.local` — gitignored; never commit.
- `prisma/migrations/` was previously untracked but is now committed and tracked.

## 14. AnalysisProvider decision status
- **Current implementation:** `HeuristicAnalysisProvider` (offline, deterministic, rule-based) — the default.
- **Abstraction exists:** `src/modules/document-analysis/provider/` with `getAnalysisProvider()`/`setAnalysisProvider()`; pipeline is provider-agnostic.
- **External LLM provider:** NOT selected. Swappable at the registry with no pipeline change.
- **Gate:** an external provider must NOT process real institutional documents without **KACARE data-residency approval** (`document-analysis.md` §8). Decision deferred to a dedicated kickoff — see memory note `phase-5b-extraction-provider-decision`.

## 15. Project completion estimate
~**80%** of the MVP scope implemented (identity, authorization, full ideas→decisions→conversion governance, solutions registry + lifecycle + sharing, evidence management + secure storage, AI analysis pipeline). Remaining for MVP: **Phase 6 compliance readiness engine**, plus hardening (rate limiting, LLM provider, deployment).
