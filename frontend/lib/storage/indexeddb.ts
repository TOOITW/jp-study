/**
 * IndexedDB Storage for Offline Question Cache
 * 
 * Features:
 * - 7-day TTL for cached questions
 * - Versioned schema with migration support
 * - Automatic cleanup of expired data
 */

import type { AnyQuestion } from '../drill/question-bank';

const DB_NAME = 'jp-study-cache';
const DB_VERSION = 1;
const STORE_NAME = 'questions';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface CachedData {
  questions: AnyQuestion[];
  cachedAt: number;
  expiresAt: number;
  schemaVersion: number;
}

interface CacheInfo {
  cachedAt: number;
  expiresAt: number;
  questionCount: number;
  schemaVersion: number;
}

/**
 * 開啟 IndexedDB 連線
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // 建立 object store（如果不存在）
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * 儲存問題到快取
 * @param questions 要快取的問題陣列
 * @param customTimestamp 可選：自訂時間戳（用於測試）
 */
export async function saveQuestionsToCache(
  questions: AnyQuestion[],
  customTimestamp?: number
): Promise<void> {
  const db = await openDB();
  const now = customTimestamp ?? Date.now();
  const expiresAt = now + SEVEN_DAYS_MS;

  const cachedData: CachedData = {
    questions,
    cachedAt: now,
    expiresAt,
    schemaVersion: DB_VERSION
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(cachedData, 'cache');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * 從快取取得問題
 * @returns 快取的問題陣列（若已過期或不存在則返回空陣列）
 */
export async function getQuestionsFromCache(): Promise<AnyQuestion[]> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('cache');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cachedData = request.result as CachedData | undefined;

        if (!cachedData) {
          resolve([]);
          return;
        }

        // 檢查是否過期
        const now = Date.now();
        if (now > cachedData.expiresAt) {
          // 過期：清除並返回空陣列
          clearExpiredCache();
          resolve([]);
          return;
        }

        // Schema 遷移：補齊缺少的欄位
        const migratedQuestions = cachedData.questions.map(q => ({
          ...q,
          explanation: q.explanation ?? '' // 補齊 v1 缺少的 explanation
        }));

        resolve(migratedQuestions);
      };
    });
  } catch (error) {
    console.error('Failed to get questions from cache:', error);
    return [];
  }
}

/**
 * 取得快取資訊
 */
export async function getCacheInfo(): Promise<CacheInfo | null> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('cache');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cachedData = request.result as CachedData | undefined;

        if (!cachedData) {
          resolve(null);
          return;
        }

        resolve({
          cachedAt: cachedData.cachedAt,
          expiresAt: cachedData.expiresAt,
          questionCount: cachedData.questions.length,
          schemaVersion: cachedData.schemaVersion
        });
      };
    });
  } catch (error) {
    console.error('Failed to get cache info:', error);
    return null;
  }
}

/**
 * 清理過期快取
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get('cache');

      getRequest.onsuccess = () => {
        const cachedData = getRequest.result as CachedData | undefined;

        if (!cachedData) {
          resolve();
          return;
        }

        const now = Date.now();
        if (now > cachedData.expiresAt) {
          // 已過期：刪除
          const deleteRequest = store.delete('cache');
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onsuccess = () => resolve();
        } else {
          // 未過期：保留
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Failed to clear expired cache:', error);
  }
}

/**
 * 清除所有快取（用於測試或重置）
 */
export async function clearAllCache(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to clear all cache:', error);
  }
}
