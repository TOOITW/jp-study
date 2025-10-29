# Research — FR-001 Daily N5 Drill

## Unknown 1: Question-type mix per session
- Decision: Single-choice 7, Fill-in 2, Match 1 (total 10)
- Rationale: Balance speed (5-minute goal) and variety; single-choice dominates for pace
- Alternatives: 8/1/1 (faster but less variety); 6/2/2 (richer but slower)

## Unknown 2: Offline sync conflict policy
- Decision: Server authoritative with last-write-wins; client keeps history for merge; idempotent ops
- Rationale: Simplifies resolution; avoids duplication; acceptable for drill practice domain
- Alternatives: CRDT-based merge (complex); client authoritative then reconcile (risk of loss)

## Unknown 3: SRS algorithm baseline
- Decision: SM-2 baseline (ease factor 2.5, min interval 1d), adjustable later
- Rationale: Well-known, easy to implement client-side; non-blocking per Constitution
- Alternatives: Leitner boxes; custom heuristics
