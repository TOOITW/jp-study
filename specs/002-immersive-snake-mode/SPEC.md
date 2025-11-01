# Immersive Snake Mode — SPEC (MVP)

Last updated: 2025-11-01

## Overview

Immersive learning mode that splits the screen: top Language Panel (input/scaffolding), bottom Snake Game (output/interaction). Each item renders text/audio and spawns multiple answer "food" in the game. Correct hit grows snake and advances sentence progress; wrong hit shortens or loses HP; sentence completion triggers effects and submits results.

## Clarifications

### Session 2025-11-01
- Q: Game rendering stack? Canvas 2D vs Phaser? → A: Canvas 2D (recommended)
  - Rationale: Minimal intrusion, lighter bundle, easy Next.js integration, enables testable pure-function core + thin renderer.

## Functional Requirements (FR) and Acceptance Criteria (AC)

- FR-001 Mode Toggle (Feature Flag)
  - Users can enter Immersive Snake Mode from /today or visit /immersive when NEXT_PUBLIC_FEATURE_IMMERSIVE_SNAKE=true (URL query ?mode=snake may also enable).
  - AC: When flag=false, no entry visible; /immersive not routable.

- FR-002 Progressive Scaffolding
  - Items progress: char → word → biword → grammar (particles/verbs) → sentence.
  - AC: Each level serves ≥3 items; options map to game food one-to-one; audio (if present) can be played.

- FR-003 Reaction Time Limit
  - Each item has a countdown (default 15s). Timeout counts as wrong.
  - AC: Timeout immediately emits hit_wrong and visual/audio feedback.

- FR-004 Hit Feedback and Sentence Completion
  - Correct hit: grow snake, progress +1, play SFX; Wrong hit: shrink/HP−1; HP=0 restarts current item.
  - AC: Real-time feedback for both outcomes; sentence completion shows effect and emits sentence_done.

- FR-005 Progress Sync
  - On item completion or sentence completion, call submitResult(payload) and keep existing summary logic intact.
  - AC: After session, existing summary reflects additional stats (correct count, duration).

- FR-006 Audio + Captions
  - Text/audio playback supported for items; captions toggle available.
  - AC: Clicking play outputs audio; captions match text.

- FR-007 Fallback / Rollback
  - Turning feature flag off restores legacy experience.
  - AC: With flag=false, no code path or UI references are active.

## Data Model (TypeScript)

```ts
export type Level = 'char'|'word'|'biword'|'grammar'|'sentence';

export interface Option {
  id: string;      // used as food id
  label: string;   // display
  value: string;   // correctness key
}

export interface Item {
  id: string;
  level: Level;
  prompt: string;
  audioUrl?: string;
  options: Option[];
  answerKey: string; // matches options[i].value
}

export interface Attempt {
  itemId: string;
  selected: string;   // hit food value
  isCorrect: boolean;
  latencyMs: number;
  timestamp: number;
}

export interface SessionStats {
  sessionId: string;
  mode: 'immersive-snake';
  correctCount: number;
  wrongCount: number;
  streakMax: number;
  durationMs: number;
  itemsDone: number;
}
```

## Telemetry Events

- enter_mode — `{ sessionId, mode: 'immersive-snake', ts }`
- start_item — `{ sessionId, itemId, level, optionCount, ts }`
- hit_correct — `{ sessionId, itemId, value, latencyMs, snakeLength, ts }`
- hit_wrong — `{ sessionId, itemId, value, latencyMs, hpLeft, ts }`
- sentence_done — `{ sessionId, sentenceId: itemId, accuracy, timeMs, ts }`
- exit_mode — `{ sessionId, reason: 'completed'|'user-exit'|'timeout', stats: SessionStats, ts }`

## Contracts

- Question bank (local typed API):
```ts
export function getNextItems(level: Level, count: number): Promise<Item[]>;
export function toFoodOptions(item: Item): Option[]; // maps to in-game food
```

- Progress Sync:
```ts
export function submitResult(payload: {
  sessionId: string;
  itemId: string;
  isCorrect: boolean;
  latencyMs: number;
  level: Level;
}): Promise<void>;
```

- Game Core (pure functions):
```ts
export interface GameState { /* snake, foods, bounds, hp, score, etc. */ }
export function init(config: { width: number; height: number; grid: number; hp: number }): GameState;
export function step(state: GameState, input: 'up'|'down'|'left'|'right'|'none', dtMs: number): GameState;
export function spawnFoodFromOptions(options: Option[], bounds: { w:number; h:number }, grid: number): GameState;
export function detectCollisions(state: GameState): { kind: 'food'|'self'|'wall'; targetId?: string }[];
```

## Architecture Sketch (MVP)

- App route: `app/(drill)/immersive/page.tsx` → `<GameShell>`
  - Top 30%: `<LanguagePanel>` — loads `Item`, plays audio, countdown, emits start_item
  - Bottom 70%: `<SnakeCanvas>` — mounts Canvas 2D, runs rAF loop, handles input
  - Glue: events from canvas to panel (hit_correct/hit_wrong), panel to canvas (spawn foods)

- Thin renderer: `frontend/game/snake/renderer/canvas.ts` draws from immutable state; logic in `frontend/game/snake/core.ts`

## Risks & Mitigations

- Performance (60fps mobile)
  - Mitigation: integer grid, single rAF, batched draw, cap objects; devtools performance sampling gates
- Accessibility
  - Mitigation: captions toggle, SFX volume control, keyboard+touch input parity
- Data/Mapping Quality
  - Mitigation: validate item schema; auto-generate distractors when options < 2
- Collision Tolerance
  - Mitigation: grid-based detection with small tolerance constant
- Rollback
  - Feature flag gate; route guarded when disabled

## MVP Change List (files)

- app/(drill)/immersive/page.tsx — new route, flag guard
- components/immersive/GameShell.tsx — 30/70 split
- components/immersive/LanguagePanel.tsx — scaffolded items, audio, countdown
- components/immersive/SnakeCanvas.tsx — canvas mount + loop
- frontend/game/snake/core.ts — pure logic
- frontend/game/snake/renderer/canvas.ts — thin renderer
- frontend/game/snake/types.ts — types/constants
- frontend/lib/featureFlags.ts — `isImmersiveSnakeEnabled()`
- frontend/lib/telemetry/events.ts — add immersive events
- tests/unit/game/snake-core.spec.ts — engine tests
- tests/integration/immersive-mode.integration.spec.ts — panel↔engine flow

## Next Tasks (Issues)

1. Immersive Shell + Route + Flag
   - AC: `/immersive` renders 30/70 layout when flag=true; emits enter_mode/exit_mode
2. SnakeEngine (pure) + Canvas renderer (thin)
   - AC: unit tests for `init/step/spawnFoodFromOptions/detectCollisions`; arrow keys move snake; 60fps ok on dev
3. LanguagePanel + submitResult wiring
   - AC: serves items by level; 15s countdown; emits hit_correct/hit_wrong; sentence_done advances and syncs stats
