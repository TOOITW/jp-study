# JP Study App Constitution

## Core Principles

### I. 5-Minute Value (NON-NEGOTIABLE)
每位使用者在 **5 分鐘內**必須能完成一輪有效練習並獲得回饋（正確率、錯題清單、下次複習時間）。

### II. SDD × TDD as Default
所有功能以 **Spec-Driven Development** 寫清楚 User Story 與 Acceptance Criteria；並以 **Test-Driven Development** 實作：每條 AC 至少一個自動化測試（紅→綠→重構）。測試描述需含 `AC-?` 標籤以供對表。

### III. Observability by Design
預設上報事件（`drill_started`, `answer_correct/incorrect`, `session_completed`）；指標（每日完成次數、正確率、留存、平均時長）。錯誤需可追蹤與定位。任何新功能必須標示可觀測性影響。

### IV. Offline-first & Fast
首屏 < 2s（4G），互動回饋 < 100ms。離線可完成練習，復網自動同步。資料本地化保存近 7 日，採版本化 schema 與遷移策略。

### V. Opinionated UI System
Web 採 Next.js + Tailwind + shadcn/ui；禁止自創 UI 庫與隨意色票。固定布局：上（進度/任務）、中（題目）、下（動作）。空狀態、Skeleton、錯誤提示為必備狀態。

## Development Workflow & Quality Gates
- 規格文件：`specs/NNN-<short-name>/spec.md`（含 AC）
  - 例：`specs/001-daily-n5-drill/spec.md`（三位數補零，短名為小寫-kebab）
- 澄清 Q&A：`clarifications/FR-xxx.md`
- 技術方案：`plan/FR-xxx.md`（含 Test Plan/資料模型/風險/回滾）
- PR 模板：必勾 AC 對表、測試層級（Unit/Integration/E2E）、Lint/TypeCheck/Test、可觀測性
- CI：最低要求 Lint + TypeCheck + Test；之後補安全/依賴審計
- 重要架構變更需 ADR：`docs/ADR/xxxx.md`

### Naming Conventions（強制）
- 功能分支與規格資料夾名稱必須為 3 位數補零前綴：`^[0-9]{3}-[a-z0-9-]+$`，例如：`001-daily-n5-drill`
- 嚴禁建立非補零前綴（如 `1-...`）的 specs 目錄或分支
- 建立新功能時不得手動指定編號（--number），除非明確大於現存最高值且在 PR 描述說明理由
- 若發現命名違規，流程必須先合併/更名後再繼續（不得跳過）

### Single Source of Truth（SSOT）
- 一切「功能設計文件」之單一權威在 `specs/NNN-<short-name>/`：
  - `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `tasks.md` 皆以 FEATURE_DIR 為準。
- 禁止在 `plan/`、`docs/` 等目錄維護重複的 `FR-xxx.md` 正本。
- 若需在 `plan/` 保留入口檔，必須是指向 FEATURE_DIR 中對應 `plan.md` 的 symlink。
- CI/腳本應在偵測到多處不一致時中止，要求修復（刪除副本或改為 symlink）。

### Acceptance Criteria（AC）組織規範（新增）
- **禁止**創建獨立的 `ac-*.md` 文件（如 `ac-1.md`, `ac-7.md` 等）
- **所有 AC 定義**必須整合在 `plan.md` 的 **Section 8: Test Plan (TDD) — AC mapping**
- **所有 AC 實作任務**必須整合在 `tasks.md` 的對應 **Phase/User Story**
- AC 命名規則：`AC-N` 其中 N 為數字（1, 2, 3...），每條 AC 至少包含：
  - 簡短描述（單行）
  - 測試清單（含測試類型：unit/integration/contract/e2e）
- 違規案例：創建 `specs/001-xxx/ac-7.md` 而非將其內容整合進 `plan.md` 和 `tasks.md`

### Interactive Loop & Realtime UI 規範（新增）

為避免互動式遊戲循環（如 Canvas / requestAnimationFrame / setInterval）與 React/Next.js 的狀態流產生偏差，制定以下強制規範：

- 長壽命迴圈中的動態資料同步（強制）
  - 在 `requestAnimationFrame` / `setInterval` / WebSocket callbacks 內，若需讀取「會隨 props/state 改變」的值，必須使用 `useRef` 同步最新值，或確保 effect 依賴完整、能安全重綁迴圈。
  - 禁止在長壽命迴圈中直接閉包舊的 props/state 造成「僵固判定」（stale closure）。
  - 反例：在遊戲迴圈內直接使用初次 render 的 `onAnswerConsumed` 或 `correctLabel`。

- Domain × Core 合約（強制）
  - 將「遊戲核心（core）」與「領域規則（domain）」拆分：核心 `step()` 僅提供基本移動/吃到食物 → 長度+1/分數+1；領域規則（正確/錯誤處置）在外層進行二次調整。
  - 必須定義不變式（Invariants）：
    - 分數不得 < 0；
    - 蛇最小長度 ≥ 1；
    - 「錯誤」的淨效果需明文化（例如：淨縮短 1、分數-1）。
  - 任何對核心結果的二次調整需在 Spec 的 Contracts 區塊與 AC 中對表。

- 題目前進與事件（強制）
  - 吃到任一選項（正/誤）必須觸發單一入口（例如 `onAnswerConsumed(isCorrect)`）以推進題目索引與重置/重佈局相關資源。
  - Telemetry 需同步上報：被吃的 label、是否正確、分數、tick 時間。

- Options 變更時的佈局（強制）
  - 當 `options` 改變時：
    - 必須重新佈局（reseed）畫面上的目標（如食物）以對齊數字標籤與側欄 legend；
    - 不可無故重置蛇狀態與速度等玩家設定（除非設計上明確定義）。

- Next.js 15 與 SSR/CSR 一致性（強制）
  - 動態 API 限制：頁面層若依賴 `searchParams` 或 feature flag，必須以 Server Component 先行「決策」，Client Component 僅負責行為與渲染，避免 hydration mismatch。

- 測試要求（強制）
  - Unit（核心）：
    - 驗證 `step()` 的移動、吃到食物、包牆/撞牆、不可 180 度轉向、不變式維持。
  - Integration（領域規則層）：
    - 吃到正解：淨加長 1、分數+1；
    - 吃到錯誤：淨縮短 1、分數-1（不低於 0）。
  - E2E（互動）：
    - 連續至少三題能確定前進（正/誤皆會前進）；
    - options 變更後，Canvas 數字標籤與側欄 legend 一致；
    - 暫停/恢復、速度與包牆切換可用，且不破壞迴圈狀態。

- 常見反模式（禁止）
  - 在遊戲迴圈中直接閉包初始 props/state；
  - 以「重建整個遊戲狀態」處理 `options` 微調，導致玩家設定與蛇狀態被意外重置；
  - 在頁面層混用動態資料導致 Hydration mismatch。

### Git Ignore 規範（強制）
- **必須**維護根目錄 `.gitignore` 檔案；禁止提交：
  - `node_modules/` — 依賴目錄，由 `npm ci` 恢復
  - `.next/`, `dist/`, `build/` — 生成目錄
  - `.env*` — 環境變數（除 `.env.example` 範本）
  - `*.log`, `coverage/` — 測試與日誌
  - `.DS_Store`, `.idea/`, `.vscode/` — IDE/OS 暫存檔
  - `tsconfig.tsbuildinfo`, `next-env.d.ts` — TypeScript 生成檔
- **有 `.gitignore` 時必須遵守**：違反規則提交的檔案必須立即執行 `git rm --cached` 移除
- **無 `.gitignore 時必須新增**：採用本憲章提供的標準配置（Node.js + Next.js + IDE）
- 驗證方式：`git check-ignore -v <file>` 確認規則是否生效；CI 可建立 lint 檢查

## Security & Data
最小化資料收集；匯入/匯出時提示敏感資訊。資料結構版本化；提供明確 migration。

## Performance Standards
- FCP < 2s（4G）、互動回饋 < 100ms
- 題目生成與答案判定 O(1)~O(log n)；SRS 計算不可阻塞 UI

## Governance
此憲章優先級高於其他文件；任何偏離需在 PR 說明並獲得 Owner 批准。PR Review 必須核對：AC 測試對表、可觀測性、回滾策略。

**Version**: 1.3.0 | **Ratified**: 2025-10-28 | **Last Amended**: 2025-10-31
