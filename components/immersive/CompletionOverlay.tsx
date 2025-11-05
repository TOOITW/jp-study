"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface CompletionStats {
  totalQuestions: number;
  correct: number;
  score: number;
  durationMs: number;
  longestStreak: number;
}

interface CompletionOverlayProps {
  stats: CompletionStats;
  onPlayAgain: () => void;
}

function getRating(accuracy: number): { grade: string; color: string; message: string } {
  if (accuracy >= 90) return { grade: 'S', color: 'text-yellow-400', message: '完璧！' };
  if (accuracy >= 75) return { grade: 'A', color: 'text-emerald-400', message: '素晴らしい！' };
  if (accuracy >= 60) return { grade: 'B', color: 'text-blue-400', message: '良い！' };
  return { grade: 'C', color: 'text-gray-400', message: '頑張ろう！' };
}

export default function CompletionOverlay({ stats, onPlayAgain }: CompletionOverlayProps) {
  const router = useRouter();
  const accuracy = Math.round((stats.correct / stats.totalQuestions) * 100);
  const durationSec = Math.floor(stats.durationMs / 1000);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const rating = getRating(accuracy);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }} data-testid="completion-overlay">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">完了！</h2>
          <p className="text-gray-400">全ての問題を終えました</p>
        </div>

        {/* Rating */}
        <div className="text-center mb-8">
          <div className={`text-7xl font-bold ${rating.color} mb-2`}>{rating.grade}</div>
          <div className="text-xl text-gray-300">{rating.message}</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">正解率</div>
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">スコア</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.score}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">時間</div>
            <div className="text-2xl font-bold text-white">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">連続正解</div>
            <div className="text-2xl font-bold text-blue-400">{stats.longestStreak}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            data-testid="play-again-btn"
          >
            もう一度
          </button>
          <button
            onClick={() => router.push('/today')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            data-testid="back-menu-btn"
          >
            メニューへ
          </button>
        </div>
      </div>
    </div>
  );
}
