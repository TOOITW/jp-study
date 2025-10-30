/**
 * ActionsBar Component
 *
 * Displays action buttons at the bottom of the drill page:
 * - Submit/Next (after answering)
 * - Skip (optionally)
 */

'use client';

import React from 'react';

export interface ActionsBarProps {
  onNext: () => void;
  onSkip?: () => void;
  isAnswered: boolean;
  isLastQuestion?: boolean;
}

export const ActionsBar: React.FC<ActionsBarProps> = ({
  onNext,
  onSkip,
  isAnswered,
  isLastQuestion = false,
}) => {
  return (
    <footer
      data-testid="drill-actions"
      className="bg-white border-t border-gray-200 shadow-lg sticky bottom-0"
    >
      <div className="max-w-2xl mx-auto px-4 py-4 flex gap-4 justify-center">
        {/* Next/Submit Button */}
        <button
          data-testid="submit-answer-button"
          data-testid-alt="next-question-button"
          onClick={onNext}
          disabled={!isAnswered}
          className={`px-6 py-2 font-semibold rounded-lg transition-all ${
            isAnswered
              ? 'bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLastQuestion ? '完了' : isAnswered ? '次へ' : '回答を選択してください'}
        </button>

        {/* Skip Button (optional) */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-6 py-2 font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            スキップ
          </button>
        )}
      </div>
    </footer>
  );
};
