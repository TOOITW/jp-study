'use client';

import React, { useState, useEffect } from 'react';
import SessionHeader from '@/components/drill/SessionHeader';
import QuestionCard from '@/components/drill/QuestionCard';
import ActionsBar from '@/components/drill/ActionsBar';

type LoadingState = 'loading' | 'content' | 'completed';

export default function DailyDrillPage() {
  const [state, setState] = useState<LoadingState>('loading');
  const [sessionData, setSessionData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  useEffect(() => {
    // Initialize session with mock data
    const initializeSession = async () => {
      try {
        // Mock session data for development
        const mockSession = {
          id: 'session-001',
          createdAt: Date.now(),
          questions: [
            {
              id: 'q1',
              type: 'single',
              prompt: '「新しい」の意味は何ですか？',
              options: ['古い', '新しい', '美しい', '大きい'],
              answerKey: '新しい',
            },
            {
              id: 'q2',
              type: 'single',
              prompt: '「食べる」の過去形は？',
              options: ['食べた', '食べます', '食べる', '食べよう'],
              answerKey: '食べた',
            },
            {
              id: 'q3',
              type: 'single',
              prompt: '「です」は何か？',
              options: ['動詞', 'です詞', 'コピュラ', '名詞'],
              answerKey: 'コピュラ',
            },
          ],
        };
        setSessionData(mockSession);
        setState('content');
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setState('loading');
      }
    };

    initializeSession();
  }, []);

  const handleNextQuestion = (answer: string) => {
    const newAnswers = { ...answers, [currentQuestionIndex]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < (sessionData?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Session completed
      const correctCount = Object.entries(newAnswers).filter(([idx, ans]) => {
        const question = sessionData.questions[parseInt(idx)];
        return question?.answerKey === ans;
      }).length;

      const summary = {
        totalQuestions: sessionData?.questions?.length || 0,
        correctAnswers: correctCount,
        accuracy: (correctCount / (sessionData?.questions?.length || 1)) * 100,
      };
      setSessionSummary(summary);
      setState('completed');
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < (sessionData?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setState('completed');
    }
  };

  if (state === 'loading') {
    return (
      <div data-testid="drill-layout" className="min-h-screen bg-gray-50">
        <div data-testid="skeleton-state" className="flex items-center justify-center min-h-screen">
          <div data-testid="loading-state" className="text-center animate-pulse">
            <div className="h-12 bg-gray-300 rounded w-48 mb-4 mx-auto"></div>
            <div className="h-6 bg-gray-300 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'completed' && sessionSummary) {
    return (
      <div data-testid="drill-layout" className="min-h-screen bg-gray-50">
        <div data-testid="session-completed" className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">セッション完了</h1>
            
            <div data-testid="accuracy-score" className="text-xl mb-2">
              正解率: {sessionSummary.accuracy.toFixed(1)}%
            </div>
            
            <div className="text-lg text-gray-600 mb-6">
              <span data-testid="correct-count">{sessionSummary.correctAnswers}</span>
              {' / '}
              <span data-testid="total-count">{sessionSummary.totalQuestions}</span>
              {' 問正解'}
            </div>

            {/* Wrong questions section (placeholder for future) */}
            {sessionSummary.correctAnswers < sessionSummary.totalQuestions && (
              <div data-testid="wrong-questions-section" className="mb-6 p-4 bg-red-50 rounded-lg">
                <h3 className="text-lg font-semibold text-red-700 mb-2">不正解の問題</h3>
                <ul className="text-left space-y-2">
                  {/* Will be populated with wrong questions in future */}
                  <li className="text-sm text-gray-600">準備中...</li>
                </ul>
              </div>
            )}

            <div data-testid="session-actions" className="mt-6 flex gap-4 justify-center">
              <button
                data-testid="retry-button"
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                もう一度
              </button>
              <button
                data-testid="finish-button"
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                終了
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionData?.questions?.[currentQuestionIndex];

  return (
    <div data-testid="drill-layout" className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div data-testid="drill-header">
        <SessionHeader
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={sessionData?.questions?.length || 0}
          correctCount={Object.entries(answers).filter(([idx, ans]) => {
            const question = sessionData?.questions?.[parseInt(idx)];
            return question?.answerKey === ans;
          }).length}
          startedAt={sessionData?.createdAt}
        />
      </div>

      {/* Main content body */}
      <div data-testid="drill-body" className="flex-1 container mx-auto p-4">
        <div data-testid="drill-content" className="mt-8">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              onAnswerSelect={(answer) => {
                if (typeof answer === 'string') {
                  handleNextQuestion(answer);
                }
              }}
            />
          )}
        </div>

        {/* Answer Feedback (shown after selecting an answer) */}
        {answers[currentQuestionIndex] && (
          <div data-testid="answer-feedback" className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">回答が記録されました。「次へ」ボタンをクリックして続行してください。</p>
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div data-testid="drill-actions" className="sticky bottom-0">
        <ActionsBar
          onNext={() => handleNextQuestion(answers[currentQuestionIndex] || '')}
          onSkip={handleSkip}
          isAnswered={!!answers[currentQuestionIndex]}
          isLastQuestion={currentQuestionIndex === (sessionData?.questions?.length || 0) - 1}
        />
      </div>
    </div>
  );
}
