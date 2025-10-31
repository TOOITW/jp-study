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
  minInterval: number; // Minimum interval in milliseconds (e.g., 1 day)
}

/**
 * Constants for SM-2 interval calculations
 */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SIX_DAYS_MS = 6 * ONE_DAY_MS;

/**
 * Get the current scheduling parameters used by the SM-2 baseline
 * 
 * @returns SM-2 scheduling parameters (easeFactor=2.5, minInterval=1 day)
 */
export function getSchedulingParams(): SchedulingParams {
  return {
    easyFactor: 2.5, // Standard SM-2 easy factor
    minInterval: ONE_DAY_MS, // 1 day in milliseconds (SM-2 first interval)
  };
}

/**
 * Calculate interval for mixed correct/incorrect history
 * 
 * @param accuracy - Ratio of correct answers (0.0 to 1.0)
 * @param correctCount - Number of correct answers
 * @param params - SM-2 scheduling parameters
 * @returns Scaled interval in milliseconds
 */
function calculateMixedInterval(
  accuracy: number,
  correctCount: number,
  params: SchedulingParams
): number {
  // SM-2 reset: interval grows more slowly when mistakes present
  // Scale: min_interval * easy_factor^(accuracy * min(correctCount, 3))
  const cappedCorrect = Math.min(correctCount, 3);
  return params.minInterval * Math.pow(params.easyFactor, accuracy * cappedCorrect);
}

/**
 * Calculate interval for all-correct history using SM-2 progression
 * 
 * @param correctCount - Number of consecutive correct answers
 * @returns Interval in milliseconds following SM-2 standard
 */
function calculateCorrectInterval(correctCount: number): number {
  if (correctCount === 1) {
    return ONE_DAY_MS; // 1 day
  } else if (correctCount === 2) {
    return SIX_DAYS_MS; // 6 days (SM-2 standard)
  } else {
    // For 3rd and beyond: exponential growth
    // Formula: 6 days × easeFactor^(correctCount - 2)
    const params = getSchedulingParams();
    return SIX_DAYS_MS * Math.pow(params.easyFactor, correctCount - 2);
  }
}

/**
 * Calculate the next review time based on correctness history
 *
 * SM-2 baseline logic:
 * - 1st correct: 1 day
 * - 2nd correct: 6 days
 * - 3rd+ correct: previous interval × easeFactor (2.5)
 * - With incorrect answers: scaled down based on accuracy ratio
 *
 * @param correctCount - Number of times answered correctly
 * @param incorrectCount - Number of times answered incorrectly
 * @param lastReviewAt - Optional timestamp of last review (reserved for future use)
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

  // If any incorrect answers, use scaled interval
  if (incorrectCount > 0) {
    const accuracy = correctCount / totalAttempts;
    return calculateMixedInterval(accuracy, correctCount, params);
  }

  // All correct: use SM-2 standard progression
  return calculateCorrectInterval(correctCount);
}
