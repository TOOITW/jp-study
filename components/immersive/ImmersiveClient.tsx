"use client";

import React, { useEffect, useMemo, useState, useRef } from 'react';
import GameShell from '@/components/immersive/GameShell';
import LanguagePanel from '@/components/immersive/LanguagePanel';
import SnakeCanvas from '@/components/immersive/SnakeCanvas';
import CompletionOverlay from '@/components/immersive/CompletionOverlay';
import { getDailyQuestions } from '@/frontend/lib/drill/question-bank';
import { emitImmersiveEntered } from '@/frontend/lib/telemetry/events';

export default function ImmersiveClient() {
  const [prompt, setPrompt] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctLabel, setCorrectLabel] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [qIndex, setQIndex] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const finalScoreRef = useRef<number>(0);

  useEffect(() => {
    try {
      const qs = getDailyQuestions(30);
      setQuestions(qs as any[]);
      if (qs && qs[0]) {
        const q = qs[0] as any;
        if (q.type === 'single') {
          setPrompt(q.prompt);
          setOptions(q.options);
          setCorrectLabel(q.options?.[q.answerIndex] ?? q.options?.[0] ?? '');
        } else if (q.type === 'match') {
          setPrompt(q.instruction);
          const opts = q.left?.slice(0, 4) || [];
          setOptions(opts);
          setCorrectLabel(opts?.[0] ?? '');
        } else if (q.type === 'fill') {
          setPrompt(q.prompt);
          const opts: string[] = Array.isArray(q.solutions) && q.solutions.length > 0 ? q.solutions[0] : [];
          const sliced = opts.slice(0, 4);
          setOptions(sliced);
          setCorrectLabel(sliced?.[0] ?? '');
        }
      }
    } catch (e) {
      setPrompt('「食べる」の正しい読みは？');
      const fallback = ['たべる', 'のむ', 'いく', 'みる'];
      setOptions(fallback);
      setCorrectLabel(fallback[0]);
    }

    // Fallback if options still empty
    setOptions((prev) => (prev && prev.length > 0 ? prev : ['①', '②', '③', '④']));
    setCorrectLabel((c) => (c && c.length > 0 ? c : '①'));

    emitImmersiveEntered('snake');
  }, []);

  const handleConsumed = (isCorrect: boolean, score: number) => {
    // Update stats
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setCurrentStreak((s) => {
        const newStreak = s + 1;
        setLongestStreak((longest) => Math.max(longest, newStreak));
        return newStreak;
      });
    } else {
      setCurrentStreak(0);
    }

    // Check if this was the last question
    if (qIndex + 1 >= questions.length) {
      finalScoreRef.current = score;
      setCompleted(true);
      return;
    }

    // Advance to next question
    const nextIndex = qIndex + 1;
    setQIndex(nextIndex);
    const q = questions[nextIndex] as any;
    if (!q) return;
    if (q.type === 'single') {
      setPrompt(q.prompt);
      setOptions(q.options);
      setCorrectLabel(q.options?.[q.answerIndex] ?? q.options?.[0] ?? '');
    } else if (q.type === 'match') {
      setPrompt(q.instruction);
      const opts = q.left?.slice(0, 4) || [];
      setOptions(opts);
      setCorrectLabel(opts?.[0] ?? '');
    } else if (q.type === 'fill') {
      setPrompt(q.prompt);
      const opts: string[] = Array.isArray(q.solutions) && q.solutions.length > 0 ? q.solutions[0] : [];
      const sliced = opts.slice(0, 4);
      setOptions(sliced);
      setCorrectLabel(sliced?.[0] ?? '');
    }
  };

  const handlePlayAgain = () => {
    // Reset all state
    setQIndex(0);
    setCompleted(false);
    setCorrectCount(0);
    setCurrentStreak(0);
    setLongestStreak(0);
    startTimeRef.current = Date.now();
    finalScoreRef.current = 0;
    
    // Reload questions
    const qs = getDailyQuestions(30);
    setQuestions(qs as any[]);
    if (qs && qs[0]) {
      const q = qs[0] as any;
      if (q.type === 'single') {
        setPrompt(q.prompt);
        setOptions(q.options);
        setCorrectLabel(q.options?.[q.answerIndex] ?? q.options?.[0] ?? '');
      } else if (q.type === 'match') {
        setPrompt(q.instruction);
        const opts = q.left?.slice(0, 4) || [];
        setOptions(opts);
        setCorrectLabel(opts?.[0] ?? '');
      } else if (q.type === 'fill') {
        setPrompt(q.prompt);
        const opts: string[] = Array.isArray(q.solutions) && q.solutions.length > 0 ? q.solutions[0] : [];
        const sliced = opts.slice(0, 4);
        setOptions(sliced);
        setCorrectLabel(sliced?.[0] ?? '');
      }
    }
  };

  return (
  <>
    <GameShell>
      <LanguagePanel
        prompt={prompt}
        target={correctLabel || options[0] || ""}
        options={options}
      />

      {/* GameShell 已經處理置中，直接渲染 SnakeCanvas */}
      <SnakeCanvas
        options={options}
        correctLabel={correctLabel}
        onAnswerConsumed={handleConsumed}
        suppressGameOver={completed}
      />
    </GameShell>

    {completed && (
      <CompletionOverlay
        stats={{
          totalQuestions: questions.length,
          correct: correctCount,
          score: finalScoreRef.current,
          durationMs: Date.now() - startTimeRef.current,
          longestStreak,
        }}
        onPlayAgain={handlePlayAgain}
      />
    )}
  </>
);
}
