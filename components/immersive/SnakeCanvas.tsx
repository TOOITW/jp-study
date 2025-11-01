"use client";

import React, { useEffect, useRef, useState } from 'react';
import { initGame, step, changeDirection } from '@/frontend/game/snake/core';
import { renderToCanvas } from '@/frontend/game/snake/renderer/canvas';
import { emitSnakeFoodConsumed } from '@/frontend/lib/telemetry/events';

interface SnakeCanvasProps {
  options: string[];
}

export default function SnakeCanvas({ options }: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);
  const [state, setState] = useState(() => initGame({}, (options || []).slice(0, 4).map((label, i) => ({ id: `opt-${i}`, label }))));

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
            if (eaten) emitSnakeFoodConsumed(eaten.label, next.score, next.tick);
            lastScore = next.score;
          }
          return next;
        });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, state.cfg.speedMs]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderToCanvas(ctx, state);
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
      </div>
    </div>
  );
}
