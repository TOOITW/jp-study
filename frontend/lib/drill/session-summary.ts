/**
 * Session Summary Calculator
 *
 * Computes aggregated metrics from a completed drill session:
 * - Accuracy percentage
 * - Count of correct/total answers
 * - List of incorrectly answered question IDs
 */

import type { DrillSession } from './session';

/**
 * Summary metrics computed from a drill session
 */
export interface SessionSummary {
  accuracy: number; // 0.0 to 1.0 (e.g., 0.7 = 70%)
  correctCount: number; // Number of correct answers
  totalCount: number; // Total number of answers (should match questions count when complete)
  wrongQIds: string[]; // IDs of questions answered incorrectly
}

/**
 * Calculate the summary metrics for a drill session
 *
 * @param session - The completed (or partially completed) drill session
 * @returns SessionSummary with accuracy, correct count, total count, and wrong question IDs
 */
export function calculateSessionSummary(session: DrillSession): SessionSummary {
  const answers = session.answers || [];
  const totalCount = answers.length;

  if (totalCount === 0) {
    return {
      accuracy: 0,
      correctCount: 0,
      totalCount: 0,
      wrongQIds: [],
    };
  }

  // Count correct answers and collect wrong question IDs
  let correctCount = 0;
  const wrongQIds: string[] = [];

  for (const answer of answers) {
    if (answer.isCorrect) {
      correctCount++;
    } else {
      wrongQIds.push(answer.questionId);
    }
  }

  // Calculate accuracy as a ratio (0.0 to 1.0)
  const accuracy = correctCount / totalCount;

  return {
    accuracy,
    correctCount,
    totalCount,
    wrongQIds,
  };
}
