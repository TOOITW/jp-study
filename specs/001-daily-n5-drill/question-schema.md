# Question Bank Schema

## 目的
定義 N5 題庫的標準資料格式，用於：
1. AI 生成題目時的輸出格式
2. 手動編輯題庫時的參考
3. 爬蟲系統的目標格式
4. 前端 `question-bank.ts` 的輸入格式

---

## 核心類型定義

### QuestionType
```typescript
type QuestionType = 'single' | 'match' | 'fill';
```

- `single`: 單選題（選擇正確答案）
- `match`: 配對題（連接對應項目）
- `fill`: 填空題（填入正確內容）

---

## 單選題 (Single Choice)

### TypeScript Interface
```typescript
interface SingleQuestion {
  id: string;                  // 唯一識別碼，格式: "n5-vocab-001"
  type: 'single';
  category: QuestionCategory;  // 題目分類
  difficulty: 1 | 2 | 3 | 4 | 5; // 難度 (1=最簡單, 5=最難)
  prompt: string;              // 題目文字
  options: string[];           // 選項陣列（2-6個選項）
  answerIndex: number;         // 正確答案的索引 (0-based)
  explanation?: string;        // 答案解釋（選填）
  tags?: string[];            // 標籤（如 ["hiragana", "greeting"]）
}
```

### JSON 範例
```json
{
  "id": "n5-vocab-001",
  "type": "single",
  "category": "vocabulary",
  "difficulty": 2,
  "prompt": "「おはよう」は何時に使いますか？",
  "options": ["朝", "昼", "夜", "いつでも"],
  "answerIndex": 0,
  "explanation": "「おはよう」は朝の挨拶です。",
  "tags": ["greeting", "time"]
}
```

---

## 配對題 (Match)

### TypeScript Interface
```typescript
interface MatchQuestion {
  id: string;
  type: 'match';
  category: QuestionCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  instruction: string;         // 配對指示（如 "將漢字與讀音配對"）
  left: string[];             // 左側項目（3-5個）
  right: string[];            // 右側項目（數量同左側）
  pairs: Array<[number, number]>; // 正確配對 [[leftIdx, rightIdx], ...]
  explanation?: string;
  tags?: string[];
}
```

### JSON 範例
```json
{
  "id": "n5-kanji-001",
  "type": "match",
  "category": "kanji",
  "difficulty": 3,
  "instruction": "漢字と読み方を合わせてください",
  "left": ["犬", "猫", "鳥"],
  "right": ["とり", "いぬ", "ねこ"],
  "pairs": [[0, 1], [1, 2], [2, 0]],
  "explanation": "動物の名前と読み方の組み合わせです。",
  "tags": ["animals", "kanji"]
}
```

---

## 填空題 (Fill in the Blank)

### TypeScript Interface
```typescript
interface FillQuestion {
  id: string;
  type: 'fill';
  category: QuestionCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;              // 題目（用 ____ 表示空格）
  blanks: number;             // 空格數量
  solutions: string[][];      // 每個空格的正確答案（可多個接受答案）
  caseSensitive?: boolean;    // 是否區分大小寫（預設 false）
  explanation?: string;
  tags?: string[];
}
```

### JSON 範例
```json
{
  "id": "n5-grammar-001",
  "type": "fill",
  "category": "grammar",
  "difficulty": 2,
  "prompt": "私は____です。",
  "blanks": 1,
  "solutions": [
    ["学生", "せいと", "がくせい"]
  ],
  "caseSensitive": false,
  "explanation": "「学生」は student の意味です。",
  "tags": ["self-introduction", "copula"]
}
```

---

## 題目分類 (Category)

```typescript
type QuestionCategory = 
  | 'vocabulary'  // 單字
  | 'grammar'     // 文法
  | 'kanji'       // 漢字
  | 'listening'   // 聽力（未來擴充）
  | 'reading'     // 閱讀
  | 'particle';   // 助詞
```

---

## 題庫檔案格式

### 檔案結構
```
frontend/data/questions/
├── n5-vocabulary.json
├── n5-grammar.json
├── n5-kanji.json
└── index.ts  # 匯出所有題目
```

### JSON 檔案格式
```json
{
  "version": "1.0.0",
  "level": "N5",
  "category": "vocabulary",
  "lastUpdated": "2025-10-31",
  "questions": [
    { /* SingleQuestion */ },
    { /* SingleQuestion */ },
    ...
  ]
}
```

---

## AI 生成題目的 Prompt 範例

```
請生成 10 題 N5 日語單字單選題，格式如下：

{
  "id": "n5-vocab-XXX",
  "type": "single",
  "category": "vocabulary",
  "difficulty": 2,
  "prompt": "題目文字",
  "options": ["選項1", "選項2", "選項3", "選項4"],
  "answerIndex": 0,
  "explanation": "答案解釋",
  "tags": ["標籤1", "標籤2"]
}

要求：
1. 題目涵蓋常見 N5 單字（如家族、數字、顏色、動作）
2. 每題 4 個選項，干擾選項要合理
3. 難度分布：簡單 4 題、中等 4 題、稍難 2 題
4. 每題附上簡短解釋
```

---

## 驗證規則

### 必填欄位
- ✅ `id` 必須唯一
- ✅ `type` 必須是 'single' | 'match' | 'fill'
- ✅ `category` 必須是定義的類別之一
- ✅ `difficulty` 必須是 1-5
- ✅ `prompt` 或 `instruction` 不可為空

### 選項驗證
- ✅ 單選題：至少 2 個選項，`answerIndex` 必須在範圍內
- ✅ 配對題：left 和 right 長度必須相同，pairs 不可有重複
- ✅ 填空題：solutions 陣列長度必須等於 blanks

---

## 使用範例

### 在 question-bank.ts 中載入
```typescript
import vocabularyQuestions from '@/data/questions/n5-vocabulary.json';
import grammarQuestions from '@/data/questions/n5-grammar.json';

const allQuestions = [
  ...vocabularyQuestions.questions,
  ...grammarQuestions.questions
];

export function getDailyQuestions(count: number): AnyQuestion[] {
  // 隨機選取不重複題目
  return shuffleArray(allQuestions).slice(0, count);
}
```

---

## 版本歷史

- v1.0.0 (2025-10-31): 初始版本，定義三種題型格式
