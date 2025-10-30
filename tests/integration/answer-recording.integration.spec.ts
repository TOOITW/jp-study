// AC-3: Answer recording and session state transitions
// Red: Expected to fail until answer recording is integrated into session

import { createTodaySession, recordAnswer, getSessionAnswers, isSessionComplete } from '../../frontend/lib/drill/session';

describe('AC-3 Integration — answer recording', () => {
  test('test_AC-3_integration_record_answer_transitions_state', () => {
    const session = createTodaySession();
    expect(session.questions.length).toBe(10);
    expect(session.answers.length).toBe(0);

    // Record first answer
    const q1 = session.questions[0];
    recordAnswer(session, q1.id, 'a', true, '正確！');

    expect(session.answers.length).toBe(1);
    expect(session.answers[0].isCorrect).toBe(true);
    expect(isSessionComplete(session)).toBe(false);
  });

  test('test_AC-3_integration_multiple_answers_recorded_sequentially', () => {
    const session = createTodaySession();
    const q1 = session.questions[0];
    const q2 = session.questions[1];

    recordAnswer(session, q1.id, 'a', true, '正確！');
    recordAnswer(session, q2.id, 'b', false, '錯誤');

    const answers = getSessionAnswers(session);
    expect(answers.length).toBe(2);
    expect(answers[0].questionId).toBe(q1.id);
    expect(answers[1].questionId).toBe(q2.id);
    expect(answers[0].isCorrect).toBe(true);
    expect(answers[1].isCorrect).toBe(false);
  });
});
