"use client";

import React, { useEffect, useState } from 'react';
import GameShell from '@/components/immersive/GameShell';
import LanguagePanel from '@/components/immersive/LanguagePanel';
import SnakeCanvas from '@/components/immersive/SnakeCanvas';
import { getDailyQuestions } from '@/frontend/lib/drill/question-bank';
import { emitImmersiveEntered } from '@/frontend/lib/telemetry/events';

export default function ImmersiveClient() {
  const [prompt, setPrompt] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const qs = getDailyQuestions(1);
      if (qs && qs[0]) {
        const q = qs[0] as any;
        if (q.type === 'single') {
          setPrompt(q.prompt);
          setOptions(q.options);
        } else if (q.type === 'match') {
          setPrompt(q.instruction);
          setOptions(q.left?.slice(0, 4) || []);
        } else if (q.type === 'fill') {
          setPrompt(q.prompt);
          const opts: string[] = Array.isArray(q.solutions) && q.solutions.length > 0 ? q.solutions[0] : [];
          setOptions(opts.slice(0, 4));
        }
      }
    } catch (e) {
      setPrompt('「食べる」の正しい読みは？');
      setOptions(['たべる', 'のむ', 'いく', 'みる']);
    }

    // Fallback if options still empty
    setOptions((prev) => (prev && prev.length > 0 ? prev : ['①', '②', '③', '④']));

    emitImmersiveEntered('snake');
  }, []);

  return (
    <GameShell>
      <LanguagePanel prompt={prompt} target={options[0] || ''} options={options} />
      <SnakeCanvas options={options} />
    </GameShell>
  );
}
