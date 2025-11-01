"use client";

import React from 'react';

interface LanguagePanelProps {
  prompt: string;
  target: string;
  options: string[];
}

export default function LanguagePanel({ prompt, target, options }: LanguagePanelProps) {
  return (
    <div data-testid="language-panel" className="h-full flex flex-col justify-center">
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <div className="text-gray-300 text-sm mb-2">問題</div>
        <h2 className="text-2xl font-semibold text-white mb-4">{prompt || '読み方を選んでください'}</h2>

        <div className="text-gray-300 text-sm mb-1">目標</div>
        <div className="text-3xl font-bold text-emerald-400 tracking-wide mb-4" data-testid="target-word">
          {target || (options && options[0]) || ''}
        </div>
        <div className="text-gray-400 text-xs">
          候補:
          {options?.map((opt, i) => (
            <span key={i} className="ml-2">
              <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-semibold rounded bg-gray-800 text-gray-100 border border-gray-700 mr-1">
                {i + 1}
              </span>
              {opt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
