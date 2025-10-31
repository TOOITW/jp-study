/**
 * Telemetry Event Integration Test
 * Verifies that events are emitted correctly with proper format
 */

import {
  telemetryEmitter,
  emitDrillStarted,
  emitAnswerEvent,
  emitSessionCompleted,
  validateEvent,
  type TelemetryEvent,
} from '../../frontend/lib/telemetry/events';

describe('T022 — Telemetry Event Emission Verification', () => {
  let capturedEvents: TelemetryEvent[] = [];

  beforeEach(() => {
    capturedEvents = [];
    // Set up event listener
    telemetryEmitter.on('event', (event: TelemetryEvent) => {
      capturedEvents.push(event);
    });
  });

  afterEach(() => {
    // Clean up listeners
    telemetryEmitter.removeAllListeners('event');
  });

  test('test_T022_verify_drill_started_emission', () => {
    const sessionId = `test-session-${Date.now()}`;
    const questionCount = 10;

    emitDrillStarted(sessionId, questionCount);

    expect(capturedEvents).toHaveLength(1);
    const event = capturedEvents[0];

    expect(event.type).toBe('drill_started');
    expect(event).toHaveProperty('sessionId', sessionId);
    expect(event).toHaveProperty('questionCount', questionCount);
    expect(event).toHaveProperty('date');
    expect(event).toHaveProperty('clientTs');
    expect(validateEvent(event)).toBe(true);

    console.log('✅ drill_started event:', event);
  });

  test('test_T022_verify_answer_correct_emission', () => {
    const sessionId = `test-session-${Date.now()}`;
    const questionId = 'q-001';
    const latencyMs = 2500;

    emitAnswerEvent(sessionId, questionId, true, latencyMs);

    expect(capturedEvents).toHaveLength(1);
    const event = capturedEvents[0];

    expect(event.type).toBe('answer_correct');
    expect(event).toHaveProperty('sessionId', sessionId);
    expect(event).toHaveProperty('questionId', questionId);
    expect(event).toHaveProperty('isCorrect', true);
    expect(event).toHaveProperty('latencyMs', latencyMs);
    expect(event).toHaveProperty('clientTs');
    expect(validateEvent(event)).toBe(true);

    console.log('✅ answer_correct event:', event);
  });

  test('test_T022_verify_answer_incorrect_emission', () => {
    const sessionId = `test-session-${Date.now()}`;
    const questionId = 'q-002';
    const latencyMs = 4200;

    emitAnswerEvent(sessionId, questionId, false, latencyMs);

    expect(capturedEvents).toHaveLength(1);
    const event = capturedEvents[0];

    expect(event.type).toBe('answer_incorrect');
    expect(event).toHaveProperty('sessionId', sessionId);
    expect(event).toHaveProperty('questionId', questionId);
    expect(event).toHaveProperty('isCorrect', false);
    expect(event).toHaveProperty('latencyMs', latencyMs);
    expect(validateEvent(event)).toBe(true);

    console.log('✅ answer_incorrect event:', event);
  });

  test('test_T022_verify_session_completed_emission', () => {
    const sessionId = `test-session-${Date.now()}`;
    const total = 10;
    const correct = 8;
    const accuracy = 80.0;
    const durationMs = 45000;

    emitSessionCompleted(sessionId, total, correct, accuracy, durationMs);

    expect(capturedEvents).toHaveLength(1);
    const event = capturedEvents[0];

    expect(event.type).toBe('session_completed');
    expect(event).toHaveProperty('sessionId', sessionId);
    expect(event).toHaveProperty('total', total);
    expect(event).toHaveProperty('correct', correct);
    expect(event).toHaveProperty('accuracy', accuracy);
    expect(event).toHaveProperty('durationMs', durationMs);
    expect(event).toHaveProperty('clientTs');
    expect(validateEvent(event)).toBe(true);

    console.log('✅ session_completed event:', event);
  });

  test('test_T022_verify_latency_calculation', () => {
    const sessionId = `test-session-${Date.now()}`;
    const questionId = 'q-test';
    
    // Simulate different latencies
    const latencies = [1500, 2000, 3500, 800, 5000];
    
    latencies.forEach((latency, idx) => {
      emitAnswerEvent(sessionId, `${questionId}-${idx}`, true, latency);
    });

    expect(capturedEvents).toHaveLength(latencies.length);
    
    capturedEvents.forEach((event, idx) => {
      if (event.type === 'answer_correct' || event.type === 'answer_incorrect') {
        expect(event.latencyMs).toBe(latencies[idx]);
        expect(event.latencyMs).toBeGreaterThan(0);
        expect(event.latencyMs).toBeLessThan(10000); // Reasonable upper bound
      }
    });

    console.log('✅ Latency calculations verified');
  });

  test('test_T022_verify_event_sequence', () => {
    const sessionId = `test-session-${Date.now()}`;
    
    // Simulate complete session flow
    emitDrillStarted(sessionId, 3);
    emitAnswerEvent(sessionId, 'q-1', true, 2000);
    emitAnswerEvent(sessionId, 'q-2', false, 3000);
    emitAnswerEvent(sessionId, 'q-3', true, 1500);
    emitSessionCompleted(sessionId, 3, 2, 66.67, 10000);

    expect(capturedEvents).toHaveLength(5);
    expect(capturedEvents[0].type).toBe('drill_started');
    expect(capturedEvents[1].type).toBe('answer_correct');
    expect(capturedEvents[2].type).toBe('answer_incorrect');
    expect(capturedEvents[3].type).toBe('answer_correct');
    expect(capturedEvents[4].type).toBe('session_completed');

    // Verify all events are valid
    capturedEvents.forEach(event => {
      expect(validateEvent(event)).toBe(true);
    });

    console.log('✅ Event sequence verified');
  });
});
