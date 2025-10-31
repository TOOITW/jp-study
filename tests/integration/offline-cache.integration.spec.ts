/**
 * AC-7 Integration Tests: Offline Cache Storage
 * 
 * Test Requirements:
 * - Questions are stored in IndexedDB with 7-day TTL
 * - Cache uses versioned schema
 * - Data persists across browser restarts
 * - Expired data is automatically cleaned up
 */

import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

// 待實作的 API
import { 
  saveQuestionsToCache, 
  getQuestionsFromCache,
  clearExpiredCache,
  getCacheInfo
} from '../../frontend/lib/storage/indexeddb';
import type { AnyQuestion } from '../../frontend/lib/drill/question-bank';

describe('AC-7 Integration: Offline Cache Storage', () => {
  beforeEach(() => {
    // 每個測試前重置 IndexedDB
    indexedDB = new IDBFactory();
  });

  /**
   * T030: 離線快取儲存問題 7 天
   * 預期行為：
   * 1. 儲存問題到 IndexedDB
   * 2. 設定 7 天 TTL (timestamp + 7 * 24 * 60 * 60 * 1000)
   * 3. 可以取回相同的問題
   */
  test('test_AC-7_integration_cache_stores_questions_with_7_day_ttl', async () => {
    const mockQuestions: AnyQuestion[] = [
      { id: 'n5-001', type: 'single', category: 'vocabulary', difficulty: 1 as 1, prompt: 'テスト問題', options: ['A'], answerIndex: 0, explanation: 'Test' }
    ];

    await saveQuestionsToCache(mockQuestions);

    // 驗證可以取回快取
    const cached = await getQuestionsFromCache();
    expect(cached).toHaveLength(1);
    expect((cached[0] as any).prompt).toBe('テスト問題');

    // 驗證 TTL 設定正確（7 天）
    const cacheInfo = await getCacheInfo();
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const expectedExpiry = now + sevenDays;
    
    expect(cacheInfo).not.toBeNull();
    expect(cacheInfo!.expiresAt).toBeGreaterThan(now);
    expect(cacheInfo!.expiresAt).toBeLessThan(expectedExpiry + 1000);
  });

  /**
   * T031: 離線檢索從快取供應
   * 預期行為：
   * 1. 快取存在時，不需要網路請求
   * 2. 返回快取資料
   */
  test('test_AC-7_integration_retrieves_from_cache_when_available', async () => {
    const mockQuestions: AnyQuestion[] = [
      { id: 'n5-002', type: 'single', category: 'grammar', difficulty: 2 as 2, prompt: 'Q2', options: ['A', 'B'], answerIndex: 0, explanation: 'E2' },
      { id: 'n5-003', type: 'single', category: 'kanji', difficulty: 3 as 3, prompt: 'Q3', options: ['A', 'B'], answerIndex: 1, explanation: 'E3' }
    ];

    await saveQuestionsToCache(mockQuestions);
    
    // 第一次檢索
    const firstRetrieval = await getQuestionsFromCache();
    expect(firstRetrieval).toHaveLength(2);

    // 第二次檢索（應該也能取得）
    const secondRetrieval = await getQuestionsFromCache();
    expect(secondRetrieval).toHaveLength(2);
    expect(secondRetrieval[0].id).toBe('n5-002');
    expect(secondRetrieval[1].id).toBe('n5-003');
  });

  /**
   * T033: 快取 7 天後過期
   * 預期行為：
   * 1. 模擬時間流逝 7 天
   * 2. 過期資料應被自動清除或返回 null/空陣列
   */
  test('test_AC-7_integration_cache_expires_after_7_days', async () => {
    const mockQuestions: AnyQuestion[] = [
      { id: 'n5-004', type: 'single', category: 'vocabulary', difficulty: 1 as 1, prompt: 'Q4', options: ['A', 'B'], answerIndex: 0, explanation: 'E4' }
    ];

    // 儲存時使用 7 天前的時間戳
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000 + 1000); // 7天 + 1秒
    await saveQuestionsToCache(mockQuestions, sevenDaysAgo);

    // 嘗試讀取
    const cached = await getQuestionsFromCache();
    
    // 應該返回空（已過期）
    expect(cached).toEqual([]);
  });

  /**
   * T034: Schema 版本遷移
   * 預期行為：
   * 1. 偵測舊版 schema
   * 2. 自動升級到新版
   * 3. 資料保持完整
   */
  test('test_AC-7_integration_handles_schema_version_migration', async () => {
    // 先儲存 v1 格式（假設沒有 explanation）
    const v1Questions = [
      { id: 'n5-005', type: 'single' as const, category: 'vocabulary' as const, difficulty: 1 as 1, prompt: 'Q5', options: ['A', 'B'], answerIndex: 0 }
    ];

    await saveQuestionsToCache(v1Questions as AnyQuestion[]);

    // 讀取時應該自動補齊缺少的欄位
    const migrated = await getQuestionsFromCache();
    expect(migrated).toHaveLength(1);
    expect(migrated[0]).toHaveProperty('explanation');
    expect(migrated[0].explanation).toBe(''); // 補齊為空字串
  });

  /**
   * T030 補充: 清理過期快取
   */
  test('test_AC-7_integration_clears_expired_cache', async () => {
    // 儲存過期資料（8 天前）
    const expiredQuestions: AnyQuestion[] = [
      { id: 'n5-007', type: 'single', category: 'vocabulary', difficulty: 1 as 1, prompt: 'Expired', options: ['B'], answerIndex: 0, explanation: 'E' }
    ];
    const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
    await saveQuestionsToCache(expiredQuestions, eightDaysAgo);

    // 清理過期快取
    await clearExpiredCache();

    // 過期資料應該被清除
    const remaining = await getQuestionsFromCache();
    expect(remaining).toHaveLength(0);

    // 驗證快取資訊也已清除
    const info = await getCacheInfo();
    expect(info).toBeNull();
  });
});
