/**
 * Daily Drill Page - Main Entry Point
 *
 * This page handles:
 * 1. Loading today's drill session
 * 2. Managing drill state (loading, content, completed)
 * 3. Rendering header, question card, and actions
 */

'use client';

import React, { useEffect, useState } from 'react';
import { createTodaySession, recordAnswer, getSessionAnswers, isSessionComplete, completeSession } from '@/frontend/lib/drill/session';
import { checkAnswer } from '@/frontend/lib/drill/answer-checker';
import { calculateSessionSummary } from '@/frontend/lib/drill/session-summary';
import { calculateNextReviewTime } from '@/frontend/lib/srs/scheduler';
import { emitDrillStarted, emitAnswerEvent, emitSessionCompleted } from '@/frontend/lib/telemetry/events';
import type { DrillSession } from '@/frontend/lib/drill/session';
import { SessionHeader } from '@/frontend/components/drill/SessionHeader';
import { QuestionCard, Question } from '@/frontend/components/drill/QuestionCard';
import { ActionsBar } from '@/frontend/components/drill/ActionsBar';

export default function DailyDrillPage() {
  const [session, setSession] = useState<DrillSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, { value: string; isCorrect: boolean }>>(new Map());
  const [sessionComplete, setSessionComplete] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [nextReviewTime, setNextReviewTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    try {
      const newSession = createTodaySession();
      setSession(newSession);
      emitDrillStarted(newSession.id, newSession.questions.length);
      setLoading(false);
    } catch (err) {
      setError('Failed to initialize session');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div data-testid="loading-state" className="flex items-center justify-center min-h-screen bg-gray-50">
        <div data-testid="skeleton-state" className="space-y-4 w-full max-w-2xl px-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="error-state" className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">エラーが発生しました</h1>
          <p data-testid="error-message" className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            リトライ
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div data-testid="empty-state" className="flex items-center justify-center min-h-screen bg-gray-50">
        <div data-testid="empty-message" className="text-center">
          <p className="text-gray-600">セッションを準備できません</p>
        </div>
      </div>
    );
  }

  if (sessionComplete && summary) {
    return (
      <div
        data-testid="session-completed"
        className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4"
      >
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-green-600 mb-6">お疲れ様でした！</h1>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">準確率</p>
                <p data-testid="accuracy-score" className="text-3xl font-bold text-blue-600">
                  {(summary.accuracy * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">正解</p>
                <p data-testid="correct-count" className="text-3xl font-bold text-green-600">
                  {summary.correctCount}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">合計</p>
                <p data-testid="total-count" className="text-3xl font-bold text-gray-600">
                  {summary.totalCount}
                </p>
              </div>
            </div>

            {/* Wrong Questions */}
            {summary.wrongQIds.length > 0 && (
              <div data-testid="wrong-questions-section" className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">間違えた問題</h2>
                <div className="space-y-2">
                  {summary.wrongQIds.map((qId: string) => (
                    <div
                      key={qId}
                      data-testid="wrong-question-item"
                      className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
                    >
                      問題 ID: {qId}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Review Time */}
            <div data-testid="next-review-time" className="bg-indigo-50 p-4 rounded-lg mb-6 text-center">
              <p className="text-sm text-gray-600">次の復習推奨時刻</p>
              <p className="text-lg font-semibold text-indigo-600">
                {new Date(Date.now() + nextReviewTime).toLocaleString('ja-JP')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                data-testid="retry-button"
                onClick={() => location.reload()}
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold"
              >
                もう一度挑戦
              </button>
              <button
                data-testid="finish-button"
                onClick={() => (location.href = '/')}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
              >
                終了
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Drill Page
  const currentQuestion = session.questions[currentIndex];
  const currentAnswers = answers.get(currentQuestion.id);

  const handleAnswerSubmit = async (selectedAnswer: string | string[]) => {
    try {
      // Calculate start time
      const startTime = currentQuestion.startedAt || Date.now();

      // Check answer
      const result = checkAnswer(currentQuestion as Question, selectedAnswer);

      // Record answer
      recordAnswer(
        session,
        currentQuestion.id,
        typeof selectedAnswer === 'string' ? selectedAnswer : JSON.stringify(selectedAnswer),
        result.isCorrect,
        result.feedback
      );

      // Emit telemetry
      const latency = Date.now() - startTime;
      emitAnswerEvent(session.id, currentQuestion.id, result.isCorrect, latency);

      // Store answer
      answers.set(currentQuestion.id, {
        value: typeof selectedAnswer === 'string' ? selectedAnswer : JSON.stringify(selectedAnswer),
        isCorrect: result.isCorrect,
      });
      setAnswers(new Map(answers));
      setFeedback(result.feedback);
    } catch (err) {
      setFeedback('回答の処理に失敗しました');
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFeedback(null);
    } else {
      // Session complete
      completeSession(session);
      const completedSummary = calculateSessionSummary(session);
      const nextReview = calculateNextReviewTime(
        completedSummary.correctCount,
        completedSummary.totalCount - completedSummary.correctCount
      );

      setSummary(completedSummary);
      setNextReviewTime(nextReview);

      // Emit completion event
      emitSessionCompleted(
        session.id,
        completedSummary.totalCount,
        completedSummary.correctCount,
        completedSummary.accuracy,
        Date.now() - (session.startedAt || Date.now())
      );

      setSessionComplete(true);
    }
  };

  return (
    <div data-testid="drill-layout" className="min-h-screen bg-gray-50">
      <SessionHeader
        currentQuestion={currentIndex + 1}
        totalQuestions={session.questions.length}
        correctCount={Array.from(answers.values()).filter((a) => a.isCorrect).length}
        startedAt={session.startedAt}
      />

      <main data-testid="drill-body" className="max-w-2xl mx-auto p-4">
        <QuestionCard
          question={currentQuestion as Question}
          onAnswerSelect={handleAnswerSubmit}
          disabled={!!currentAnswers}
        />

        {feedback && (
          <div data-testid="answer-feedback" className={`p-4 rounded-lg mb-4 ${currentAnswers?.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {feedback}
          </div>
        )}
      </main>

      <ActionsBar
        onNext={handleNextQuestion}
        isAnswered={!!currentAnswers}
        isLastQuestion={currentIndex === session.questions.length - 1}
      />
    </div>
  );
}
