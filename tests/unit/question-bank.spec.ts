import { getDailyQuestions, getQuestionStats } from '@/frontend/lib/drill/question-bank';

describe('question bank aggregation', () => {
  it('returns no more than total available and matches stats', () => {
    const stats = getQuestionStats();
    expect(stats.total).toBeGreaterThan(0);

    // Request more than available, should clamp to total
    const qs = getDailyQuestions(stats.total + 1000);
    expect(qs.length).toBe(stats.total);
  });

  it('can return a reasonable subset (e.g., 30) without duplicates by reference', () => {
    const thirty = getDailyQuestions(30);
    // Allow fewer than 30 only if total is smaller
    const stats = getQuestionStats();
    expect(thirty.length).toBeLessThanOrEqual(Math.min(30, stats.total));

    // Shallow uniqueness by id if present
    const ids = thirty.map((q: any) => q.id).filter(Boolean);
    const uniq = new Set(ids);
    expect(uniq.size).toBe(ids.length);
  });
});
