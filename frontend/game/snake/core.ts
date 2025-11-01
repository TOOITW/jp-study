import { Direction, Food, GameConfig, GameState, GridPos } from './types';

export function initGame(cfg: Partial<GameConfig> = {}, seedFoods: Omit<Food, 'pos'>[] = []): GameState {
  const config: GameConfig = {
    cols: cfg.cols ?? 20,
    rows: cfg.rows ?? 14,
    speedMs: cfg.speedMs ?? 200,
    wrap: cfg.wrap ?? false,
  };

  const center: GridPos = { x: Math.floor(config.cols / 2), y: Math.floor(config.rows / 2) };
  const snake: GridPos[] = [center, { x: center.x - 1, y: center.y }];

  const foods: Food[] = seedFoods.map((f, idx) => ({ ...f, pos: randomEmptyCell(config, snake, [], idx) }));

  return {
    cfg: config,
    snake,
    dir: 'right',
    foods,
    score: 0,
    gameOver: false,
    tick: 0,
  };
}

export function step(state: GameState): GameState {
  if (state.gameOver) return state;

  const head = state.snake[0];
  let nextHead = move(head, state.dir);

  // Wall handling: wrap or collide
  if (
    nextHead.x < 0 ||
    nextHead.x >= state.cfg.cols ||
    nextHead.y < 0 ||
    nextHead.y >= state.cfg.rows
  ) {
    if (state.cfg.wrap) {
      const nx = ((nextHead.x % state.cfg.cols) + state.cfg.cols) % state.cfg.cols;
      const ny = ((nextHead.y % state.cfg.rows) + state.cfg.rows) % state.cfg.rows;
      nextHead = { x: nx, y: ny };
    } else {
      return { ...state, gameOver: true };
    }
  }

  // Self collision
  if (state.snake.some((s) => s.x === nextHead.x && s.y === nextHead.y)) {
    return { ...state, gameOver: true };
  }

  const eatenIdx = state.foods.findIndex((f) => f.pos.x === nextHead.x && f.pos.y === nextHead.y);
  const newSnake = [nextHead, ...state.snake];
  let newFoods = state.foods.slice();
  let score = state.score;

  if (eatenIdx >= 0) {
    score += 1;
    // Respawn that food elsewhere
    const replaced = { ...newFoods[eatenIdx], pos: randomEmptyCell(state.cfg, newSnake, newFoods) };
    newFoods[eatenIdx] = replaced;
  } else {
    newSnake.pop(); // move forward
  }

  return {
    ...state,
    snake: newSnake,
    foods: newFoods,
    score,
    tick: state.tick + 1,
  };
}

export function changeDirection(state: GameState, dir: Direction): GameState {
  // Disallow 180-degree turns
  const opposite: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
  if (opposite[state.dir] === dir) return state;
  return { ...state, dir };
}

export function updateSpeed(state: GameState, speedMs: number): GameState {
  if (!Number.isFinite(speedMs) || speedMs < 40) return state;
  return { ...state, cfg: { ...state.cfg, speedMs } };
}

export function randomEmptyCell(cfg: GameConfig, snake: GridPos[], foods: Food[], salt = 0): GridPos {
  // Simple deterministic-ish PRNG using salt and lengths
  const n = cfg.cols * cfg.rows;
  for (let i = 0; i < n; i++) {
    const r = (i * 9301 + 49297 + salt * 233) % 233280;
    const x = (r + i * 13) % cfg.cols;
    const y = (r + i * 29) % cfg.rows;
    const occupied = snake.some((s) => s.x === x && s.y === y) || foods.some((f) => f.pos.x === x && f.pos.y === y);
    if (!occupied) return { x, y };
  }
  // Fallback
  return { x: 0, y: 0 };
}

function move(p: GridPos, dir: Direction): GridPos {
  switch (dir) {
    case 'up':
      return { x: p.x, y: p.y - 1 };
    case 'down':
      return { x: p.x, y: p.y + 1 };
    case 'left':
      return { x: p.x - 1, y: p.y };
    case 'right':
      return { x: p.x + 1, y: p.y };
  }
}

export function updateWrap(state: GameState, wrap: boolean): GameState {
  return { ...state, cfg: { ...state.cfg, wrap } };
}
