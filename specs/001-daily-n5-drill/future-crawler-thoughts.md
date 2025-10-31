# Question Crawler System (Future Feature)

## 概述

**功能編號**: FR-002 或 FR-003（待決定）  
**優先級**: P2（在 FR-001 完成後）  
**目標**: 自動化從公開資源爬取 N5 題目，轉換為標準格式

---

## 為什麼需要另開 Feature？

### FR-001 的範圍
- ✅ 建立題庫**格式標準**
- ✅ 手動建立**初始題庫**（20-30 題）
- ✅ 前端消費題庫的邏輯

### 爬蟲系統的複雜度
- ⚠️ 需要後端服務（爬蟲排程、資料清洗）
- ⚠️ 需要法律審查（版權、授權）
- ⚠️ 需要品質控制（題目驗證、去重）
- ⚠️ 需要維護成本（網站結構變動）

**結論**: 爬蟲系統是**獨立的內容管線（Content Pipeline）**，不應混入前端練習功能。

---

## 架構設計（草案）

```
┌─────────────────────────────────────────────────┐
│         FR-002: Question Content Pipeline       │
└─────────────────────────────────────────────────┘

1. Crawler Service (Python/Node.js)
   ├── Source Adapters
   │   ├── JapanesePod101Adapter
   │   ├── NHKNewsWebAdapter
   │   └── CustomSourceAdapter
   ├── Data Normalizer (轉換為標準格式)
   └── Quality Validator (驗證題目品質)

2. Content Processing
   ├── Deduplication (去重)
   ├── Difficulty Scoring (AI 自動評分)
   └── Tagging (自動標籤)

3. Storage & Versioning
   ├── Raw Data Store (原始爬取資料)
   ├── Processed Question Bank (處理後題庫)
   └── Version Control (題庫版本管理)

4. Admin Dashboard
   ├── 手動審核待發布題目
   ├── 批次編輯/刪除
   └── 統計報表（來源分布、品質分數）
```

---

## 潛在資料來源

### 公開資源（需確認授權）
1. **NHK News Web Easy**: 簡化新聞，適合 N5-N4
2. **JLPT Sample Questions**: 官方樣題
3. **免費日語學習網站**:
   - JapanesePod101 (部分免費)
   - Tae Kim's Guide
   - Maggie Sensei

### 需要付費/授權
- JLPT 官方題庫
- 商業教材（如 Genki, Minna no Nihongo）

### 自動生成（AI）
- 使用 GPT-4/Claude 生成題目
- 需要人工審核確保品質

---

## 技術棧建議

### 方案 A: Python + Scrapy
```python
# 優點：強大的爬蟲框架、豐富的庫
# 缺點：需要額外的 Python 服務

class N5QuestionSpider(scrapy.Spider):
    def parse(self, response):
        # 爬取邏輯
        yield QuestionItem(
            raw_html=response.text,
            source_url=response.url,
            scraped_at=datetime.now()
        )
```

### 方案 B: Node.js + Puppeteer
```typescript
// 優點：與前端共用技術棧、動態頁面支援
// 缺點：資源消耗較高

async function scrapeQuestions(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  const questions = await page.evaluate(() => {
    // 提取題目邏輯
  });
  
  return questions;
}
```

---

## 開發階段建議

### Phase 0: 研究與合規（1-2 週）
- [ ] 調查潛在資料來源的授權條款
- [ ] 確認爬蟲合法性（robots.txt, ToS）
- [ ] 決定技術棧

### Phase 1: MVP Crawler（2-3 週）
- [ ] 單一資料來源爬蟲
- [ ] 資料轉換為標準格式
- [ ] 基本去重與驗證

### Phase 2: 品質控制（1-2 週）
- [ ] AI 輔助品質評分
- [ ] 人工審核介面
- [ ] 批次發布流程

### Phase 3: 生產化（2 週）
- [ ] 排程自動執行
- [ ] 錯誤監控與告警
- [ ] 資料版本管理

**預估總時間**: 6-9 週（全職開發）

---

## 法律與倫理考量

### ⚠️ 注意事項
1. **版權**: 許多 JLPT 題目有版權保護
2. **ToS**: 檢查目標網站的服務條款
3. **Rate Limiting**: 避免過度請求造成負擔
4. **Attribution**: 適當標注題目來源

### 替代方案
- **眾包（Crowdsourcing）**: 讓用戶貢獻題目
- **AI 生成 + 人工審核**: 更可控的內容來源
- **合作夥伴**: 與日語教師/機構合作

---

## 暫時的解決方案（FR-001 範圍內）

### 手動建立初始題庫（本週）
```bash
# 1. 請 AI 生成題目
prompt: "生成 30 題 N5 單選題，JSON 格式..."

# 2. 人工審核與調整

# 3. 存入檔案
frontend/data/questions/n5-vocabulary.json
```

### AI 輔助生成流程
```bash
# 使用 ChatGPT/Claude 的腳本
1. 提供題目 schema
2. 批次生成 10 題
3. 手動檢查品質
4. 合併到題庫
```

---

## 決策點

### 現在需要決定：

1. **FR-001 階段**（本週）:
   - ✅ 使用 AI 生成 30 題初始題庫
   - ✅ 手動審核確保品質
   - ✅ 先讓功能可用

2. **FR-002 規劃**（下個月）:
   - ⏳ 完成法律與技術調研
   - ⏳ 決定是否開發爬蟲系統
   - ⏳ 或採用 AI 生成 + 眾包模式

---

## 下一步行動

### 立即（FR-001）
1. 使用 AI 生成初始題庫（30 題）
2. 實作題庫載入邏輯
3. 完成 UI 修復

### 未來（FR-002）
1. 建立 `specs/002-question-crawler/` 或 `specs/003-content-pipeline/`
2. 撰寫完整 spec.md
3. 技術 POC（Proof of Concept）

---

**狀態**: 草案  
**版本**: 0.1.0  
**日期**: 2025-10-31
