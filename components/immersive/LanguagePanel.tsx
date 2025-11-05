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
        <h2 className="text-2xl font-semibold text-white mb-6">{prompt || '読み方を選んでください'}</h2>

        <div className="text-gray-400 text-sm">
          候補:
          {options?.map((opt, i) => (
            <span key={i} className="ml-4">
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded bg-gray-800 text-gray-100 border border-gray-700 mr-2">
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
