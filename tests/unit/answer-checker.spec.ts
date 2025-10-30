// AC-3: Instant correctness checking by question type
// Red: Expected to fail until answer-checker module is implemented

import type { SingleQuestion, MatchQuestion, FillQuestion } from '../../frontend/lib/drill/question-bank';

// Expected API (to be implemented later)
// - checkAnswer(question, answer): { isCorrect: boolean; feedback: string }

import { checkAnswer } from '../../frontend/lib/drill/answer-checker';

describe('AC-3 Unit — answer checker', () => {
  test('test_AC-3_unit_answer_checker_single_choice', () => {
    const q: SingleQuestion = {
      id: 's1',
      type: 'single',
      prompt: 'ひらがな「あ」の羅馬拼音は？',
      options: ['a', 'i', 'u', 'e'],
      answerIndex: 0,
    };
    const result1 = checkAnswer(q, 'a');
    expect(result1.isCorrect).toBe(true);

    const result2 = checkAnswer(q, 'i');
    expect(result2.isCorrect).toBe(false);
  });

  test('test_AC-3_unit_answer_checker_match', () => {
    const q: MatchQuestion = {
      id: 'm1',
      type: 'match',
      left: ['犬', '猫'],
      right: ['いぬ', 'ねこ'],
      pairs: [[0, 0], [1, 1]],
    };
    const result1 = checkAnswer(q, JSON.stringify([[0, 0], [1, 1]]));
    expect(result1.isCorrect).toBe(true);

    const result2 = checkAnswer(q, JSON.stringify([[0, 1], [1, 0]]));
    expect(result2.isCorrect).toBe(false);
  });

  test('test_AC-3_unit_answer_checker_fill', () => {
    const q: FillQuestion = {
      id: 'f1',
      type: 'fill',
      prompt: '私は____です。',
      blanks: 1,
      solutions: ['学生', 'せいと'],
    };
    const result1 = checkAnswer(q, '学生');
    expect(result1.isCorrect).toBe(true);

    const result2 = checkAnswer(q, 'せいと');
    expect(result2.isCorrect).toBe(true);

    const result3 = checkAnswer(q, '先生');
    expect(result3.isCorrect).toBe(false);
  });
});
