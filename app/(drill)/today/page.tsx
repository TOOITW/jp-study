'use client';

import React, { useState, useEffect } from 'react';
import SessionHeader from '@/components/drill/SessionHeader';
import QuestionCard from '@/components/drill/QuestionCard';
import ActionsBar from '@/components/drill/ActionsBar';
import { getDailyQuestions, type SingleQuestion } from '@/frontend/lib/drill/question-bank';
import { 
  getQuestionsFromCache, 
  saveQuestionsToCache, 
  getCacheInfo 
} from '@/frontend/lib/storage/indexeddb';

type LoadingState = 'loading' | 'content' | 'completed' | 'error' | 'empty';

export default function DailyDrillPage() {
  const [state, setState] = useState<LoadingState>('loading');
  const [sessionData, setSessionData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Initialize session with offline-first strategy
    const initializeSession = async () => {
      try {
        // Check if error should be simulated (for E2E testing)
        const url = new URL(window.location.href);
        if (url.searchParams.get('error') === 'true') {
          setErrorMessage('Failed to load questions. Please try again.');
          setState('error');
          return;
        }

        if (url.searchParams.get('empty') === 'true') {
          setState('empty');
          return;
        }

        // 🎯 離線優先策略：先檢查快取
        let questions = await getQuestionsFromCache();
        let fromCache = false;

        if (questions.length > 0) {
          // ✅ 快取命中：直接使用
          fromCache = true;
          console.log('✅ Loaded from cache:', questions.length, 'questions');
          
          // 顯示快取資訊（開發用）
          const cacheInfo = await getCacheInfo();
          if (cacheInfo) {
            const expiresIn = Math.ceil((cacheInfo.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
            console.log(`📦 Cache expires in ${expiresIn} days`);
          }
        } else {
          // ❌ 快取未命中：從 question-bank 載入
          console.log('📥 Cache miss, loading from question-bank...');
          questions = getDailyQuestions(10);

          if (questions.length > 0) {
            // 儲存到快取
            await saveQuestionsToCache(questions);
            console.log('💾 Saved to cache:', questions.length, 'questions');
          }
        }

        if (questions.length === 0) {
          setState('empty');
          return;
        }

        // Create session with loaded questions
        const session = {
          id: `session-${Date.now()}`,
          createdAt: Date.now(),
          questions: questions.map((q: any) => ({
            id: q.id,
            type: q.type,
            prompt: q.prompt,
            options: q.options,
            answerKey: q.options[q.answerIndex],
            category: q.category,
            difficulty: q.difficulty,
            explanation: q.explanation,
          })),
        };

        setSessionData(session);
        setState('content');
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setErrorMessage('An unexpected error occurred.');
        setState('error');
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
        wrongQuestions: Object.entries(newAnswers)
          .map(([idx, ans]) => {
            const index = parseInt(idx);
            const question = sessionData.questions[index];
            const isCorrect = question?.answerKey === ans;
            return {
              index,
              question,
              userAnswer: ans,
              isCorrect,
            };
          })
          .filter((item) => !item.isCorrect),
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

  const handleRetry = () => {
    // Reset session to start over
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSessionSummary(null);
    setState('content');
  };

  const handleFinish = () => {
    // Redirect to home page or show completion message
    window.location.href = '/';
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

  if (state === 'error') {
    return (
      <div data-testid="drill-layout" className="min-h-screen bg-gray-50">
        <div data-testid="error-state" className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-red-50 rounded-lg border-2 border-red-200 max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
            <p data-testid="error-message" className="text-red-700 mb-6">
              {errorMessage || 'Unable to load the daily drill. Please try again later.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div data-testid="drill-layout" className="min-h-screen bg-gray-50">
        <div data-testid="empty-state" className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-yellow-50 rounded-lg border-2 border-yellow-200 max-w-md">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">問題がありません</h2>
            <p data-testid="empty-message" className="text-yellow-700 mb-6">
              本日の日本語練習問題がまだ利用できません。後でお試しください。
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              ホームに戻る
            </button>
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
              <div data-testid="wrong-questions-section" className="mb-6 p-4 bg-red-50 rounded-lg max-w-2xl w-full">
                <h3 className="text-lg font-semibold text-red-700 mb-4">不正解の問題</h3>
                <ul className="text-left space-y-4">
                  {sessionSummary.wrongQuestions?.map((item: any, idx: number) => (
                    <li key={idx} className="p-3 bg-white border-l-4 border-red-500 rounded">
                      <div className="font-semibold text-gray-800 mb-2">問題 {item.index + 1}:</div>
                      <div className="text-gray-700 mb-2">{item.question?.prompt}</div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div className="bg-red-100 p-2 rounded">
                          <div className="font-semibold text-red-700">あなたの回答:</div>
                          <div className="text-red-600">{item.userAnswer}</div>
                        </div>
                        <div className="bg-green-100 p-2 rounded">
                          <div className="font-semibold text-green-700">正解:</div>
                          <div className="text-green-600">{item.question?.answerKey}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div data-testid="session-actions" className="mt-6 flex gap-4 justify-center">
              <button
                data-testid="retry-button"
                onClick={handleRetry}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                もう一度
              </button>
              <button
                data-testid="finish-button"
                onClick={handleFinish}
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
      <SessionHeader
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={sessionData?.questions?.length || 0}
        correctCount={Object.entries(answers).filter(([idx, ans]) => {
          const question = sessionData?.questions?.[parseInt(idx)];
          return question?.answerKey === ans;
        }).length}
        startedAt={sessionData?.createdAt}
      />

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
