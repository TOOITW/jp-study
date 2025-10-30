/**
 * SRS (Spaced Repetition System) Scheduler — SM-2 Baseline
 *
 * Implements a lightweight SM-2 inspired scheduling algorithm for computing
 * the next review time based on correctness history.
 */

/**
 * Scheduling parameters for SM-2 baseline
 */
export interface SchedulingParams {
  easyFactor: number; // Multiplier for interval growth on correct answers (typically ~2.5)
  minInterval: number; // Minimum interval in milliseconds (e.g., 0.5 days)
}

/**
 * Get the current scheduling parameters used by the SM-2 baseline
 */
export function getSchedulingParams(): SchedulingParams {
  return {
    easyFactor: 1.5, // Moderate easy factor for faster first review
    minInterval: 1 * 60 * 60 * 1000, // 1 hour in milliseconds (minimal first interval)
  };
}

/**
 * Calculate the next review time based on correctness history
 *
 * SM-2 baseline:
 * - If all correct: interval = min_interval * (easy_factor ^ correct_count)
 * - If any incorrect: interval = min_interval (restart/shorter)
 * - Scales with the ratio of correct to total attempts
 *
 * @param correctCount - Number of times answered correctly in this session or history
 * @param incorrectCount - Number of times answered incorrectly
 * @param lastReviewAt - Optional timestamp of last review (for future enhancement)
 * @returns Milliseconds until next review (from now)
 */
export function calculateNextReviewTime(
  correctCount: number,
  incorrectCount: number,
  lastReviewAt?: number
): number {
  const params = getSchedulingParams();
  const totalAttempts = correctCount + incorrectCount;

  // Edge case: no attempts yet, return minimum interval
  if (totalAttempts === 0) {
    return params.minInterval;
  }

  // Compute accuracy ratio
  const accuracy = correctCount / totalAttempts;

  // If any incorrect answers, scale down the interval significantly
  if (incorrectCount > 0) {
    // SM-2 reset: interval grows more slowly when mistakes present
    // Scale: min_interval * easy_factor^(accuracy * correctCount)
    const scaledInterval =
      params.minInterval * Math.pow(params.easyFactor, accuracy * Math.min(correctCount, 3));
    return scaledInterval;
  }

  // All correct: exponential growth by correctCount
  // Clamp to prevent extreme values (cap at ~30 days)
  const maxIntervalMs = 30 * 24 * 60 * 60 * 1000;
  const interval = Math.min(
    params.minInterval * Math.pow(params.easyFactor, correctCount),
    maxIntervalMs
  );

  return interval;
}
