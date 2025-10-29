# Tasks: Daily N5 Drill (FR-001)

**Input**: 設計文件於 `/specs/001-daily-n5-drill/`  
**Prerequisites**: [spec.md](specs/001-daily-n5-drill/spec.md), [plan.md](specs/001-daily-n5-drill/plan.md)  
**Tests**: 本功能採 TDD；測試名稱需含 AC-?（Red → Green → Refactor）

## Path Conventions

- frontend/lib/…：核心邏輯（drill/session, drill/question-bank, srs/scheduler, sync, storage, telemetry）
- frontend/components/…：UI 元件
- frontend/app/(drill)/…：頁面
- tests/{unit,integration,contract,e2e}/…：測試

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 建立專案目錄結構與空檔（frontend/lib、frontend/components、frontend/app/(drill)、tests/{unit,integration,contract,e2e}）
- [ ] T002 初始化測試工具鏈與指令（tests/README.md、npm scripts 或等效；確保可分別執行 unit/integration/contract/e2e）
- [ ] T003 新增 CI 基礎工作流 `.github/workflows/ci.yml`（lint/typecheck/test 三階段）

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 [P] 設定遙測事件驗證器 frontend/lib/telemetry/events.ts（型別與驗證）
- [ ] T005 [P] 建立離線儲存基礎 frontend/lib/storage/indexeddb.ts（schema v1 與版本守衛）
- [ ] T006 [P] 建立同步工作器 frontend/lib/sync/sync.ts（背景同步介面與占位實作）
- [ ] T007 設定專案型別檢查與 Lint 規則（tsconfig/eslint/prettier 等）

**Checkpoint**: 基礎就緒，可開始 US1 開發與測試

---

## Phase 3: User Story 1 - Daily Drill MVP (Priority: P1) 🎯 MVP

**Goal**: 使用者每天可完成 10 題 N5 練習，當下判定正誤，結束顯示摘要  
**Independent Test**: 單獨部署此頁面與邏輯即可自給自足（可離線提供 7 天內快取）

### Tests for User Story 1（寫在前；名稱包含 AC-1..AC-6）

- [ ] T010 [P] [US1] Contract 測試：今日練習 10 題（AC-1）tests/contract/today-drill.contract.test.ts
- [ ] T011 [P] [US1] Unit 測試：題型混合/產生器/檢查器（AC-1, AC-3）tests/unit/daily-n5-drill.spec.ts
- [ ] T012 [P] [US1] Integration 測試：離線快取供應與重連背景同步（AC-2, AC-3, AC-4）tests/integration/daily-n5-drill.integration.spec.ts
- [ ] T013 [P] [US1] E2E 測試：UI 版面與空/錯誤狀態（AC-6）tests/e2e/daily-n5-drill.e2e.spec.ts
- [ ] T014 [P] [US1] Telemetry 事件形狀驗證與關鍵動作發送（AC-5）tests/unit/telemetry.events.spec.ts

### Implementation for User Story 1

- [ ] T015 [US1] 題庫 frontend/lib/drill/question-bank.ts（N5 小集合與選題策略）
- [ ] T016 [US1] SRS 基線 frontend/lib/srs/scheduler.ts（SM2 基線或等效簡化）
- [ ] T017 [US1] 回合引擎 frontend/lib/drill/session.ts（狀態機：start → answer → next → summary）
- [ ] T018 [US1] 今日頁面 frontend/app/(drill)/today/page.tsx（Header/Main/Footer 固定版面）
- [ ] T019 [P] [US1] QuestionCard 元件 frontend/components/drill/QuestionCard.tsx
- [ ] T020 [P] [US1] ActionsBar 元件 frontend/components/drill/ActionsBar.tsx
- [ ] T021 [P] [US1] SessionHeader 元件 frontend/components/drill/SessionHeader.tsx
- [ ] T022 [US1] 遙測注入：drill_started/answer_correct|incorrect/session_completed 於關鍵操作
- [ ] T023 [US1] 離線供應與自動同步串接（storage/indexeddb.ts + sync/sync.ts）
- [ ] T024 [US1] 完成 AC 對表並修綠測試（TT 系列全綠）

**Checkpoint**: US1 可獨立運作且測試可重現通過

---

## Phase N: Polish & Cross-Cutting

- [ ] T025 在 CI 新增 Lint/TypeCheck/Test 報表與失敗門檻（覆蓋率可選）
- [ ] T026 建立儀表板指標（完成數、正確率、時長）資料管線（暫以日誌/事件彙總）
- [ ] T027 文件 quickstart.md 更新使用情境與測試啟動方式
- [ ] T028 清理 TODO 與風險備忘，回寫 plan.md 的回顧

---

## Dependencies & Execution Order

- Foundation → US1  
- US1 先測試（T010–T014）後實作（T015→T017→T018→T019–T021→T022→T023→T024）  
- [P] 可並行：T004–T006、T010–T014、T019–T021

---

## Implementation Strategy

- 嚴格小步：先完成 US1（AC‑1..AC‑6），其他延後  
- 每完成一組 AC：紅→綠→重構，提交一次  
- 任何跨檔案相依務必順序執行；[P] 僅限不同檔案、無依賴

## Notes

- 測試命名需含 AC-?（例：test_AC-1_...）  
- 若需擴充後續 User Story，複製本 Phase 模式新增 Phase 4/5…