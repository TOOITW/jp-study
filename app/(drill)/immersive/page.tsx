'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { isFeatureEnabled } from '@/frontend/lib/featureFlags';
import GameShell from '@/components/immersive/GameShell';
import LanguagePanel from '@/components/immersive/LanguagePanel';
import SnakeCanvas from '@/components/immersive/SnakeCanvas';
import { getDailyQuestions } from '@/frontend/lib/drill/question-bank';
import { emitImmersiveEntered } from '@/frontend/lib/telemetry/events';

export default function ImmersivePage() {
  const enabled = isFeatureEnabled('immersive_snake');
  const [prompt, setPrompt] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    // Load a single question to seed the options panel (temporary MVP source)
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
          // use first solutions as options (flatten)
          const opts: string[] = Array.isArray(q.solutions) && q.solutions.length > 0 ? q.solutions[0] : [];
          setOptions(opts.slice(0, 4));
        }
      }
    } catch (e) {
      // Fallback demo content
      setPrompt('「食べる」の正しい読みは？');
      setOptions(['たべる', 'のむ', 'いく', 'みる']);
    }
      if (enabled) {
        emitImmersiveEntered('snake');
      }
  }, []);

  if (!enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white border rounded-lg p-6 text-center">
          <h1 className="text-2xl font-semibold mb-3">Immersive Snake Mode</h1>
          <p className="text-gray-600 mb-4">此功能目前在實驗階段，尚未對所有使用者開放。</p>
          <p className="text-sm text-gray-500 mb-6">要試用，請加上網址參數 <code>?immersive_snake=1</code> 或設定環境變數 <code>NEXT_PUBLIC_FEATURE_IMMERSIVE_SNAKE=1</code>。</p>
          <a href="/" className="inline-block px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">返回首頁</a>
        </div>
      </div>
    );
  }

  return (
    <GameShell>
      <LanguagePanel prompt={prompt} target={options[0] || ''} options={options} />
      <SnakeCanvas options={options} />
    </GameShell>
  );
}
