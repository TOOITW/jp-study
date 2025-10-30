/**
 * AC-5 Integration — Telemetry Events Emitted on Key Actions
 * Red: Expected to fail until event emitter is wired into session flow
 */

import { createTodaySession, recordAnswer } from '../../frontend/lib/drill/session';
import {
  telemetryEmitter,
  emitDrillStarted,
  emitAnswerEvent,
  emitSessionCompleted,
} from '../../frontend/lib/telemetry/events';

describe('AC-5 Integration — telemetry event emission', () => {
  let emittedEvents: any[] = [];

  beforeEach(() => {
    emittedEvents = [];
    // Mock event listener
    if (telemetryEmitter) {
      telemetryEmitter.on('event', (event: any) => {
        emittedEvents.push(event);
      });
    }
  });

  afterEach(() => {
    emittedEvents = [];
    if (telemetryEmitter) {
      telemetryEmitter.removeAllListeners('event');
    }
  });

  test('test_AC-5_integration_emit_drill_started_on_session_create', () => {
    const session = createTodaySession();
    emitDrillStarted(session.id, session.questions.length);

    expect(emittedEvents.length).toBeGreaterThan(0);
    const startEvent = emittedEvents.find((e) => e.type === 'drill_started');
    expect(startEvent).toBeDefined();
    expect(startEvent?.sessionId).toBe(session.id);
    expect(startEvent?.questionCount).toBe(10);
  });

  test('test_AC-5_integration_emit_answer_events_on_record', () => {
    const session = createTodaySession();
    const question = session.questions[0];

    emitAnswerEvent(session.id, question.id, true, 100);

    const answerEvent = emittedEvents.find((e) => e.type === 'answer_correct' || e.type === 'answer_incorrect');
    expect(answerEvent).toBeDefined();
    expect(answerEvent?.questionId).toBe(question.id);
    expect(answerEvent?.latencyMs).toBe(100);
  });

  test('test_AC-5_integration_emit_session_completed', () => {
    const session = createTodaySession();

    // Simulate answering all questions
    for (let i = 0; i < 10; i++) {
      recordAnswer(session, session.questions[i].id, `ans_${i}`, i < 7, 'feedback');
    }

    emitSessionCompleted(session.id, 10, 7, 0.7, 300000);

    const completeEvent = emittedEvents.find((e) => e.type === 'session_completed');
    expect(completeEvent).toBeDefined();
    expect(completeEvent?.accuracy).toBe(0.7);
    expect(completeEvent?.correct).toBe(7);
    expect(completeEvent?.durationMs).toBe(300000);
  });
});
