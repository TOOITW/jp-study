// AC-1: Daily 10 Q generated (contract shape)
// Red PR: This test is expected to fail until minimal implementation exists

// Import expected API: to be implemented later
import { createTodaySession } from '../../frontend/lib/drill/session';

describe('AC-1 Contract', () => {
  test('test_AC-1_contract_today_drill_returns_10_questions', () => {
    const session = createTodaySession();
    expect(Array.isArray(session.questions)).toBe(true);
    expect(session.questions).toHaveLength(10);
    const allowed = new Set(['single', 'match', 'fill']);
    for (const q of session.questions) {
      expect(allowed.has((q as any).type)).toBe(true);
    }
  });
});
