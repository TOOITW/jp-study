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

  // Keep latest props in refs to avoid stale closures inside the game loop
  useEffect(() => {
    correctRef.current = correctLabel;
  }, [correctLabel]);
  useEffect(() => {
    onConsumedRef.current = onAnswerConsumed;
  }, [onAnswerConsumed]);

  // Keyboard controls (Arrow keys + WASD)
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
          // 穩健的吃到判定：蛇長度是否增加
          if (next.snake.length > s.snake.length) {
            // 以新頭部位置對照「舊」foods 的位置，找出被吃掉的食物
            const head = next.snake[0];
            const eaten = s.foods.find((f) => f.pos.x === head.x && f.pos.y === head.y);
            if (eaten) {
              const currentCorrect = correctRef.current;
              const isCorrect = currentCorrect ? eaten.label === currentCorrect : true;
              // Telemetry
              emitSnakeFoodConsumed(eaten.label, next.score, next.tick);
              // 錯誤：
              // - Core 已加長 +1、加分 +1
              // - 我們要「淨縮短 1、分數 -1」
              //   → 額外裁掉 2 節（若可），分數設為 max(0, s.score - 1)
              if (!isCorrect) {
                const canRemove = Math.max(0, Math.min(2, next.snake.length - 1));
                if (canRemove > 0) {
                  next.snake = next.snake.slice(0, next.snake.length - canRemove);
                }
                next.score = Math.max(0, s.score - 1);
              }
              // 延後通知父層，避免在子元件的 state 計算/渲染階段觸發父層 setState
              pendingConsumeRef.current = { label: eaten.label, isCorrect, score: next.score };
            }
          }
          return next;
        });

        // 在此次 state 更新排入後、使用微任務於 commit 後通知父層
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
    renderToCanvas(ctx, state, 40, { suppressGameOver });
  }, [state, suppressGameOver]);

  return (
    <div className="relative inline-block">
      <canvas ref={canvasRef} data-testid="snake-canvas" className="block" />

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
