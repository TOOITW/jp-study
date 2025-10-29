# Quickstart — FR-001 Daily N5 Drill

## Goals
- Run the Daily Drill locally with offline cache and telemetry hooks

## Steps (proposed, adapt to repo state)
1) Install dependencies and dev tools
2) Start dev server
3) Run tests (unit/integration/e2e)
4) Validate telemetry events emitted (dev console/network)

## Scenarios to Verify
- First load < 2s (4G-like throttle), interactions < 100ms
- Complete a session in under 5 minutes
- Go offline: drill still works; reconnect → auto sync
- Summary shows accuracy, wrong list, next review time
