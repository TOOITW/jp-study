import { renderToCanvas } from '@/frontend/game/snake/renderer/canvas';
import { GameState } from '@/frontend/game/snake/types';

describe('renderer/canvas — Game Over suppression', () => {
  function makeCtx() {
    const calls: any[] = [];
    const ctx: any = {
      canvas: { width: 0, height: 0 },
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fillText: jest.fn((text: string) => calls.push(text)),
    };
    return { ctx: ctx as CanvasRenderingContext2D, calls };
  }

  function makeState(over = false): GameState {
    return {
      cfg: { cols: 4, rows: 3, speedMs: 200, wrap: true },
      snake: [{ x: 1, y: 1 }],
      dir: 'right',
      foods: [],
      score: 0,
      gameOver: over,
      tick: 0,
    };
  }

  it('draws Game Over when gameOver = true by default', () => {
    const { ctx, calls } = makeCtx();
    const s = makeState(true);
    renderToCanvas(ctx, s, 20);
    expect(calls.includes('Game Over')).toBe(true);
  });

  it('does NOT draw Game Over when suppressed via options', () => {
    const { ctx, calls } = makeCtx();
    const s = makeState(true);
    renderToCanvas(ctx, s, 20, { suppressGameOver: true });
    expect(calls.includes('Game Over')).toBe(false);
  });
});
