export type GridPos = { x: number; y: number };

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Food {
  id: string;
  label: string;
  pos: GridPos;
}

export interface GameConfig {
  cols: number;
  rows: number;
  speedMs: number;
  wrap: boolean; // whether snake wraps through walls
}

export interface GameState {
  cfg: GameConfig;
  snake: GridPos[]; // head first
  dir: Direction;
  foods: Food[];
  score: number;
  gameOver: boolean;
  tick: number;
}
