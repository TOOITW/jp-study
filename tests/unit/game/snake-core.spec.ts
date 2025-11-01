import { initGame, step, changeDirection } from '@/frontend/game/snake/core';

describe('snake core', () => {
  it('initializes with snake and foods', () => {
    const s = initGame({ cols: 10, rows: 8 }, [
      { id: 'a', label: 'あ' },
      { id: 'i', label: 'い' },
    ]);
    expect(s.snake.length).toBeGreaterThanOrEqual(2);
    expect(s.foods.length).toBe(2);
    expect(s.gameOver).toBe(false);
  });

  it('moves forward and grows when eating', () => {
    const s0 = initGame({ cols: 8, rows: 6 }, [{ id: 'a', label: 'あ' }]);
    // Place food directly in front of the head
    const head = s0.snake[0];
    s0.foods[0].pos = { x: head.x + 1, y: head.y };
    const s1 = step(s0);
    expect(s1.snake.length).toBe(s0.snake.length + 1);
    expect(s1.score).toBe(s0.score + 1);
  });

  it('ends game on wall collision', () => {
    const s0 = initGame({ cols: 3, rows: 3 });
    // Move right until collision
    let s = s0;
    for (let i = 0; i < 5; i++) s = step(s);
    expect(s.gameOver).toBe(true);
  });

  it('ignores 180-degree turns', () => {
    const s0 = initGame();
    const s1 = changeDirection(s0, 'left');
    expect(s1.dir).toBe('right');
  });
});
