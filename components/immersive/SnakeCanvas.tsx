"use client";

import React, { useEffect, useRef, useState } from 'react';
import { initGame, step, changeDirection, updateSpeed, updateWrap } from '@/frontend/game/snake/core';
import { renderToCanvas } from '@/frontend/game/snake/renderer/canvas';
import { emitSnakeFoodConsumed } from '@/frontend/lib/telemetry/events';

interface SnakeCanvasProps {
  options: string[];
  correctLabel?: string;
  onAnswerConsumed?: (isCorrect: boolean, score: number) => void;
  suppressGameOver?: boolean;
}

export default function SnakeCanvas({ options, correctLabel, onAnswerConsumed, suppressGameOver }: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const correctRef = useRef<string | undefined>(correctLabel);
  const onConsumedRef = useRef<((isCorrect: boolean, score: number) => void) | undefined>(onAnswerConsumed);
  const pendingConsumeRef = useRef<{ label: string; isCorrect: boolean; score: number } | null>(null);
  const [running, setRunning] = useState(true);
  const [state, setState] = useState(() =>
    initGame({ speedMs: 200, wrap: true, cols: 28, rows: 18 }, (options || []).slice(0, 4).map((label, i) => ({ id: `opt-${i}`, label }))
  ));
  const [speed, setSpeed] = useState<number>(200);
  const [wrap, setWrap] = useState<boolean>(true);

  useEffect(() => {
    correctRef.current = correctLabel;
  }, [correctLabel]);
  
  useEffect(() => {
    onConsumedRef.current = onAnswerConsumed;
  }, [onAnswerConsumed]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const c = e.code;
      let handled = false;
      if (k === 'arrowup' || k === 'w' || c === 'KeyW') { setState((s) => changeDirection(s, 'up')); handled = true; }
      else if (k === 'arrowdown' || k === 's' || c === 'KeyS') { setState((s) => changeDirection(s, 'down')); handled = true; }
      else if (k === 'arrowleft' || k === 'a' || c === 'KeyA') { setState((s) => changeDirection(s, 'left')); handled = true; }
      else if (k === 'arrowright' || k === 'd' || c === 'KeyD') { setState((s) => changeDirection(s, 'right')); handled = true; }
      else if (e.key === ' ') { setRunning((r) => !r); handled = true; }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true } as any);
  }, []);

  // Game loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!running) return;
      if (now - last >= state.cfg.speedMs) {
        last = now;
        setState((s) => {
          const next = step(s);
          if (next.snake.length > s.snake.length) {
            const head = next.snake[0];
            const eaten = s.foods.find((f) => f.pos.x === head.x && f.pos.y === head.y);
            if (eaten) {
              const currentCorrect = correctRef.current;
              const isCorrect = currentCorrect ? eaten.label === currentCorrect : true;
              emitSnakeFoodConsumed(eaten.label, next.score, next.tick);
              if (!isCorrect) {
                const canRemove = Math.max(0, Math.min(2, next.snake.length - 1));
                if (canRemove > 0) {
                  next.snake = next.snake.slice(0, next.snake.length - canRemove);
                }
                next.score = Math.max(0, s.score - 1);
              }
              pendingConsumeRef.current = { label: eaten.label, isCorrect, score: next.score };
            }
          }
          return next;
        });

        if (pendingConsumeRef.current) {
          const ev = pendingConsumeRef.current;
          pendingConsumeRef.current = null;
          queueMicrotask(() => {
            onConsumedRef.current?.(ev.isCorrect, ev.score);
          });
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, state.cfg.speedMs]);

  useEffect(() => {
    setState((s) => updateSpeed(s, speed));
  }, [speed]);

  useEffect(() => {
    setState((s) => updateWrap(s, wrap));
  }, [wrap]);

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

  useEffect(() => {
    if (!options || options.length === 0) return;
    setState((s) => {
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

  // Render - 固定使用 30px cellSize，生成 840x540 的 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderToCanvas(ctx, state, 30, { suppressGameOver });
  }, [state, suppressGameOver]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas 
        ref={canvasRef} 
        data-testid="snake-canvas"
        style={{
          display: 'block',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      />

      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        gap: '8px',
        zIndex: 10
      }}>
        <button
          onClick={() => setRunning((r) => !r)}
          style={{
            padding: '6px 12px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '4px',
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            color: 'white',
            border: '1px solid #374151',
            cursor: 'pointer'
          }}
        >
          {running ? '⏸ Pause' : '▶ Resume'}
        </button>
        <button
          onClick={() => setWrap((w) => !w)}
          style={{
            padding: '6px 12px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '4px',
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            color: 'white',
            border: '1px solid #374151',
            cursor: 'pointer'
          }}
          aria-pressed={wrap}
        >
          Wrap: {wrap ? 'On' : 'Off'}
        </button>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{
            padding: '6px 8px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '4px',
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            color: 'white',
            border: '1px solid #374151',
            cursor: 'pointer'
          }}
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
