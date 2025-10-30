/**
 * SessionHeader Component
 *
 * Displays session progress: current question number, total questions,
 * and accuracy so far.
 */

'use client';

import React from 'react';

export interface SessionHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  correctCount?: number;
  startedAt?: number;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  correctCount = 0,
  startedAt,
}) => {
  const progressPercent = (currentQuestion / totalQuestions) * 100;
  const elapsedSeconds = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <header
      data-testid="drill-header"
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 shadow-sm"
    >
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span data-testid="progress-text" className="text-sm font-semibold text-gray-700">
              {currentQuestion} of {totalQuestions}
            </span>
            <span className="text-xs text-gray-500">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
          <div data-testid="progress-bar" className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between items-center text-xs">
          <div className="text-gray-600">
            正確: <span className="font-bold text-green-600">{correctCount}</span>
          </div>
          <div className="text-gray-600">
            準確率: <span className="font-bold text-blue-600">
              {totalQuestions > 0 ? ((correctCount / currentQuestion) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SessionHeader;
