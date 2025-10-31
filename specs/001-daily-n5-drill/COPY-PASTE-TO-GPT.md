# 給 GPT 的題庫生成指令（複製貼上版）

## 直接複製下面這段到 ChatGPT 或 Claude

---

### 對 ChatGPT 說：

```
請生成 30 題 N5 日語單選題。

輸出格式：JSON 陣列，只輸出 JSON，不要其他文字。

每題格式：
{
  "id": "n5-vocab-001",
  "type": "single",
  "category": "vocabulary",
  "difficulty": 1,
  "prompt": "「朝」の意味は？",
  "options": ["早い時間", "昼間", "夜", "季節"],
  "answerIndex": 0,
  "explanation": "「朝」=morning",
  "tags": ["time", "basic"]
}

要求：
1. 生成 30 題（id 從 n5-vocab-001 到 n5-vocab-030）
2. 分類混合：vocabulary 20題、grammar 7題、kanji 3題
3. 難度：簡單(1-2級) 12題、中等(3級) 12題、難(4-5級) 6題
4. 題目內容：日常用語、基本文法、常見漢字
5. 每題 4 個選項
6. 只輸出 JSON 陣列

開始生成。
```

---

## 或者用這個更簡潔版本：

```
根據以下格式，生成 30 題 N5 日語單選題：

{
  "id": "n5-vocab-001",
  "type": "single",
  "category": "vocabulary|grammar|kanji",
  "difficulty": 1,
  "prompt": "日語題目",
  "options": ["選項1", "選項2", "選項3", "選項4"],
  "answerIndex": 0,
  "explanation": "簡短解釋",
  "tags": ["標籤1", "標籤2"]
}

只輸出 JSON 陣列，不要其他內容。
```

---

## 接下來的步驟

### 1️⃣ 貼到 GPT
- 打開 ChatGPT (https://chat.openai.com)
- 貼上上面的指令
- 點 Send

### 2️⃣ 等待生成
- 通常需要 30-60 秒
- GPT 會輸出一個 JSON 陣列

### 3️⃣ 複製輸出
- 全選 GPT 的輸出
- Ctrl+C / Cmd+C 複製

### 4️⃣ 驗證 JSON
- 打開 https://jsonlint.com
- 貼上 JSON
- 點 "Validate JSON"
- 看到 "Valid JSON" 表示成功 ✅

### 5️⃣ 保存檔案
- 如果有效，建立新檔案：`frontend/data/questions/n5-batch-1.json`
- 貼上 JSON 內容
- 外面再包個物件：
```json
{
  "version": "1.0.0",
  "level": "N5",
  "totalQuestions": 30,
  "questions": [
    { /* 30 個題目 */ }
  ]
}
```

### 6️⃣ 後續集成（技術部分）
- 修改 `frontend/lib/drill/question-bank.ts`
- 從 JSON 檔案導入題目
- 實裝隨機選題邏輯

---

## 萬一出錯怎麼辦？

### 問題 1: JSON 無效
**症狀**: JSONLint 報錯
**解決**: 回到 GPT 對話，說：
```
上面輸出的 JSON 有格式錯誤。請修正後重新輸出。
```

### 問題 2: 題目有誤（日文錯誤或邏輯問題）
**症狀**: 看起來不對勁
**解決**: 
```
題目 n5-vocab-005 的日文有誤，請檢查並修正。
```

### 問題 3: 數量不對
**症狀**: 只有 25 題而不是 30 題
**解決**:
```
上面只有 25 題，請補生成剩餘 5 題（n5-vocab-026 到 n5-vocab-030）。
```

---

## 推薦方案

### 快速上手（今晚）
1. 用「簡潔版」指令生成 30 題
2. 驗證 JSON
3. 保存到 `frontend/data/questions/n5-batch-1.json`

### 後續擴充（本週內）
1. 再生成 2-3 批，每批 30 題
2. 累積到 100+ 題
3. 後端實裝從 JSON 讀取

---

**建議**: 現在就試試簡潔版指令，30 秒就可以看到結果！

---

## 完整檔案結構

生成後，檔案位置：

```
frontend/data/questions/
├── n5-sample.json       ← 樣本（3題，參考用）
├── n5-batch-1.json      ← 你要生成的第一批
├── n5-batch-2.json      ← 未來的第二批
└── index.ts             ← 匯出所有題目
```
