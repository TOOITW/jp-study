// Minimal in-memory storage stub for AC-2
// Contract-only: provides read-through cache APIs and schema guards

import type { AnyQuestion } from '../drill/question-bank';

// Schema versioning (v1 baseline)
const SCHEMA_VERSION = 1;

// In-memory store keyed by ISO date (YYYY-MM-DD)
const memoryStore: Record<string, AnyQuestion[]> = Object.create(null);

function yyyyMmDd(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Return cached questions for today. Intended to work fully offline.
 * For AC-2 Green we serve from in-memory cache; future work can swap to real IndexedDB.
 */
export async function getTodayQuestions(): Promise<AnyQuestion[]> {
  const key = yyyyMmDd();
  const qs = memoryStore[key] || [];
  // return a shallow copy to avoid external mutation
  return qs.slice();
}

/** Test helper: seed today's questions (used by integration tests). */
export async function __debug_seedTodayQuestions(questions: AnyQuestion[]): Promise<void> {
  const key = yyyyMmDd();
  // store a shallow copy to isolate caller mutations
  memoryStore[key] = questions.slice();
}

export function getCurrentSchemaVersion(): number {
  return SCHEMA_VERSION;
}

export async function migrateSchemaIfNeeded(targetVersion: number = SCHEMA_VERSION): Promise<void> {
  // Minimal stub: nothing to migrate yet. In future, apply versioned migrations here.
  if (targetVersion !== SCHEMA_VERSION) {
    // no-op in this minimal implementation
  }
}
