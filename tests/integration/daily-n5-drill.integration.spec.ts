// AC-2: Offline retrieval (7d cache) + auto sync on reconnect
// Red: Expected to fail until storage and sync modules are implemented

import type { AnyQuestion } from '../../frontend/lib/drill/question-bank';

// Expected APIs (to be implemented later)
// Storage: read-through cache with 7d retention and versioned schema
// - getTodayQuestions(): Promise<AnyQuestion[]> (serves cached when offline)
// - __debug_seedTodayQuestions(questions: AnyQuestion[]): Promise<void> (test helper)
// Sync: triggers background sync when connectivity resumes
// - triggerBackgroundSync(): Promise<void>

// NOTE: These imports will fail until the modules exist — that is intentional for Red phase.
// Once implemented, tests should pass without modifying these imports.
import { getTodayQuestions, __debug_seedTodayQuestions } from '../../frontend/lib/storage/indexeddb';
import { triggerBackgroundSync } from '../../frontend/lib/sync/sync';

describe('AC-2 Integration', () => {
  test('test_AC-2_integration_offline_serves_cached_questions', async () => {
    // Arrange: seed a deterministic set for today
    const seed: AnyQuestion[] = [
      { id: 's1', type: 'single', prompt: 'A?', options: ['a', 'b'], answerIndex: 0 },
      { id: 'f1', type: 'fill', prompt: '私は__です', blanks: 1, solutions: ['学生'] },
      { id: 'm1', type: 'match', left: ['犬'], right: ['いぬ'], pairs: [[0, 0]] },
    ] as any;
    await __debug_seedTodayQuestions(seed);

    // Act: simulate offline retrieval (implementation detail: getTodayQuestions should not require network)
    const got = await getTodayQuestions();

    // Assert: returns the seeded questions without network
    expect(Array.isArray(got)).toBe(true);
    expect(got).toHaveLength(seed.length);
    const kinds = new Set(got.map(q => (q as any).type));
    expect(kinds.has('single')).toBe(true);
    expect(kinds.has('fill')).toBe(true);
    expect(kinds.has('match')).toBe(true);
  });

  test('test_AC-2_integration_reconnect_triggers_background_sync', async () => {
    // Act: on reconnect, we expect a background sync trigger to be invoked
    // This is a behavioral contract — exact implementation may be a queue; we only assert the call succeeds
    await expect(triggerBackgroundSync()).resolves.not.toThrow();
  });
});
