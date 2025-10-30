/**
 * QuestionCard Component
 *
 * Displays a question with answer options based on question type.
 * Supports single-choice, match, and fill-in-the-blank questions.
 */

'use client';

import React, { useState } from 'react';

export type QuestionType = 'single' | 'match' | 'fill';

export interface SingleQuestion {
  id: string;
  type: 'single';
  prompt: string;
  options: string[];
  answerKey: string;
}

export interface MatchQuestion {
  id: string;
  type: 'match';
  prompt: string;
  pairs: Array<{ left: string; right: string }>;
  answerKey: string[];
}

export interface FillQuestion {
  id: string;
  type: 'fill';
  prompt: string;
  solutions: string[];
}

export type Question = SingleQuestion | MatchQuestion | FillQuestion;

export interface QuestionCardProps {
  question: Question;
  onAnswerSelect: (answer: string | string[]) => void;
  disabled?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswerSelect,
  disabled = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);

  const handleSelectOption = (option: string) => {
    setSelectedAnswer(option);
    onAnswerSelect(option);
  };

  const handleFillInput = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleMatchSelection = (pairs: string[]) => {
    setSelectedAnswer(pairs);
    onAnswerSelect(pairs);
  };

  return (
    <div
      data-testid="question-card"
      data-question-id={question.id}
      className="bg-white rounded-lg shadow-md p-6 my-4 border border-gray-200"
    >
      {/* Question Text */}
      <h2 data-testid="question-text" className="text-lg font-semibold text-gray-800 mb-4">
        {question.prompt}
      </h2>

      {/* Single Choice */}
      {question.type === 'single' && (
        <div className="space-y-2">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              data-testid="answer-option"
              data-selected={selectedAnswer === option ? 'true' : 'false'}
              onClick={() => handleSelectOption(option)}
              disabled={disabled}
              className={`w-full text-left p-3 rounded border-2 transition-all ${
                selectedAnswer === option
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Fill in the Blank */}
      {question.type === 'fill' && (
        <div className="space-y-2">
          <input
            data-testid="fill-input"
            type="text"
            placeholder="回答..."
            value={selectedAnswer ? String(selectedAnswer) : ''}
            onChange={(e) => handleFillInput(e.target.value)}
            disabled={disabled}
            className="w-full p-3 border-2 border-gray-200 rounded focus:border-indigo-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500">
            {question.solutions.length > 0 && `可能答案: ${question.solutions.join(', ')}`}
          </p>
        </div>
      )}

      {/* Match Pairs */}
      {question.type === 'match' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">左側</h3>
            <div className="space-y-2">
              {question.pairs.map((pair, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                  {pair.left}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">右側</h3>
            <div className="space-y-2">
              {question.pairs.map((pair, idx) => (
                <button
                  key={idx}
                  data-testid="match-option"
                  onClick={() => handleMatchSelection([...question.pairs.map((_, i) => (i === idx ? '1' : '0'))])}
                  disabled={disabled}
                  className="w-full text-left p-2 bg-gray-50 rounded text-sm hover:bg-indigo-50 border border-gray-200 transition-all"
                >
                  {pair.right}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
