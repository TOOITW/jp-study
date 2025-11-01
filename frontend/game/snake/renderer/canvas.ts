import { GameState } from '../types';

export function renderToCanvas(ctx: CanvasRenderingContext2D, state: GameState, cellSize = 32) {
  const { cols, rows } = state.cfg;
  const w = cols * cellSize;
  const h = rows * cellSize;

  // Resize canvas if needed
  if (ctx.canvas.width !== w) ctx.canvas.width = w;
  if (ctx.canvas.height !== h) ctx.canvas.height = h;

  // Background
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, w, h);

  // Grid (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize + 0.5, 0);
    ctx.lineTo(x * cellSize + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize + 0.5);
    ctx.lineTo(w, y * cellSize + 0.5);
    ctx.stroke();
  }

  // Foods
  for (const f of state.foods) {
    ctx.fillStyle = '#f59e0b'; // amber
    ctx.fillRect(f.pos.x * cellSize + 4, f.pos.y * cellSize + 4, cellSize - 8, cellSize - 8);
  }

  // Snake
  ctx.fillStyle = '#10b981';
  state.snake.forEach((s, idx) => {
    const pad = idx === 0 ? 3 : 6;
    ctx.fillRect(s.x * cellSize + pad, s.y * cellSize + pad, cellSize - pad * 2, cellSize - pad * 2);
  });

  // HUD
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '14px ui-sans-serif, system-ui, -apple-system';
  ctx.fillText(`Score: ${state.score}`, 10, 20);

  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px ui-sans-serif, system-ui, -apple-system';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', w / 2, h / 2);
    ctx.textAlign = 'start';
  }
}
