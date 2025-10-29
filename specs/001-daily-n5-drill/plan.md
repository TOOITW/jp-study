---
fr_id: FR-001
short_name: daily-n5-drill
title: Daily N5 Drill
spec: specs/001-daily-n5-drill/spec.md
branch: 001-daily-n5-drill
created: 2025-10-29
---

# FR-001 Implementation Plan — Daily N5 Drill

## 1) Summary & Goals
- Deliver a daily N5 drill (10 questions) with instant feedback, full offline capability, and clear completion summary (accuracy, wrong list, next review time).
- Align with Constitution: 5-Minute Value, SDD×TDD, Observability, Offline-first & Fast, Opinionated UI.

Success at feature level (from spec):
- 95% users finish within 5 minutes
- FCP < 2s (4G), interaction < 100ms
- Offline completion 100% with auto sync

## 2) Technical Context
- Platform: Web app with opinionated UI (Next.js + Tailwind + shadcn/ui) per Constitution
- Offline-first: local cache 7 days; background sync when online
- SRS next review suggestion: SM-2 baseline with lightweight params; client-side compute, non-blocking
- Telemetry: drill_started, answer_correct/incorrect, session_completed; metrics for DAU drill completion, accuracy, retention, avg duration
- Error tracing: identifiable session+question context, minimal PII

NEEDS CLARIFICATION (resolved in Phase 0 research.md):
1) Exact question-type mix per session (e.g., single-choice 7, fill 2, match 1) → Decision in research.md
2) Conflict resolution on offline sync (client updates vs server authoritative) → Decision in research.md
3) SRS algorithm parameters (SM-2/Leitner/Hybrid) → Decision in research.md

## 3) Constitution Check (Pre-design)
- 5-Minute Value: 10 Q cap, fast UI, skip/next, summary immediate → PASS plan
- SDD × TDD: AC mapping to tests (AC-1..AC-6) with red→green→refactor → ENFORCED
- Observability: standard events + error trace IDs; dashboards for completion/accuracy/retention/duration → INCLUDED
- Offline-first & Fast: Indexed local store + versioned schema + background sync; perf budgets → INCLUDED
- Opinionated UI: Next.js + Tailwind + shadcn/ui; fixed layout (top status, middle question, bottom actions); empty/skeleton/error states → INCLUDED
- Quality Gates (CI): Lint/TypeCheck/Test required; PR template checks → INCLUDED

Gate outcome: No violations; proceed.

## 4) Architecture & Module Breakdown

### 4.1 Folders (proposed)
- frontend/
  - app/(drill)/today/page.tsx — Daily drill entry
  - components/drill/QuestionCard.tsx — Render question (type-driven)
  - components/drill/SessionHeader.tsx — Top progress and task
  - components/drill/ActionsBar.tsx — Bottom actions (submit/next/skip)
  - lib/drill/session.ts — Session state machine
  - lib/drill/question-bank.ts — Question source abstraction
  - lib/storage/indexeddb.ts — Versioned local store (7-day TTL)
  - lib/sync/sync.ts — Offline queue + background sync
  - lib/telemetry/events.ts — Emit/validate events
  - lib/srs/scheduler.ts — Next review time calculation (SM-2 baseline)
- backend/ (optional, if API needed later)
  - api/drill.ts — Today drill, submit results
  - api/sync.ts — Sync endpoints
- tests/
  - contract/ (OpenAPI contract tests)
  - integration/
  - e2e/
  - unit/

### 4.2 Components & Responsibilities
- Session Engine: generate daily set, track answers, compute summary
- Question Renderer: type-driven UI with validation
- Offline Store: read-through cache, 7d retention, schema versioning+migration
- Sync Worker: push local changes, pull server updates, conflict resolution
- SRS Scheduler: compute next review time from correctness history
- Telemetry: strict schema, at-least-once emit with batching

## 5) Data Model (details in data-model.md)
Entities:
- DrillSession(id, date, questions[], answers[], startedAt, completedAt, accuracy, nextReviewAt, version)
- Question(id, type, prompt, options[], answerKey, tags, difficulty)
- Answer(questionId, value, isCorrect, answeredAt)
- SyncQueue(id, entityType, payload, op, createdAt, retried)

Validation:
- 10 questions per daily session; IDs unique; supported types: single, match, fill
- Answer value matches type; correctness derived against answerKey
- Session summary only when all answered or user completes

## 6) API Contracts (contracts/openapi.yaml)
Endpoints (optional if fully client-side now):
- GET /api/drills/today → 10 questions
- POST /api/drills/{sessionId}/answers → batch answers
- POST /api/sync → bidirectional sync
- GET /api/health → healthcheck

Contracts include JSON schemas for all entities and event payloads.

## 7) Telemetry (events & metrics)
Events:
- drill_started { sessionId, date, questionCount, clientTs }
- answer_correct { sessionId, questionId, latencyMs, clientTs }
- answer_incorrect { sessionId, questionId, latencyMs, clientTs }
- session_completed { sessionId, total, correct, accuracy, durationMs, clientTs }

Derived Metrics:
- Daily drill completions, accuracy distribution, D1/D7 retention, avg duration, error rate

Error Tracing:
- Include sessionId, questionId, uiState, errorCode; link to logs

## 8) Test Plan (TDD) — AC mapping
AC-1 Daily 10 Q generated (types: single/match/fill)
- Tests:
  - test_AC-1_contract_today_drill_returns_10_questions (contract)
  - test_AC-1_unit_generate_questions_type_mix (unit)
  - test_AC-1_integration_cache_warm_then_serve (integration)

AC-2 Offline retrieval 7d cache + auto sync
- Tests:
  - test_AC-2_integration_offline_serves_cached_questions
  - test_AC-2_integration_reconnect_triggers_background_sync
  - test_AC-2_unit_schema_version_migration_applies

AC-3 Instant correctness + record
- Tests:
  - test_AC-3_unit_answer_checker_by_type
  - test_AC-3_integration_record_answer_and_state_transition

AC-4 Summary with accuracy/wrongs/next review
- Tests:
  - test_AC-4_integration_complete_session_summary_calculated
  - test_AC-4_unit_srs_scheduler_sm2_baseline

AC-5 Telemetry
- Tests:
  - test_AC-5_unit_event_shapes_validated
  - test_AC-5_integration_events_emitted_on_key_actions

AC-6 UI fixed layout + states
- Tests:
  - test_AC-6_e2e_layout_header_body_footer_present
  - test_AC-6_e2e_skeleton_empty_error_states

Naming rule: include AC-? in each test name. Red → Green → Refactor.

## 9) Risks & Rollback
Risks:
- Question quality/coverage insufficient → low engagement
- Offline sync conflicts → data loss/duplication
- Performance regressions on low-end devices
- Telemetry over-collection → privacy concern

Mitigations:
- Start with vetted small N5 set; add review pipeline
- Last-write-wins with change stamps; idempotent server merges
- Budget checks in CI; lightweight components; lazy-load
- Minimize PII; document event schemas; opt-out flag

Rollback:
- Feature flag to disable drill entry point
- Keep data migrations backward compatible; migration version guard
- Server allows ignore client-side SRS while preserving history

## 10) Phases & Outputs
Phase 0: Outline & Research (research.md)
- Resolve: type mix, sync conflict policy, SRS baseline params
- Output: research.md (Decision/Rationale/Alternatives)

Phase 1: Design & Contracts
- Output: data-model.md, contracts/openapi.yaml, quickstart.md
- Update agent context via `.specify/scripts/bash/update-agent-context.sh copilot`

Phase 2: Implementation Readiness
- Perf budgets documented; dashboard metrics listed
- Re-run Constitution Check post-design: EXPECT PASS

## 11) Tasks (file-level)
Foundational
- [ ] T100 Init test tooling (unit/integration/e2e) in tests/
- [ ] T101 Setup telemetry validator in frontend/lib/telemetry/events.ts
- [ ] T102 Setup storage base in frontend/lib/storage/indexeddb.ts (schema v1)
- [ ] T103 Setup sync worker in frontend/lib/sync/sync.ts

User Story 1: Daily Drill MVP (P1)
- [ ] T110 [P] Implement session engine in frontend/lib/drill/session.ts
- [ ] T111 [P] Implement question bank in frontend/lib/drill/question-bank.ts
- [ ] T112 [P] SRS scheduler baseline in frontend/lib/srs/scheduler.ts
- [ ] T113 Page UI in frontend/app/(drill)/today/page.tsx (layout H/M/F)
- [ ] T114 [P] QuestionCard in frontend/components/drill/QuestionCard.tsx
- [ ] T115 ActionsBar in frontend/components/drill/ActionsBar.tsx
- [ ] T116 SessionHeader in frontend/components/drill/SessionHeader.tsx
- [ ] T117 Wire telemetry emits at key actions

Tests (write first; must fail initially)
- [ ] TT01 unit tests for AC-1..AC-6 in tests/unit/
- [ ] TT02 integration tests for AC-1..AC-5 in tests/integration/
- [ ] TT03 e2e tests for AC-6 in tests/e2e/
- [ ] TT04 contract tests for today drill in tests/contract/

Ops & Quality Gates
- [ ] T120 Lint/TypeCheck/Test in CI
- [ ] T121 Dashboards for completion/accuracy/duration

## 12) Constitution Check (Post-design)
All constraints satisfied with the design above. No waivers needed.
