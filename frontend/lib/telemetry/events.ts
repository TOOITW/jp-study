/**
 * Telemetry Events Module
 *
 * Defines event schemas and provides functions to emit telemetry events
 * for tracking drill sessions, answer correctness, and completion metrics.
 */

import { EventEmitter } from 'events';

/**
 * JSON Schema definitions for telemetry events
 */

export const drillStartedEventSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', const: 'drill_started' },
    sessionId: { type: 'string' },
    date: { type: 'string' },
    questionCount: { type: 'number' },
    clientTs: { type: 'number' },
  },
  required: ['type', 'sessionId', 'date', 'questionCount', 'clientTs'],
};

export const answerEventSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['answer_correct', 'answer_incorrect'] },
    sessionId: { type: 'string' },
    questionId: { type: 'string' },
    isCorrect: { type: 'boolean' },
    latencyMs: { type: 'number' },
    clientTs: { type: 'number' },
  },
  required: ['type', 'sessionId', 'questionId', 'isCorrect', 'latencyMs', 'clientTs'],
};

export const sessionCompletedEventSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', const: 'session_completed' },
    sessionId: { type: 'string' },
    total: { type: 'number' },
    correct: { type: 'number' },
    accuracy: { type: 'number' },
    durationMs: { type: 'number' },
    clientTs: { type: 'number' },
  },
  required: ['type', 'sessionId', 'total', 'correct', 'accuracy', 'durationMs', 'clientTs'],
};

/**
 * Global event emitter for telemetry events
 */
export const telemetryEmitter = new EventEmitter();

/**
 * Type definitions for telemetry events
 */
export interface DrillStartedEvent {
  type: 'drill_started';
  sessionId: string;
  date: string;
  questionCount: number;
  clientTs: number;
}

export interface AnswerEvent {
  type: 'answer_correct' | 'answer_incorrect';
  sessionId: string;
  questionId: string;
  isCorrect: boolean;
  latencyMs: number;
  clientTs: number;
}

export interface SessionCompletedEvent {
  type: 'session_completed';
  sessionId: string;
  total: number;
  correct: number;
  accuracy: number;
  durationMs: number;
  clientTs: number;
}

export type TelemetryEvent = DrillStartedEvent | AnswerEvent | SessionCompletedEvent;

/**
 * Validate a telemetry event against its schema
 *
 * @param event - The event to validate
 * @returns true if event is valid, false otherwise
 */
export function validateEvent(event: any): boolean {
  if (!event || typeof event !== 'object') return false;

  const { type } = event;

  switch (type) {
    case 'drill_started':
      return validateAgainstSchema(event, drillStartedEventSchema);
    case 'answer_correct':
    case 'answer_incorrect':
      return validateAgainstSchema(event, answerEventSchema);
    case 'session_completed':
      return validateAgainstSchema(event, sessionCompletedEventSchema);
    default:
      return false;
  }
}

/**
 * Simple schema validator (checks required fields)
 */
function validateAgainstSchema(event: any, schema: any): boolean {
  const required = schema.required || [];
  for (const field of required) {
    if (!(field in event)) {
      return false;
    }
  }
  return true;
}

/**
 * Emit a drill_started event
 */
export function emitDrillStarted(sessionId: string, questionCount: number): void {
  const event: DrillStartedEvent = {
    type: 'drill_started',
    sessionId,
    date: new Date().toISOString().split('T')[0],
    questionCount,
    clientTs: Date.now(),
  };

  if (validateEvent(event)) {
    telemetryEmitter.emit('event', event);
  }
}

/**
 * Emit an answer event (correct or incorrect)
 */
export function emitAnswerEvent(
  sessionId: string,
  questionId: string,
  isCorrect: boolean,
  latencyMs: number
): void {
  const event: AnswerEvent = {
    type: isCorrect ? 'answer_correct' : 'answer_incorrect',
    sessionId,
    questionId,
    isCorrect,
    latencyMs,
    clientTs: Date.now(),
  };

  if (validateEvent(event)) {
    telemetryEmitter.emit('event', event);
  }
}

/**
 * Emit a session_completed event
 */
export function emitSessionCompleted(
  sessionId: string,
  total: number,
  correct: number,
  accuracy: number,
  durationMs: number
): void {
  const event: SessionCompletedEvent = {
    type: 'session_completed',
    sessionId,
    total,
    correct,
    accuracy,
    durationMs,
    clientTs: Date.now(),
  };

  if (validateEvent(event)) {
    telemetryEmitter.emit('event', event);
  }
}
