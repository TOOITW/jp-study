// AC-4: SRS scheduler baseline (SM-2 inspired) unit tests
// Red: Expected to fail until srs-scheduler module is implemented

// Expected APIs (to be implemented later)
// - calculateNextReviewTime(correctCount, incorrectCount, lastReviewAt?): number (milliseconds from now)
// - getSchedulingParams(): { easyFactor: number; minInterval: number }

import { calculateNextReviewTime, getSchedulingParams } from '../../frontend/lib/srs/scheduler';

describe('AC-4 Unit — SRS scheduler (SM-2 baseline)', () => {
  test('test_AC-4_unit_scheduler_first_review_easy', () => {
    // After first correct answer, next review should be 1 day (SM-2 standard)
    const nextMs = calculateNextReviewTime(1, 0, undefined);
    expect(typeof nextMs).toBe('number');
    expect(nextMs).toBeGreaterThan(0);
    const days = nextMs / (24 * 60 * 60 * 1000);
    expect(days).toBeGreaterThanOrEqual(0.9); // approximately 1 day
    expect(days).toBeLessThanOrEqual(1.1);
  });

  test('test_AC-4_unit_scheduler_repeat_incorrect', () => {
    // If answer is incorrect, next review should be immediate or very short
    const nextMs = calculateNextReviewTime(0, 1, undefined);
    expect(nextMs).toBeLessThanOrEqual(24 * 60 * 60 * 1000); // at most 1 day
  });

  test('test_AC-4_unit_scheduler_sequence_progression', () => {
    // As correct count increases, intervals should grow (SM-2 progression)
    const t1 = calculateNextReviewTime(1, 0, undefined);
    const t2 = calculateNextReviewTime(3, 0, undefined);
    const t3 = calculateNextReviewTime(5, 0, undefined);
    // Generally, more repetitions = longer intervals
    expect(t2).toBeGreaterThanOrEqual(t1);
    expect(t3).toBeGreaterThanOrEqual(t2);
  });

  test('test_AC-4_unit_scheduler_returns_params', () => {
    const params = getSchedulingParams();
    expect(params).toHaveProperty('easyFactor');
    expect(params).toHaveProperty('minInterval');
    expect(params.easyFactor).toBeGreaterThan(0);
    expect(params.minInterval).toBeGreaterThan(0);
  });

  // Supplemental tests for comprehensive AC-4 coverage
  test('test_AC-4_unit_scheduler_handles_mixed_history', () => {
    // Mix of correct and incorrect answers should handle gracefully
    const lastReview = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago
    const nextMs = calculateNextReviewTime(2, 3, lastReview);
    expect(typeof nextMs).toBe('number');
    expect(nextMs).toBeGreaterThan(0);
    // With more incorrect than correct, interval should be conservative
    expect(nextMs).toBeLessThan(7 * 24 * 60 * 60 * 1000); // less than 1 week
  });

  test('test_AC-4_unit_scheduler_second_correct_interval', () => {
    // Second correct answer should yield approximately 6-day interval (SM-2 standard)
    const nextMs = calculateNextReviewTime(2, 0, undefined);
    const days = nextMs / (24 * 60 * 60 * 1000);
    expect(days).toBeGreaterThanOrEqual(4); // at least 4 days
    expect(days).toBeLessThanOrEqual(8); // at most 8 days (allowing variance)
  });

  test('test_AC-4_unit_scheduler_long_term_retention', () => {
    // After many correct answers, interval should grow significantly
    const nextMs = calculateNextReviewTime(10, 0, undefined);
    const days = nextMs / (24 * 60 * 60 * 1000);
    expect(days).toBeGreaterThan(30); // More than 1 month
  });

  test('test_AC-4_unit_scheduler_incorrect_resets_interval', () => {
    // Even after many correct, one incorrect should reset to conservative interval
    const nextMs = calculateNextReviewTime(5, 3, undefined);
    const days = nextMs / (24 * 60 * 60 * 1000);
    // Mixed with 5 correct / 3 incorrect (62.5% accuracy), conservative scaling
    expect(days).toBeGreaterThan(2); // More than 2 days
    expect(days).toBeLessThan(10); // Less than 10 days
  });

  test('test_AC-4_unit_scheduler_uses_lastReviewAt', () => {
    // When lastReviewAt provided, calculation should consider elapsed time
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const nextMs1 = calculateNextReviewTime(3, 0, threeDaysAgo);
    const nextMs2 = calculateNextReviewTime(3, 0, undefined);
    // Both should be valid but potentially different strategies
    expect(typeof nextMs1).toBe('number');
    expect(typeof nextMs2).toBe('number');
    expect(nextMs1).toBeGreaterThan(0);
    expect(nextMs2).toBeGreaterThan(0);
  });
});
