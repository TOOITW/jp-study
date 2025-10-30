// AC-4: Integration test for session summary with SRS scheduling
// Red: Expected to fail until both scheduler and summary are implemented

import { createTodaySession, recordAnswer } from '../../frontend/lib/drill/session';

// Expected APIs (to be implemented later)
// - calculateSessionSummary(session): SessionSummary
// - calculateNextReviewTime(correctCount, incorrectCount): number (ms)

import { calculateSessionSummary } from '../../frontend/lib/drill/session-summary';
import { calculateNextReviewTime } from '../../frontend/lib/srs/scheduler';

describe('AC-4 Integration — session completion with SRS', () => {
  test('test_AC-4_integration_complete_session_summary_and_schedule', () => {
    const session = createTodaySession();

    // Simulate user completing the drill
    for (let i = 0; i < 7; i++) {
      recordAnswer(session, session.questions[i].id, `ans_${i}`, true, 'correct');
    }
    for (let i = 7; i < 10; i++) {
      recordAnswer(session, session.questions[i].id, `ans_${i}`, false, 'incorrect');
    }

    // Calculate summary
    const summary = calculateSessionSummary(session);
    expect(summary.correctCount).toBe(7);
    expect(summary.accuracy).toBe(0.7);

    // Calculate next review time based on performance
    const nextReviewMs = calculateNextReviewTime(summary.correctCount, 10 - summary.correctCount, undefined);
    expect(nextReviewMs).toBeGreaterThan(0);
  });

  test('test_AC-4_integration_perfect_session_longer_interval', () => {
    const session = createTodaySession();

    // All correct
    for (let i = 0; i < 10; i++) {
      recordAnswer(session, session.questions[i].id, `ans_${i}`, true, 'correct');
    }

    const summary = calculateSessionSummary(session);
    const nextReviewMs = calculateNextReviewTime(summary.correctCount, 0, undefined);

    // Perfect session should have a longer interval
    expect(nextReviewMs).toBeGreaterThan(24 * 60 * 60 * 1000 / 2); // more than 12 hours
  });

  test('test_AC-4_integration_poor_session_shorter_interval', () => {
    const session = createTodaySession();

    // All incorrect
    for (let i = 0; i < 10; i++) {
      recordAnswer(session, session.questions[i].id, `ans_${i}`, false, 'incorrect');
    }

    const summary = calculateSessionSummary(session);
    const nextReviewMs = calculateNextReviewTime(0, summary.totalCount, undefined);

    // Poor session should have a very short interval
    expect(nextReviewMs).toBeLessThan(24 * 60 * 60 * 1000); // less than 1 day
  });
});
