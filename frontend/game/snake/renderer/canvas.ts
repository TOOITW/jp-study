import { GameState } from '../types';

type RenderOptions = {
  suppressGameOver?: boolean;
};

export function renderToCanvas(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellSize = 40,
  options?: RenderOptions
) {
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

  // Foods with numeric labels (1..N) for readability
  state.foods.forEach((f, idx) => {
    const x = f.pos.x * cellSize;
    const y = f.pos.y * cellSize;
    ctx.fillStyle = '#f59e0b'; // amber
    ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);

    // Number overlay
    ctx.fillStyle = '#111827'; // gray-900 for contrast
    ctx.font = `bold ${Math.floor(cellSize * 0.5)}px ui-sans-serif, system-ui, -apple-system`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(idx + 1), x + cellSize / 2, y + cellSize / 2 + 1);
  });

  // Snake
  ctx.fillStyle = '#10b981';
  state.snake.forEach((s, idx) => {
    const pad = idx === 0 ? 3 : 6;
    ctx.fillRect(s.x * cellSize + pad, s.y * cellSize + pad, cellSize - pad * 2, cellSize - pad * 2);
  });

  // HUD - move Score away from edge to prevent clipping
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 16px ui-sans-serif, system-ui, -apple-system';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${state.score}`, 16, 16);

  if (state.gameOver && !options?.suppressGameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px ui-sans-serif, system-ui, -apple-system';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', w / 2, h / 2);
    ctx.textAlign = 'start';
  }
}
