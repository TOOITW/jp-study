// AC-4: SRS scheduler baseline (SM-2 inspired) unit tests
// Red: Expected to fail until srs-scheduler module is implemented

// Expected APIs (to be implemented later)
// - calculateNextReviewTime(correctCount, incorrectCount, lastReviewAt?): number (milliseconds from now)
// - getSchedulingParams(): { easyFactor: number; minInterval: number }

import { calculateNextReviewTime, getSchedulingParams } from '../../frontend/lib/srs/scheduler';

describe('AC-4 Unit — SRS scheduler (SM-2 baseline)', () => {
  test('test_AC-4_unit_scheduler_first_review_easy', () => {
    // After first correct answer, next review should be soon (e.g., within 1 day)
    const nextMs = calculateNextReviewTime(1, 0, undefined);
    expect(typeof nextMs).toBe('number');
    expect(nextMs).toBeGreaterThan(0);
    expect(nextMs).toBeLessThan(24 * 60 * 60 * 1000); // less than 1 day
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
});
