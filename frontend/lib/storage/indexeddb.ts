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
 * 執行讀取操作的通用函數
 */
async function performRead<T>(
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * 執行寫入操作的通用函數
 */
async function performWrite<T>(
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * 檢查快取資料是否已過期
 */
function isExpired(cachedData: CachedData): boolean {
  return Date.now() > cachedData.expiresAt;
}

/**
 * 對問題進行 Schema 遷移（補齊缺少的欄位）
 */
function migrateQuestions(questions: AnyQuestion[]): AnyQuestion[] {
  return questions.map(q => ({
    ...q,
    explanation: q.explanation ?? '' // 補齊 v1 缺少的 explanation
  }));
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
  const now = customTimestamp ?? Date.now();
  const cachedData: CachedData = {
    questions,
    cachedAt: now,
    expiresAt: now + SEVEN_DAYS_MS,
    schemaVersion: DB_VERSION
  };

  await performWrite(store => store.put(cachedData, 'cache'));
}

/**
 * 從快取取得問題
 * @returns 快取的問題陣列（若已過期或不存在則返回空陣列）
 */
export async function getQuestionsFromCache(): Promise<AnyQuestion[]> {
  try {
    const cachedData = await performRead<CachedData | undefined>(
      store => store.get('cache')
    );

    if (!cachedData) {
      return [];
    }

    // 檢查是否過期
    if (isExpired(cachedData)) {
      // 過期：清除並返回空陣列
      clearExpiredCache();
      return [];
    }

    // Schema 遷移：補齊缺少的欄位
    return migrateQuestions(cachedData.questions);
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
    const cachedData = await performRead<CachedData | undefined>(
      store => store.get('cache')
    );

    if (!cachedData) {
      return null;
    }

    return {
      cachedAt: cachedData.cachedAt,
      expiresAt: cachedData.expiresAt,
      questionCount: cachedData.questions.length,
      schemaVersion: cachedData.schemaVersion
    };
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

        if (!cachedData || !isExpired(cachedData)) {
          resolve();
          return;
        }

        // 已過期：刪除
        const deleteRequest = store.delete('cache');
        deleteRequest.onerror = () => reject(deleteRequest.error);
        deleteRequest.onsuccess = () => resolve();
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
    await performWrite(store => store.clear());
  } catch (error) {
    console.error('Failed to clear all cache:', error);
  }
}
