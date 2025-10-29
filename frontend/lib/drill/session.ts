// Minimal session creator for AC-1
import { getDailyQuestions, AnyQuestion } from './question-bank';

export interface DrillSession {
  date: string; // ISO date string
  questions: AnyQuestion[];
}

export function createTodaySession(): DrillSession {
  const today = new Date();
  const date = today.toISOString();
  const questions = getDailyQuestions(10);
  return { date, questions };
}
