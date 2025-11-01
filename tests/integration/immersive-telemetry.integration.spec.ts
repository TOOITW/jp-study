import { telemetryEmitter, emitImmersiveEntered, emitSnakeFoodConsumed } from '@/frontend/lib/telemetry/events';

describe('immersive telemetry', () => {
  it('emits immersive_entered', (done) => {
    const onEvent = (evt: any) => {
      if (evt?.type === 'immersive_entered') {
        try {
          expect(evt.mode).toBe('snake');
          expect(typeof evt.clientTs).toBe('number');
          telemetryEmitter.off('event', onEvent);
          done();
        } catch (e) {
          telemetryEmitter.off('event', onEvent);
          done(e);
        }
      }
    };
    telemetryEmitter.on('event', onEvent);
    emitImmersiveEntered('snake');
  });

  it('emits snake_food_consumed', (done) => {
    const onEvent = (evt: any) => {
      if (evt?.type === 'snake_food_consumed') {
        try {
          expect(evt.label).toBe('たべる');
          expect(evt.score).toBe(1);
          expect(typeof evt.tick).toBe('number');
          telemetryEmitter.off('event', onEvent);
          done();
        } catch (e) {
          telemetryEmitter.off('event', onEvent);
          done(e);
        }
      }
    };
    telemetryEmitter.on('event', onEvent);
    emitSnakeFoodConsumed('たべる', 1, 3);
  });
});
