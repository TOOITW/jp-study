// AC-1: generator produces 10 mixed-type questions
// Red PR: Expected to fail until question-bank is implemented

import { getDailyQuestions } from '../../frontend/lib/drill/question-bank';

describe('AC-1 Unit', () => {
  test('test_AC-1_unit_question_generator_makes_10_mixed_types', () => {
    const qs = getDailyQuestions(10);
    expect(qs).toHaveLength(10);
    const kinds = new Set(qs.map((q: any) => q.type));
    expect(kinds.has('single')).toBe(true);
    expect(kinds.has('match')).toBe(true);
    expect(kinds.has('fill')).toBe(true);
  });
});
