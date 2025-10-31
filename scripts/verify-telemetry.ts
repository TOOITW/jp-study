/**
 * Telemetry Event Verification Script
 * 
 * Listens to telemetry events and validates their format
 * Usage: ts-node scripts/verify-telemetry.ts
 */

import { telemetryEmitter, validateEvent } from '../frontend/lib/telemetry/events';

console.log('🔍 Telemetry Event Monitor Started');
console.log('📊 Listening for events: drill_started, answer_correct/incorrect, session_completed\n');

const events: any[] = [];

telemetryEmitter.on('event', (event: any) => {
  events.push(event);
  
  const isValid = validateEvent(event);
  const timestamp = new Date(event.clientTs).toISOString();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📡 Event Type: ${event.type}`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log(`✅ Valid: ${isValid ? 'YES' : 'NO'}`);
  console.log(`📋 Event Data:`);
  console.log(JSON.stringify(event, null, 2));
  
  if (event.type === 'drill_started') {
    console.log(`\n📌 Session ID: ${event.sessionId}`);
    console.log(`📚 Question Count: ${event.questionCount}`);
  }
  
  if (event.type === 'answer_correct' || event.type === 'answer_incorrect') {
    console.log(`\n📌 Session ID: ${event.sessionId}`);
    console.log(`❓ Question ID: ${event.questionId}`);
    console.log(`${event.isCorrect ? '✅' : '❌'} Correct: ${event.isCorrect}`);
    console.log(`⏱️  Latency: ${event.latencyMs}ms`);
  }
  
  if (event.type === 'session_completed') {
    console.log(`\n📌 Session ID: ${event.sessionId}`);
    console.log(`📊 Total: ${event.total} | Correct: ${event.correct}`);
    console.log(`🎯 Accuracy: ${event.accuracy.toFixed(1)}%`);
    console.log(`⏱️  Duration: ${(event.durationMs / 1000).toFixed(1)}s`);
  }
});

// Simulate test events after 1 second
setTimeout(() => {
  console.log('\n\n🧪 Running Test Simulation...\n');
  
  const { emitDrillStarted, emitAnswerEvent, emitSessionCompleted } = require('../frontend/lib/telemetry/events');
  
  const testSessionId = `test-session-${Date.now()}`;
  
  // Test 1: drill_started
  emitDrillStarted(testSessionId, 10);
  
  // Test 2: answer events
  setTimeout(() => {
    emitAnswerEvent(testSessionId, 'q-001', true, 2500);
    emitAnswerEvent(testSessionId, 'q-002', false, 4200);
    emitAnswerEvent(testSessionId, 'q-003', true, 1800);
  }, 500);
  
  // Test 3: session_completed
  setTimeout(() => {
    emitSessionCompleted(testSessionId, 10, 8, 80.0, 45000);
    
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('✅ Test Simulation Complete!');
    console.log(`📊 Total Events Captured: ${events.length}`);
    console.log(`${'='.repeat(60)}\n`);
    
    process.exit(0);
  }, 1500);
}, 1000);
