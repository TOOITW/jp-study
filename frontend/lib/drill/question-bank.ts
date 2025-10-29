// Minimal question bank implementation for AC-1
// Provides getDailyQuestions(count) returning a mixed set of question types

export type QuestionType = 'single' | 'match' | 'fill';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
}

export interface SingleQuestion extends BaseQuestion {
  type: 'single';
  prompt: string;
  options: string[];
  answerIndex: number;
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match';
  left: string[];
  right: string[];
  pairs: Array<[number, number]>; // index mapping left->right
}

export interface FillQuestion extends BaseQuestion {
  type: 'fill';
  prompt: string;
  blanks: number; // number of blanks
  solutions: string[]; // acceptable answers per blank (flattened minimal)
}

export type AnyQuestion = SingleQuestion | MatchQuestion | FillQuestion;

let __qid = 0;
const nextId = () => `q_${Date.now()}_${__qid++}`;

// Simple templates to ensure we can produce all three types
const singleTemplate = (): SingleQuestion => ({
  id: nextId(),
  type: 'single',
  prompt: 'ひらがな「あ」的羅馬拼音是？',
  options: ['a', 'i', 'u', 'e'],
  answerIndex: 0,
});

const matchTemplate = (): MatchQuestion => ({
  id: nextId(),
  type: 'match',
  left: ['犬', '猫', '鳥'],
  right: ['いぬ', 'ねこ', 'とり'],
  pairs: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
});

const fillTemplate = (): FillQuestion => ({
  id: nextId(),
  type: 'fill',
  prompt: '私は____です。',
  blanks: 1,
  solutions: ['学生', 'せいと'],
});

/**
 * Return a list of mixed-type questions with at least one of each kind when count >= 3.
 */
export function getDailyQuestions(count: number): AnyQuestion[] {
  if (!Number.isFinite(count) || count <= 0) return [];

  const out: AnyQuestion[] = [];
  const factories = [singleTemplate, matchTemplate, fillTemplate] as const;

  // Ensure coverage of all types first (when enough slots)
  for (let i = 0; i < factories.length && out.length < count; i++) {
    out.push(factories[i]());
  }

  // Fill the rest by cycling types
  let idx = 0;
  while (out.length < count) {
    out.push(factories[idx % factories.length]());
    idx++;
  }
  return out;
}
