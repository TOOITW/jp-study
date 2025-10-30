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
      <div data-testid="drill-loading" className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded w-48 mb-4 mx-auto"></div>
            <div className="h-6 bg-gray-300 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'completed' && sessionSummary) {
    return (
      <div data-testid="session-completed" className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">セッション完了</h1>
          <p className="text-xl mb-2">正解率: {sessionSummary.accuracy.toFixed(1)}%</p>
          <p className="text-lg text-gray-600">
            {sessionSummary.correctAnswers} / {sessionSummary.totalQuestions} 問正解
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <button
              data-testid="retry-button"
              className="px-6 py-2 bg-blue-500 text-white rounded"
            >
              もう一度
            </button>
            <button
              data-testid="finish-button"
              className="px-6 py-2 bg-gray-500 text-white rounded"
            >
              終了
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionData?.questions?.[currentQuestionIndex];

  return (
    <div data-testid="drill-page" className="min-h-screen bg-gray-50">
      {/* Header */}
      <SessionHeader
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={sessionData?.questions?.length || 0}
        correctCount={Object.entries(answers).filter(([idx, ans]) => {
          const question = sessionData?.questions?.[parseInt(idx)];
          return question?.answerKey === ans;
        }).length}
        startedAt={sessionData?.createdAt}
      />

      {/* Main content */}
      <div className="container mx-auto p-4">
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

        {/* Actions */}
        <div className="mt-8 mb-20">
          <ActionsBar
            onNext={() => handleNextQuestion(answers[currentQuestionIndex] || '')}
            onSkip={handleSkip}
            isAnswered={!!answers[currentQuestionIndex]}
            isLastQuestion={currentQuestionIndex === (sessionData?.questions?.length || 0) - 1}
          />
        </div>
      </div>
    </div>
  );
}
