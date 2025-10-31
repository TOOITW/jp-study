// Answer checker: validates user responses against question answers
// Supports single-choice, match, and fill-in-the-blank questions

import type { SingleQuestion, MatchQuestion, FillQuestion, AnyQuestion } from './question-bank';

export interface CheckResult {
  isCorrect: boolean;
  feedback: string;
}

/**
 * Check user's answer against a question and return correctness + feedback.
 */
export function checkAnswer(question: AnyQuestion, userAnswer: string | unknown): CheckResult {
  switch (question.type) {
    case 'single':
      return checkSingleAnswer(question as SingleQuestion, userAnswer as string);
    case 'match':
      return checkMatchAnswer(question as MatchQuestion, userAnswer);
    case 'fill':
      return checkFillAnswer(question as FillQuestion, userAnswer as string);
    default:
      return { isCorrect: false, feedback: '不支援的題型' };
  }
}

function checkSingleAnswer(q: SingleQuestion, userAnswer: string): CheckResult {
  const correctOption = q.options[q.answerIndex];
  const isCorrect = userAnswer === correctOption;
  return {
    isCorrect,
    feedback: isCorrect ? '正確！' : `錯誤。正確答案是：${correctOption}`,
  };
}

function checkMatchAnswer(q: MatchQuestion, userAnswer: unknown): CheckResult {
  let userPairs: Array<[number, number]>;
  try {
    userPairs = typeof userAnswer === 'string' ? JSON.parse(userAnswer) : (userAnswer as Array<[number, number]>);
  } catch {
    return { isCorrect: false, feedback: '配對格式錯誤' };
  }

  // Compare pairs (order-independent, element-wise)
  if (!Array.isArray(userPairs) || userPairs.length !== q.pairs.length) {
    return { isCorrect: false, feedback: '配對數量不符' };
  }

  // Sort both for comparison
  const userSorted = userPairs
    .slice()
    .sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));
  const expectedSorted = q.pairs
    .slice()
    .sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));

  const isCorrect =
    userSorted.length === expectedSorted.length &&
    userSorted.every((pair, idx) => pair[0] === expectedSorted[idx][0] && pair[1] === expectedSorted[idx][1]);

  return {
    isCorrect,
    feedback: isCorrect ? '正確！' : '配對錯誤，請重新檢查',
  };
}

function checkFillAnswer(q: FillQuestion, userAnswer: string): CheckResult {
  const normalized = userAnswer.trim();
  // solutions is string[][], need to flatten and check
  const allSolutions = q.solutions.flat();
  const isCorrect = allSolutions.some(s => s.trim() === normalized);
  return {
    isCorrect,
    feedback: isCorrect ? '正確!' : `錯誤。可接受答案：${allSolutions.join('、')}`,
  };
}
