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

  /**
   * T031: 多次離線讀取穩定性
   * 預期行為：
   * 1. 快取可以被多次讀取而不影響資料
   * 2. 每次讀取返回一致的資料
   */
  test('test_AC-7_integration_multiple_offline_reads_are_stable', async () => {
    const mockQuestions: AnyQuestion[] = [
      { id: 'n5-010', type: 'single', category: 'vocabulary', difficulty: 1 as 1, prompt: 'Stable', options: ['A', 'B', 'C'], answerIndex: 1, explanation: 'Stable test' }
    ];

    await saveQuestionsToCache(mockQuestions);

    // 連續讀取 5 次
    for (let i = 0; i < 5; i++) {
      const retrieved = await getQuestionsFromCache();
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('n5-010');
      expect((retrieved[0] as any).answerIndex).toBe(1);
      expect((retrieved[0] as any).prompt).toBe('Stable');
    }
  });

  /**
   * T032: 快取覆蓋更新
   * 預期行為：
   * 1. 新的 saveQuestionsToCache 會覆蓋舊快取
   * 2. 過期時間重新計算
   */
  test('test_AC-7_integration_cache_overwrites_old_data', async () => {
    // 儲存舊資料
    const oldQuestions: AnyQuestion[] = [
      { id: 'n5-old', type: 'single', category: 'vocabulary', difficulty: 1 as 1, prompt: 'Old', options: ['A'], answerIndex: 0, explanation: 'Old' }
    ];
    await saveQuestionsToCache(oldQuestions);

    // 等待 100ms
    await new Promise(resolve => setTimeout(resolve, 100));

    // 儲存新資料
    const newQuestions: AnyQuestion[] = [
      { id: 'n5-new-1', type: 'single', category: 'grammar', difficulty: 2 as 2, prompt: 'New1', options: ['A'], answerIndex: 0, explanation: 'New1' },
      { id: 'n5-new-2', type: 'single', category: 'kanji', difficulty: 3 as 3, prompt: 'New2', options: ['B'], answerIndex: 0, explanation: 'New2' }
    ];
    await saveQuestionsToCache(newQuestions);

    // 驗證只有新資料
    const cached = await getQuestionsFromCache();
    expect(cached).toHaveLength(2);
    expect(cached[0].id).toBe('n5-new-1');
    expect(cached[1].id).toBe('n5-new-2');
  });

  /**
   * T035: 大量資料快取效能
   * 預期行為：
   * 1. 可以快取大量問題（100+ 題）
   * 2. 讀取時間合理
   */
  test('test_AC-7_integration_handles_large_dataset', async () => {
    // 建立 100 題問題
    const largeDataset: AnyQuestion[] = Array.from({ length: 100 }, (_, i) => ({
      id: `n5-${String(i + 1).padStart(3, '0')}`,
      type: 'single' as const,
      category: ['vocabulary', 'grammar', 'kanji'][i % 3] as 'vocabulary' | 'grammar' | 'kanji',
      difficulty: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
      prompt: `Question ${i + 1}`,
      options: ['A', 'B', 'C', 'D'],
      answerIndex: i % 4,
      explanation: `Explanation ${i + 1}`
    }));

    // 儲存
    const saveStart = Date.now();
    await saveQuestionsToCache(largeDataset);
    const saveTime = Date.now() - saveStart;

    // 讀取
    const readStart = Date.now();
    const cached = await getQuestionsFromCache();
    const readTime = Date.now() - readStart;

    // 驗證
    expect(cached).toHaveLength(100);
    expect(cached[0].id).toBe('n5-001');
    expect(cached[99].id).toBe('n5-100');

    // 效能驗證（合理的時間限制）
    expect(saveTime).toBeLessThan(1000); // 儲存應在 1 秒內
    expect(readTime).toBeLessThan(500);  // 讀取應在 0.5 秒內

    const info = await getCacheInfo();
    expect(info?.questionCount).toBe(100);
  });

  /**
   * T036: 快取資料完整性驗證
   * 預期行為：
   * 1. 所有問題欄位正確儲存
   * 2. 複雜資料結構（陣列、物件）正確保存
   */
  test('test_AC-7_integration_preserves_data_integrity', async () => {
    const complexQuestions: AnyQuestion[] = [
      {
        id: 'n5-complex-1',
        type: 'single',
        category: 'vocabulary',
        difficulty: 5 as 5,
        prompt: '複雑な問題：「彼は＿＿＿働いています」',
        options: ['一生懸命', '一所懸命', '一生賢明', '一所賢明'],
        answerIndex: 1,
        explanation: '「一所懸命」が正しい。「一生懸命」は当て字。',
        tags: ['advanced', 'kanji', 'idiom']
      }
    ];

    await saveQuestionsToCache(complexQuestions);
    const cached = await getQuestionsFromCache();

    expect(cached).toHaveLength(1);
    const q = cached[0] as any;
    expect(q.id).toBe('n5-complex-1');
    expect(q.prompt).toBe('複雑な問題：「彼は＿＿＿働いています」');
    expect(q.options).toEqual(['一生懸命', '一所懸命', '一生賢明', '一所賢明']);
    expect(q.answerIndex).toBe(1);
    expect(q.explanation).toBe('「一所懸命」が正しい。「一生懸命」は当て字。');
    expect(q.tags).toEqual(['advanced', 'kanji', 'idiom']);
  });

  /**
   * T037: 空快取處理
   * 預期行為：
   * 1. 空陣列可以正常儲存
   * 2. 讀取空快取返回空陣列（不是 null）
   */
  test('test_AC-7_integration_handles_empty_cache_gracefully', async () => {
    // 儲存空陣列
    await saveQuestionsToCache([]);

    // 讀取
    const cached = await getQuestionsFromCache();
    expect(cached).toEqual([]);
    expect(Array.isArray(cached)).toBe(true);

    // 快取資訊應該存在但 questionCount 為 0
    const info = await getCacheInfo();
    expect(info).not.toBeNull();
    expect(info?.questionCount).toBe(0);
  });
});

