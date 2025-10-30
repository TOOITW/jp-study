// Session creator for AC-1 & AC-3
// Tracks drill session with answers and state transitions
import { getDailyQuestions, AnyQuestion } from './question-bank';

export interface Answer {
  questionId: string;
  userAnswer: string | unknown;
  isCorrect: boolean;
  feedback: string;
  answeredAt: number; // timestamp
}

export interface DrillSession {
  id: string; // unique session ID
  date: string; // ISO date string
  questions: AnyQuestion[];
  answers: Answer[]; // AC-3: record of user answers
  startedAt: number; // timestamp
  completedAt?: number; // timestamp, set when all answered
}

export function createTodaySession(): DrillSession {
  const today = new Date();
  const date = today.toISOString();
  const questions = getDailyQuestions(10);
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    date,
    questions,
    answers: [],
    startedAt: Date.now(),
  };
}

/**
 * Record user's answer to a question in the session.
 * AC-3: captures answer with correctness and timestamp.
 */
export function recordAnswer(
  session: DrillSession,
  questionId: string,
  userAnswer: string | unknown,
  isCorrect: boolean,
  feedback: string,
): void {
  const answer: Answer = {
    questionId,
    userAnswer,
    isCorrect,
    feedback,
    answeredAt: Date.now(),
  };
  session.answers.push(answer);
}

/**
 * Get all recorded answers for a session.
 */
export function getSessionAnswers(session: DrillSession): Answer[] {
  return session.answers.slice(); // shallow copy
}

/**
 * Check if all questions have been answered.
 */
export function isSessionComplete(session: DrillSession): boolean {
  return session.answers.length === session.questions.length;
}

/**
 * Mark session as completed.
 */
export function completeSession(session: DrillSession): void {
  if (isSessionComplete(session)) {
    session.completedAt = Date.now();
  }
}
