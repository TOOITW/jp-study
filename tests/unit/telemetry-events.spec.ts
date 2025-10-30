/**
 * AC-5 Unit — Telemetry Event Shape Validation
 * Red: Expected to fail until telemetry/events module is implemented
 */

import {
  drillStartedEventSchema,
  answerEventSchema,
  sessionCompletedEventSchema,
  validateEvent,
} from '../../frontend/lib/telemetry/events';

describe('AC-5 Unit — Telemetry event shapes', () => {
  test('test_AC-5_unit_telemetry_drill_started_schema', () => {
    const schema = drillStartedEventSchema;
    expect(schema).toHaveProperty('type');
    expect(schema).toHaveProperty('properties');
    expect(schema.properties).toHaveProperty('sessionId');
    expect(schema.properties).toHaveProperty('date');
    expect(schema.properties).toHaveProperty('questionCount');
    expect(schema.properties).toHaveProperty('clientTs');
  });

  test('test_AC-5_unit_telemetry_answer_event_schema', () => {
    const schema = answerEventSchema;
    expect(schema).toHaveProperty('type');
    expect(schema).toHaveProperty('properties');
    expect(schema.properties).toHaveProperty('sessionId');
    expect(schema.properties).toHaveProperty('questionId');
    expect(schema.properties).toHaveProperty('isCorrect');
    expect(schema.properties).toHaveProperty('latencyMs');
    expect(schema.properties).toHaveProperty('clientTs');
  });

  test('test_AC-5_unit_telemetry_session_completed_schema', () => {
    const schema = sessionCompletedEventSchema;
    expect(schema).toHaveProperty('type');
    expect(schema).toHaveProperty('properties');
    expect(schema.properties).toHaveProperty('sessionId');
    expect(schema.properties).toHaveProperty('total');
    expect(schema.properties).toHaveProperty('correct');
    expect(schema.properties).toHaveProperty('accuracy');
    expect(schema.properties).toHaveProperty('durationMs');
    expect(schema.properties).toHaveProperty('clientTs');
  });

  test('test_AC-5_unit_telemetry_validate_event', () => {
    // Valid drill_started event
    const validEvent = {
      type: 'drill_started',
      sessionId: 'sess-123',
      date: '2025-10-30',
      questionCount: 10,
      clientTs: Date.now(),
    };
    expect(validateEvent(validEvent)).toBe(true);

    // Invalid event (missing required field)
    const invalidEvent = {
      type: 'drill_started',
      sessionId: 'sess-123',
      // date: missing
      questionCount: 10,
      clientTs: Date.now(),
    };
    expect(validateEvent(invalidEvent)).toBe(false);
  });
});
