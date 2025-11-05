/**
 * Question Bank - Load real N5 questions from JSON files
 * Supports: single choice, match, fill questions
 * Version: 2.0 (Real question bank)
 */

import n5Batch1 from '@/frontend/data/questions/n5-batch-day-1.json';
import n5Batch2 from '@/frontend/data/questions/n5-batch-day-2.json';

export type QuestionType = 'single' | 'match' | 'fill';
export type QuestionCategory = 'vocabulary' | 'grammar' | 'kanji' | 'listening' | 'reading' | 'particle';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  category: QuestionCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

export interface SingleQuestion extends BaseQuestion {
  type: 'single';
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match';
  instruction: string;
  left: string[];
  right: string[];
  pairs: Array<[number, number]>;
  explanation?: string;
}

export interface FillQuestion extends BaseQuestion {
  type: 'fill';
  prompt: string;
  blanks: number;
  solutions: string[][];
  caseSensitive?: boolean;
  explanation?: string;
}

export type AnyQuestion = SingleQuestion | MatchQuestion | FillQuestion;

/**
 * Helper function to shuffle array (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get all available questions from all batches
 */
function getAllQuestions(): AnyQuestion[] {
  const allQuestions: AnyQuestion[] = [];

  // Load from all available batch files
  if (n5Batch1?.questions) {
    allQuestions.push(
      ...(n5Batch1.questions as AnyQuestion[])
    );
  }

  if (n5Batch2?.questions) {
    allQuestions.push(
      ...(n5Batch2.questions as AnyQuestion[])
    );
  }

  // TODO: Add more batches as they're created
  // if (n5Batch2?.questions) allQuestions.push(...n5Batch2.questions);
  // if (n5Batch3?.questions) allQuestions.push(...n5Batch3.questions);

  return allQuestions;
}

/**
 * Get daily questions - returns shuffled, non-overlapping selection
 * @param count Number of questions to return (default: 10)
 * @returns Array of questions
 */
export function getDailyQuestions(count: number = 10): AnyQuestion[] {
  if (!Number.isFinite(count) || count <= 0) return [];

  const allQuestions = getAllQuestions();

  if (allQuestions.length === 0) {
    console.warn('No questions available in question bank');
    return [];
  }

  // Shuffle and select first 'count' questions
  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, Math.min(count, allQuestions.length));
}

/**
 * Get questions by category
 * @param category Filter by category
 * @param count Number of questions to return
 */
export function getQuestionsByCategory(
  category: QuestionCategory,
  count: number = 10
): AnyQuestion[] {
  const allQuestions = getAllQuestions();
  const filtered = allQuestions.filter((q) => q.category === category);

  if (filtered.length === 0) {
    console.warn(`No questions found for category: ${category}`);
    return [];
  }

  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, Math.min(count, filtered.length));
}

/**
 * Get questions by difficulty level
 * @param difficulty Filter by difficulty (1-5)
 * @param count Number of questions to return
 */
export function getQuestionsByDifficulty(
  difficulty: 1 | 2 | 3 | 4 | 5,
  count: number = 10
): AnyQuestion[] {
  const allQuestions = getAllQuestions();
  const filtered = allQuestions.filter((q) => q.difficulty === difficulty);

  if (filtered.length === 0) {
    console.warn(`No questions found for difficulty: ${difficulty}`);
    return [];
  }

  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, Math.min(count, filtered.length));
}

/**
 * Get question stats
 */
export function getQuestionStats() {
  const allQuestions = getAllQuestions();

  return {
    total: allQuestions.length,
    byType: {
      single: allQuestions.filter((q) => q.type === 'single').length,
      match: allQuestions.filter((q) => q.type === 'match').length,
      fill: allQuestions.filter((q) => q.type === 'fill').length,
    },
    byCategory: {
      vocabulary: allQuestions.filter((q) => q.category === 'vocabulary').length,
      grammar: allQuestions.filter((q) => q.category === 'grammar').length,
      kanji: allQuestions.filter((q) => q.category === 'kanji').length,
      other: allQuestions.filter(
        (q) => !['vocabulary', 'grammar', 'kanji'].includes(q.category)
      ).length,
    },
    byDifficulty: {
      1: allQuestions.filter((q) => q.difficulty === 1).length,
      2: allQuestions.filter((q) => q.difficulty === 2).length,
      3: allQuestions.filter((q) => q.difficulty === 3).length,
      4: allQuestions.filter((q) => q.difficulty === 4).length,
      5: allQuestions.filter((q) => q.difficulty === 5).length,
    },
  };
}
