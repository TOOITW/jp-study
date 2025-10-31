# 題庫檔案命名與組織規範

## 檔案命名格式

### 推薦格式
```
n5-batch-day-{N}.json
```

- `n5`: 難度等級（未來可有 n4, n3, etc.）
- `batch`: 批次類型
- `day`: 用途（daily練習）
- `{N}`: 序號（1, 2, 3, ...）

### 檔案範例
```
frontend/data/questions/
├── n5-batch-day-1.json      # Day 1 (Q1-Q10)
├── n5-batch-day-2.json      # Day 2 (Q11-Q20)
├── n5-batch-day-3.json      # Day 3 (Q21-Q30)
├── n5-batch-day-4.json      # Day 4 (Q31-Q40)
├── n5-batch-day-5.json      # Day 5 (Q41-Q50)
├── n5-batch-weekly.json     # 週末複習 (Q51-Q100)
├── n5-batch-exam.json       # 模擬考 (Q101-Q200)
└── index.ts
```

---

## 題目 ID 規範

### ID 格式
```
n5-{序號:03d}
```

### 分配規則

| 批次 | ID 範圍 | 數量 |
|------|--------|------|
| day-1 | n5-001 ~ n5-010 | 10 |
| day-2 | n5-011 ~ n5-020 | 10 |
| day-3 | n5-021 ~ n5-030 | 10 |
| day-4 | n5-031 ~ n5-040 | 10 |
| day-5 | n5-041 ~ n5-050 | 10 |
| weekly | n5-051 ~ n5-100 | 50 |
| exam | n5-101 ~ n5-200 | 100 |

### 保證全局唯一性
- 每個 ID 全局唯一
- 不重複
- 易於追蹤

---

## JSON 檔案結構

```json
{
  "version": "1.0.0",
  "level": "N5",
  "batch": "day-1",
  "totalQuestions": 10,
  "dateCreated": "2025-10-31",
  "source": "gpt-generated",
  "questions": [
    {
      "id": "n5-001",
      "type": "single",
      "category": "vocabulary",
      "difficulty": 1,
      "prompt": "題目",
      "options": ["選項1", "選項2", "選項3", "選項4"],
      "answerIndex": 0,
      "explanation": "解釋",
      "tags": ["標籤"]
    },
    ...
  ]
}
```

---

## 未來擴展

### 支援多難度
```
n4-batch-day-1.json
n4-batch-day-2.json
n3-batch-day-1.json
```

### 支援不同用途
```
n5-batch-reading.json       # 閱讀題
n5-batch-listening.json     # 聽力題
n5-batch-conversation.json  # 會話題
```

### 版本控制
```
n5-batch-day-1-v1.json
n5-batch-day-1-v2.json      # 修正後的版本
```

---

## 實作檢查清單

- [ ] 檔名格式統一：`n5-batch-day-{N}.json`
- [ ] 題目 ID 全球唯一且無間隙
- [ ] 每個 batch 的 JSON 結構一致
- [ ] dateCreated 欄位記錄生成時間
- [ ] source 欄位記錄來源（gpt-generated/manual/etc）
- [ ] 所有 ID 遵循 `n5-{序號:03d}` 格式

---

**狀態**: 推薦規範  
**版本**: 1.0.0  
**最後更新**: 2025-10-31
