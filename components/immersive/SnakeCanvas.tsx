"use client";

import React, { useEffect, useRef, useState } from 'react';
import { initGame, step, changeDirection, updateSpeed, updateWrap } from '@/frontend/game/snake/core';
import { renderToCanvas } from '@/frontend/game/snake/renderer/canvas';
import { emitSnakeFoodConsumed } from '@/frontend/lib/telemetry/events';

interface SnakeCanvasProps {
  options: string[];
  correctLabel?: string;
  onAnswerConsumed?: (isCorrect: boolean) => void;
}

export default function SnakeCanvas({ options, correctLabel, onAnswerConsumed }: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);
  const [state, setState] = useState(() =>
    initGame({ speedMs: 200, wrap: true }, (options || []).slice(0, 4).map((label, i) => ({ id: `opt-${i}`, label }))
  ));
  const [speed, setSpeed] = useState<number>(200);
  const [wrap, setWrap] = useState<boolean>(true);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') setState((s) => changeDirection(s, 'up'));
      if (e.key === 'ArrowDown') setState((s) => changeDirection(s, 'down'));
      if (e.key === 'ArrowLeft') setState((s) => changeDirection(s, 'left'));
      if (e.key === 'ArrowRight') setState((s) => changeDirection(s, 'right'));
      if (e.key === ' ') setRunning((r) => !r);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Game loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastScore = state.score;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!running) return;
      if (now - last >= state.cfg.speedMs) {
        last = now;
        setState((s) => {
          const next = step(s);
          if (next.score > lastScore) {
            // Find which food label likely eaten (best-effort)
            const eaten = s.foods.find((f) => !next.foods.some((nf) => nf.id === f.id && nf.pos.x === f.pos.x && nf.pos.y === f.pos.y));
            if (eaten) {
              const isCorrect = correctLabel ? eaten.label === correctLabel : true;
              // Telemetry
              emitSnakeFoodConsumed(eaten.label, next.score, next.tick);
              // Adjust growth: if incorrect, neutralize the growth by removing tail once
              if (!isCorrect && next.snake.length > 2) {
                next.snake = next.snake.slice(0, next.snake.length - 1);
              }
              // Notify parent to advance question
              onAnswerConsumed?.(isCorrect);
            }
            lastScore = next.score;
          }
          return next;
        });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, state.cfg.speedMs]);

  // Apply speed changes to game state
  useEffect(() => {
    setState((s) => updateSpeed(s, speed));
  }, [speed]);

  // Apply wrap changes
  useEffect(() => {
    setState((s) => updateWrap(s, wrap));
  }, [wrap]);

  // Seed foods once options arrive (fix: refresh may render before options loaded)
  useEffect(() => {
    if ((options?.length || 0) > 0 && state.foods.length === 0 && state.tick === 0) {
      setState(() =>
        initGame(
          { speedMs: speed, wrap, cols: state.cfg.cols, rows: state.cfg.rows },
          options.slice(0, 4).map((label, i) => ({ id: `opt-${i}`, label }))
        )
      );
    }
  }, [options, speed, wrap]);

  // Replace foods when options change (mid-game reseed without resetting snake)
  useEffect(() => {
    if (!options || options.length === 0) return;
    setState((s) => {
      // local placer similar to core.randomEmptyCell
      const place = (taken: { x: number; y: number }[], cols: number, rows: number, salt: number) => {
        const n = cols * rows;
        for (let i = 0; i < n; i++) {
          const r = (i * 9301 + 49297 + salt * 233) % 233280;
          const x = (r + i * 13) % cols;
          const y = (r + i * 29) % rows;
          const occ = taken.some((t) => t.x === x && t.y === y);
          if (!occ) return { x, y } as const;
        }
        return { x: 0, y: 0 } as const;
      };
      const taken = [...s.snake, ...s.foods.map((f) => f.pos)];
      const newFoods = options.slice(0, 4).map((label, i) => ({ id: `opt-${i}`, label, pos: place(taken, s.cfg.cols, s.cfg.rows, i) }));
      return { ...s, foods: newFoods };
    });
  }, [options]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderToCanvas(ctx, state, 40);
  }, [state]);

  return (
    <div className="relative h-full">
      <canvas ref={canvasRef} data-testid="snake-canvas" className="block w-full h-full" />

      <div className="absolute top-3 right-4 flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-3 py-1 text-sm rounded bg-gray-800/70 hover:bg-gray-700 border border-gray-700"
        >
          {running ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={() => setWrap((w) => !w)}
          className="px-3 py-1 text-sm rounded bg-gray-800/70 hover:bg-gray-700 border border-gray-700"
          aria-pressed={wrap}
        >
          Wrap: {wrap ? 'On' : 'Off'}
        </button>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="px-2 py-1 text-sm rounded bg-gray-800/70 hover:bg-gray-700 border border-gray-700"
          aria-label="Speed"
        >
          <option value={260}>Slow</option>
          <option value={200}>Normal</option>
          <option value={140}>Fast</option>
        </select>
      </div>
    </div>
  );
}
