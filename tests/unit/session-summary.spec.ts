// AC-4: Session summary calculation (accuracy, wrong list, next review time) unit tests
// Red: Expected to fail until summary calculator is implemented

import type { DrillSession } from '../../frontend/lib/drill/session';
import { createTodaySession, recordAnswer } from '../../frontend/lib/drill/session';

// Expected API (to be implemented later)
// - calculateSessionSummary(session): { accuracy: number; correctCount: number; totalCount: number; wrongQIds: string[] }

import { calculateSessionSummary } from '../../frontend/lib/drill/session-summary';

describe('AC-4 Unit — session summary', () => {
  test('test_AC-4_unit_summary_accuracy_calculation', () => {
    const session = createTodaySession();
    // Record 7 correct, 3 incorrect
    for (let i = 0; i < 7; i++) {
      recordAnswer(session, session.questions[i].id, 'ans', true, 'correct');
    }
    for (let i = 7; i < 10; i++) {
      recordAnswer(session, session.questions[i].id, 'ans', false, 'incorrect');
    }

    const summary = calculateSessionSummary(session);
    expect(summary.correctCount).toBe(7);
    expect(summary.totalCount).toBe(10);
    expect(summary.accuracy).toBe(0.7); // 70%
  });

  test('test_AC-4_unit_summary_wrong_question_list', () => {
    const session = createTodaySession();
    recordAnswer(session, session.questions[0].id, 'ans', true, 'correct');
    recordAnswer(session, session.questions[1].id, 'ans', false, 'incorrect');
    recordAnswer(session, session.questions[2].id, 'ans', false, 'incorrect');

    const summary = calculateSessionSummary(session);
    expect(summary.wrongQIds).toContain(session.questions[1].id);
    expect(summary.wrongQIds).toContain(session.questions[2].id);
    expect(summary.wrongQIds).not.toContain(session.questions[0].id);
  });

  test('test_AC-4_unit_summary_all_correct', () => {
    const session = createTodaySession();
    for (let i = 0; i < 10; i++) {
      recordAnswer(session, session.questions[i].id, 'ans', true, 'correct');
    }

    const summary = calculateSessionSummary(session);
    expect(summary.accuracy).toBe(1.0); // 100%
    expect(summary.wrongQIds).toHaveLength(0);
  });

  test('test_AC-4_unit_summary_all_wrong', () => {
    const session = createTodaySession();
    for (let i = 0; i < 10; i++) {
      recordAnswer(session, session.questions[i].id, 'ans', false, 'incorrect');
    }

    const summary = calculateSessionSummary(session);
    expect(summary.accuracy).toBe(0.0); // 0%
    expect(summary.wrongQIds).toHaveLength(10);
  });
});
