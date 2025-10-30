# AC-7: Offline Cache & Background Sync

## Objective
Implement local caching strategy and automatic background sync to enable:
- Offline question retrieval (7-day cache)
- Local session completion without network
- Automatic sync when connection restored
- Schema versioning for future updates

## Functional Requirements

### 7.1 Local Cache Storage
- **Requirement**: Questions fetched from backend must be cached locally for 7 days
- **Implementation**: IndexedDB with versioned schema (v1 baseline)
- **TTL**: Automatic expiry after 7 days; queries return empty on miss
- **Capacity**: Support 10 questions per day × 7 days = ~70 documents

### 7.2 Offline Question Retrieval
- **Requirement**: Users can complete drills offline using cached questions
- **Behavior**: 
  - If cache hit (within 7 days): Serve cached questions immediately
  - If cache miss (expired or never fetched): Show offline state (no network, no cache)
- **Performance**: < 50ms cache lookup

### 7.3 Local Session Recording
- **Requirement**: User answers recorded locally even without network
- **Storage**: Local session state (answers, timestamps, correctness)
- **Queuing**: Answered sessions marked as "pending sync"

### 7.4 Background Sync on Reconnection
- **Requirement**: When network restored, automatically sync pending sessions
- **Sync Strategy**: 
  - Batch pending answers
  - Retry on failure (exponential backoff)
  - Conflict resolution: Client-side wins (user's answers authoritative)
- **User Experience**: Silent sync in background; user notified on completion

### 7.5 Schema Versioning & Migration
- **Requirement**: Support future schema changes without data loss
- **Mechanism**: Version stamp on stored data; migration functions for v1→v2, etc.
- **Test**: Verify v1 data migrates to v2 correctly

## Test Contracts (Integration & Unit)

| Test ID | Requirement | Expected Behavior |
|---------|-------------|-------------------|
| test_AC-7_offline_cache_stores_questions_for_7_days | 7.1 | Questions persisted 7 days; TTL enforced |
| test_AC-7_offline_retrieval_serves_from_cache | 7.2 | Cache hit returns questions < 50ms |
| test_AC-7_reconnect_triggers_background_sync | 7.4 | Pending syncs auto-triggered on reconnect |
| test_AC-7_cache_expiry_after_7_days | 7.1 | Expired cache returns miss |
| test_AC-7_schema_version_migration | 7.5 | v1 → v2 migration preserves data |
| test_AC-7_sync_conflict_resolution | 7.4 | Conflicts resolved per strategy |
| test_AC-7_sync_queue_batching | 7.4 | Multiple answers batched into one request |
| test_AC-7_offline_session_completion_and_storage | 7.2, 7.3, 7.4 | User completes offline; session queued; syncs on reconnect |

## Acceptance Criteria

- ✅ All 8 tests pass (integration)
- ✅ Cache operations O(log n) or better
- ✅ Schema migration reversible for testing
- ✅ Background sync non-blocking (no UI freeze)
- ✅ Offline completions recoverable on sync

## Files to Implement

| File | Purpose |
|------|---------|
| `frontend/lib/storage/indexeddb.ts` | Versioned local store |
| `frontend/lib/sync/sync.ts` | Background sync worker |
| `tests/integration/offline-cache.integration.spec.ts` | Integration tests |

## Notes

- AC-7 builds on AC-1 to AC-6 foundation (UI + session logic already done)
- Offline cache is transparent to UI; no prop changes needed
- Sync worker runs in background; doesn't block user interactions
- Future: Implement conflict resolution strategy and push notifications on sync completion

---

**Status**: Red (Tests written; implementation pending)  
**Branch**: 001-daily-n5-drill-ac7-red  
**PR**: To be created
