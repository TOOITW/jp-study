// AC-1: generator produces 10 mixed-type questions
// AC-3: Question bank integration (補強測試)

import { 
  getDailyQuestions, 
  getQuestionsByCategory, 
  getQuestionsByDifficulty,
  getQuestionStats,
  type AnyQuestion 
} from '../../frontend/lib/drill/question-bank';

describe('AC-1 Unit: Question Generation', () => {
  test('test_AC-1_unit_question_generator_makes_10_questions', () => {
    const qs = getDailyQuestions(10);
    expect(qs).toHaveLength(10);
    expect(Array.isArray(qs)).toBe(true);
  });

  test('test_AC-1_unit_questions_have_required_fields', () => {
    const qs = getDailyQuestions(5);
    qs.forEach((q: AnyQuestion) => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('type');
      expect(q).toHaveProperty('category');
      expect(q).toHaveProperty('difficulty');
      expect(q).toHaveProperty('prompt');
      expect(typeof q.id).toBe('string');
      expect(['single', 'match', 'fill']).toContain(q.type);
    });
  });

  test('test_AC-1_unit_questions_are_randomized', () => {
    const qs1 = getDailyQuestions(10);
    const qs2 = getDailyQuestions(10);
    const ids1 = qs1.map((q: AnyQuestion) => q.id).join(',');
    const ids2 = qs2.map((q: AnyQuestion) => q.id).join(',');
    // Fisher-Yates 隨機：兩次結果應該不同（機率 > 99.9%）
    expect(ids1).not.toBe(ids2);
  });
});

describe('AC-3 Unit: Question Bank Features', () => {
  test('test_AC-3_unit_filter_by_category', () => {
    const vocab = getQuestionsByCategory('vocabulary', 5);
    expect(vocab).toHaveLength(5);
    vocab.forEach((q: AnyQuestion) => {
      expect(q.category).toBe('vocabulary');
    });
  });

  test('test_AC-3_unit_filter_by_difficulty', () => {
    const easy = getQuestionsByDifficulty(1, 5);
    expect(easy.length).toBeGreaterThan(0);
    easy.forEach((q: AnyQuestion) => {
      expect(q.difficulty).toBe(1);
    });
  });

  test('test_AC-3_unit_get_stats', () => {
    const stats = getQuestionStats();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('byType');
    expect(stats).toHaveProperty('byCategory');
    expect(stats).toHaveProperty('byDifficulty');
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.byType.single).toBe('number');
  });

  test('test_AC-3_unit_handles_insufficient_questions', () => {
    // 請求超過可用數量
    const all = getDailyQuestions(1000);
    expect(all.length).toBeLessThanOrEqual(1000);
    expect(all.length).toBeGreaterThan(0); // 至少有一些題目
  });
});
