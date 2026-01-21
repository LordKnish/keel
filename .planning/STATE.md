# Project State

## Current Milestone
**v2.2: UX Improvements and Infrastructure** - In Progress

## Current Phase
Phase 11: Social sharing expansion (not started)

## Status
- Phase 11: **Pending** - Social sharing expansion (Bluesky, Facebook)
- Phase 12: **Pending** - Search suggestions improvements
- Phase 13: **Pending** - Cron job multi-mode generation

## Previous Milestones
- **v2.1: Bug Fixes and Polish** - Complete
- **v2.0: Bonus Game Modes** - Complete
- **v1.0: Switch from ship name to ship class** - Complete

## Decisions Made
- 5 bonus modes (not 6): WW2, Cold War, Aircraft Carrier, Submarine, Coast Guard
- Grouped phase structure: architecture, era modes, type modes, UI, testing
- **Sequential mode unlocking**: main → ww2 → coldwar → carrier → submarine → coastguard
- **Hamburger menu** in top-left for mode selection with checkmarks for completed modes
- Separate JSON files per mode (game-data-{mode}.json)
- Per-mode used ship tracking
- API now supports all modes via `?mode=xxx` query parameter

## v2.2 Goals
1. **Social sharing**: Add Bluesky and Facebook share buttons to WinModal
2. **Search UX**: Fix paste not triggering suggestions, auto-submit on exact match
3. **Cron fix**: Generate all modes daily, not just main

## Notes
- Ship pool expanded to 61 ships (added guided missile destroyers)
- Multi-mode architecture complete with generator CLI flags (--all, --mode=xxx)
- API supports curl for all modes: `curl /api/game/today?mode=ww2`
- API lists modes: `curl /api/game/today?all`
