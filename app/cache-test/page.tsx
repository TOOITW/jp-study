'use client';

import React, { useState, useEffect } from 'react';
import { 
  getQuestionsFromCache, 
  saveQuestionsToCache, 
  getCacheInfo,
  clearAllCache 
} from '@/frontend/lib/storage/indexeddb';
import { getDailyQuestions } from '@/frontend/lib/drill/question-bank';

export default function CacheTestPage() {
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [cachedQuestions, setCachedQuestions] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    console.log(message);
  };

  const loadCacheInfo = async () => {
    try {
      const info = await getCacheInfo();
      setCacheInfo(info);
      
      if (info) {
        const expiresIn = Math.ceil((info.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
        addLog(`✅ 快取存在: ${info.questionCount} 題，${expiresIn} 天後過期`);
      } else {
        addLog('❌ 快取不存在');
      }
    } catch (error) {
      addLog(`❌ 錯誤: ${error}`);
    }
  };

  const loadCachedQuestions = async () => {
    try {
      const questions = await getQuestionsFromCache();
      setCachedQuestions(questions);
      
      if (questions.length > 0) {
        addLog(`✅ 從快取載入 ${questions.length} 題`);
      } else {
        addLog('❌ 快取為空');
      }
    } catch (error) {
      addLog(`❌ 錯誤: ${error}`);
    }
  };

  const saveToCache = async () => {
    try {
      const questions = getDailyQuestions(10);
      await saveQuestionsToCache(questions);
      addLog(`💾 成功儲存 ${questions.length} 題到快取`);
      await loadCacheInfo();
      await loadCachedQuestions();
    } catch (error) {
      addLog(`❌ 儲存失敗: ${error}`);
    }
  };

  const clearCache = async () => {
    try {
      await clearAllCache();
      addLog('🗑️ 已清除所有快取');
      setCacheInfo(null);
      setCachedQuestions([]);
      await loadCacheInfo();
    } catch (error) {
      addLog(`❌ 清除失敗: ${error}`);
    }
  };

  const testExpiry = async () => {
    try {
      // 儲存一個過期的快取（8天前）
      const questions = getDailyQuestions(3);
      const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
      await saveQuestionsToCache(questions, eightDaysAgo);
      addLog('💾 已儲存過期快取（8天前）');
      
      // 嘗試讀取
      const retrieved = await getQuestionsFromCache();
      if (retrieved.length === 0) {
        addLog('✅ 過期測試通過：過期快取自動返回空陣列');
      } else {
        addLog('❌ 過期測試失敗：仍然返回了資料');
      }
      
      await loadCacheInfo();
    } catch (error) {
      addLog(`❌ 過期測試失敗: ${error}`);
    }
  };

  useEffect(() => {
    addLog('🚀 Cache Test Page 已載入');
    loadCacheInfo();
    loadCachedQuestions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">IndexedDB 快取測試頁面</h1>
        
        {/* 控制按鈕 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">控制面板</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadCacheInfo}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔄 重新載入快取資訊
            </button>
            <button
              onClick={loadCachedQuestions}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              📥 載入快取問題
            </button>
            <button
              onClick={saveToCache}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              💾 儲存新問題到快取
            </button>
            <button
              onClick={testExpiry}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              ⏰ 測試過期機制
            </button>
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🗑️ 清除快取
            </button>
          </div>
        </div>

        {/* 快取資訊 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">快取資訊</h2>
          {cacheInfo ? (
            <div className="space-y-2 font-mono text-sm">
              <p><strong>問題數量:</strong> {cacheInfo.questionCount}</p>
              <p><strong>儲存時間:</strong> {new Date(cacheInfo.cachedAt).toLocaleString()}</p>
              <p><strong>過期時間:</strong> {new Date(cacheInfo.expiresAt).toLocaleString()}</p>
              <p><strong>Schema 版本:</strong> {cacheInfo.schemaVersion}</p>
              <p><strong>剩餘天數:</strong> {Math.ceil((cacheInfo.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))} 天</p>
            </div>
          ) : (
            <p className="text-gray-500">快取不存在或未載入</p>
          )}
        </div>

        {/* 快取問題列表 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">快取問題 ({cachedQuestions.length})</h2>
          {cachedQuestions.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cachedQuestions.map((q, index) => (
                <div key={index} className="border-b pb-2">
                  <p className="font-semibold text-sm">{index + 1}. {q.id}</p>
                  <p className="text-xs text-gray-600">{q.prompt}</p>
                  <p className="text-xs text-gray-500">
                    類型: {q.type} | 分類: {q.category} | 難度: {q.difficulty}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">無快取問題</p>
          )}
        </div>

        {/* 日誌 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">操作日誌</h2>
          <div className="font-mono text-xs space-y-1 max-h-96 overflow-y-auto bg-gray-900 text-green-400 p-4 rounded">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            ) : (
              <div className="text-gray-500">無日誌</div>
            )}
          </div>
        </div>

        {/* 返回連結 */}
        <div className="mt-6 text-center">
          <a 
            href="/today" 
            className="text-blue-500 hover:underline"
          >
            ← 返回每日練習
          </a>
        </div>
      </div>
    </div>
  );
}
