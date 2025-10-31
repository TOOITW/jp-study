# GPT Prompt for Generating N5 Japanese Questions

## 適用版本
- ChatGPT-4 (推薦)
- Claude 3.5 Sonnet (推薦)
- 其他支援 JSON 輸出的模型

---

## Prompt 版本 1: 基礎快速版（推薦新手）

複製以下完整內容到 GPT：

```
請生成 30 題 N5 日語單選題目，用於初級日語學習應用。

格式要求：
1. 輸出為一個 JSON 陣列
2. 每題必須包含以下欄位：
   - id: 格式為 "n5-vocab-001" 到 "n5-vocab-030"
   - type: 固定為 "single"
   - category: 從以下選擇：vocabulary、grammar、kanji
   - difficulty: 1-5 數字（1=最簡單，5=最難）
   - prompt: 日語題目文字
   - options: 4個選項的陣列（日語）
   - answerIndex: 正確答案的索引 (0-3)
   - explanation: 簡短的答案解釋（日語或中文）
   - tags: 相關標籤陣列（如 ["greeting", "verb"]）

3. 題目要求：
   - 涵蓋常見 N5 單字（家族、數字、顏色、日常動作、基本文法等）
   - 干擾選項要合理且迷惑性適中
   - 難度分布：簡單(1-2級) 12題、中等(3級) 12題、稍難(4-5級) 6題
   - 每題獨立，不依賴其他題目

4. 範例格式：
{
  "id": "n5-vocab-001",
  "type": "single",
  "category": "vocabulary",
  "difficulty": 1,
  "prompt": "「おはよう」は何時に使いますか？",
  "options": ["朝", "昼", "夜", "いつでも"],
  "answerIndex": 0,
  "explanation": "「おはよう」は朝の挨拶です。",
  "tags": ["greeting", "time"]
}

5. 輸出要求：
   - 只輸出 JSON 陣列，不要其他文字
   - 每題用逗號分隔
   - 確保 JSON 格式有效可解析

現在請生成 30 題。
```

---

## Prompt 版本 2: 進階詳細版（推薦有經驗者）

如果需要更細緻的控制，使用這個版本：

```
你是一位 N5 日語考試專家。請生成 30 題高品質的日語學習題目。

## 輸出格式要求

必須輸出為有效的 JSON 陣列，每個物件包含以下欄位：

| 欄位 | 類型 | 說明 | 範例 |
|-----|------|------|------|
| id | string | 唯一識別碼 | "n5-vocab-001" |
| type | string | 題型（固定 "single"） | "single" |
| category | string | 題目分類 | "vocabulary" \| "grammar" \| "kanji" |
| difficulty | number | 難度 1-5 | 2 |
| prompt | string | 日語題目 | "「新しい」の意味は？" |
| options | string[] | 4個日語選項 | ["古い", "新しい", ...] |
| answerIndex | number | 正確答案索引 | 1 |
| explanation | string | 簡短解釋 | "新しい = new" |
| tags | string[] | 標籤 | ["adjective", "positive"] |

## 題目內容要求

### 分類分布
- vocabulary (單字): 15 題
- grammar (文法): 10 題
- kanji (漢字): 5 題

### 難度分布
- Level 1 (最簡單): 6 題 - 基本問候、數字、顏色
- Level 2: 6 題 - 基本動詞、日常用語
- Level 3 (中等): 10 題 - 複合表達、常用文法
- Level 4: 5 題 - 較複雜的文法、書寫方式
- Level 5 (最難): 3 題 - 慣用表達、細微差別

### 內容主題
涵蓋以下主題（優先順序）：
1. 家族成員（家族、親戚用語）
2. 日常活動（食べる、飲む、睡眠など）
3. 時間概念（朝、昼、夜、季節）
4. 基本形容詞（大きい、小さい、新しい、古い、美しい等）
5. 助詞使用（は、が、を、に）
6. 敬語基礎（です、ます形）

### 選項設計
- 正確答案應清晰可辨
- 干擾選項應相似但明確錯誤
- 避免過於簡單的干擾項
- 避免考試技巧（如選項位置規律）

## 驗證清單（生成後自檢）
- ✓ 所有 ID 唯一且格式一致
- ✓ 所有 answerIndex 在 0-3 範圍內
- ✓ 所有 options 陣列都有 4 個元素
- ✓ 難度分布符合上述要求
- ✓ JSON 格式有效
- ✓ 沒有日文語法錯誤

## 輸出格式
只輸出 JSON 陣列，不包含其他文字或説明。

現在開始生成 30 題。
```

---

## Prompt 版本 3: 分批生成版（適合邊審邊調整）

如果想先看少量試樣再決定是否調整：

```
請先生成 10 題 N5 日語單選題（試樣）。

要求：
1. 輸出格式：JSON 陣列
2. 難度平均分布
3. 涵蓋不同主題
4. 每題結構：
   {
     "id": "n5-sample-001",
     "type": "single",
     "category": "vocabulary",
     "difficulty": 2,
     "prompt": "題目",
     "options": ["選項1", "選項2", "選項3", "選項4"],
     "answerIndex": 0,
     "explanation": "解釋",
     "tags": ["標籤"]
   }

輸出後，我會檢查品質。若滿意，請繼續生成剩餘 20 題。
```

---

## 使用步驟

### 步驟 1: 選擇版本
- **新手/快速**: 用版本 1
- **精細控制**: 用版本 2
- **邊看邊調**: 用版本 3

### 步驟 2: 複製 Prompt
直接複製整個 Prompt 到 ChatGPT

### 步驟 3: 執行
點擊 Send，等待 GPT 生成

### 步驟 4: 驗證 JSON
複製輸出的 JSON，貼到 [JSONLint](https://jsonlint.com) 驗證格式

### 步驟 5: 保存
- 將有效的 JSON 存到檔案
- 建議檔名：`n5-questions-batch-1.json`

---

## 常見問題與調整

### Q: GPT 生成的題目有錯誤怎麼辦？

**方案 A**: 在同個對話中修正
```
題目 "n5-vocab-005" 的日文有誤，應該是 "新しい本です" 而不是 "新しい本だ"。
請重新生成這 3 題：n5-vocab-005, n5-vocab-012, n5-vocab-018
```

**方案 B**: 手動編輯
- 複製輸出的 JSON
- 開啟文字編輯器
- 修正錯誤後驗證格式

### Q: 想要特定主題的題目？

加入額外指示：
```
請特別增加以下主題：
- 動物名稱：5 題
- 食物名稱：5 題
- 天氣用語：3 題
其餘 17 題自由選擇。
```

### Q: 難度太簡單/太難？

調整難度分布：
```
請調整難度分布為：
- Level 1-2: 20 題（偏容易）
- Level 3: 8 題
- Level 4-5: 2 題
```

---

## 推薦工作流

### 第一輪（今天）
1. 用版本 1 生成 30 題
2. 驗證 JSON 格式
3. 人工快速審閱（5 分鐘）
4. 保存為 `frontend/data/questions/n5-batch-1.json`

### 第二輪（明天或下週）
1. 用版本 1 再生成 30 題（不同變化）
2. 重複驗證
3. 保存為 `frontend/data/questions/n5-batch-2.json`

### 第三輪+
重複操作，累積到 100+ 題

---

## 後續集成步驟（技術部分）

生成後，需要：

```typescript
// frontend/data/questions/index.ts
import batch1 from './n5-batch-1.json';
import batch2 from './n5-batch-2.json';

export const allQuestions = [
  ...batch1.questions,
  ...batch2.questions,
];

export function getDailyQuestions(count: number) {
  return shuffleArray(allQuestions).slice(0, count);
}
```

---

## 檢查清單

生成後確認：

- [ ] JSON 格式有效（用 JSONLint 驗證）
- [ ] 所有 30 題都有 id、type、category、difficulty、prompt、options、answerIndex、explanation、tags
- [ ] answerIndex 都在 0-3 範圍
- [ ] options 都是 4 個元素
- [ ] 沒有重複的 id
- [ ] 日語文法正確（可請 GPT 檢查）
- [ ] 難度分布合理
- [ ] 干擾選項合理

---

**版本**: 1.0  
**最後更新**: 2025-10-31  
**建議**: 開始用版本 1，快速生成第一批試樣
