# Project State

## Current Milestone
**v2.0: Bonus Game Modes** - Complete

## Current Phase
None (milestone complete)

## Status
- Phase 6: **Complete** - Multi-mode architecture
- Phase 7: **Complete** - Mode Selection UI with Sequential Unlocking
- Phase 8: **Complete** - Testing and polish

## Previous Milestones
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

## Ship Pool Research (Phase 6)
- Main: ~61 ships (modern 1980+)
- WW2: 332 ships (1939-1945)
- Cold War: 225 ships (1947-1991)
- Aircraft Carrier: 30 ships
- Submarine: 71 ships
- Coast Guard: 33 ships

## Notes
- Ship pool expanded to 61 ships (added guided missile destroyers)
- Multi-mode architecture complete with generator CLI flags (--all, --mode=xxx)
- API supports curl for all modes: `curl /api/game/today?mode=ww2`
- API lists modes: `curl /api/game/today?all`
