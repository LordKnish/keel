# Phase 8: Testing and Polish - Summary

## Objective
Generate game data for all bonus modes, verify end-to-end gameplay, and add API curl support for all modes.

## Completed Tasks

### Task 1: Generate game data for all bonus modes
**Commit**: `5ea1e3a`
- Ran `npm run generate -- --all` to create all 6 game data files
- Files created in `/public`:
  - `game-data-main.json` - HMS Hero (G and H-class destroyer)
  - `game-data-ww2.json` - HMS Awe (River-class frigate)
  - `game-data-coldwar.json` - HMS Avon (River-class frigate)
  - `game-data-carrier.json` - Admiral Kuznetsov (Kuznetsov-class aircraft carrier)
  - `game-data-submarine.json` - IMO 9506239 (RoRo 2200)
  - `game-data-coastguard.json` - HMS Temeraire (Bellerophon-class dreadnought battleship)

**Issue Discovered**: Ship type filtering for submarine and coastguard modes selected wrong ship types (cargo ship and battleship). SPARQL query filters need refinement.

### Task 2: Run test suite and typecheck
- All 58 tests passing
- TypeScript typecheck passes
- Vite build succeeds

### Task 3: Add API curl support
**Commit**: `e87a76c`
- Updated `/api/game/today` endpoint to support all modes:
  - `GET /api/game/today?mode=ww2` - fetch specific mode data
  - `GET /api/game/today?all` - list all available modes
- Main mode fetches from database
- Bonus modes read from static JSON files

### Tasks 4-5: Documentation updates
- Updated STATE.md with milestone completion
- Updated ROADMAP.md with phase completion

## Files Modified/Created
- `public/game-data-main.json` (regenerated)
- `public/game-data-ww2.json` (new)
- `public/game-data-coldwar.json` (new)
- `public/game-data-carrier.json` (new)
- `public/game-data-submarine.json` (new)
- `public/game-data-coastguard.json` (new)
- `api/game/today.ts` (enhanced for curl support)
- `.planning/STATE.md` (updated)
- `.planning/ROADMAP.md` (updated)

## Commits
1. `5ea1e3a` - feat(8): generate game data for all 6 modes
2. `e87a76c` - feat(8): add curl support for all game modes
3. `eac2b91` - fix(8): correct SPARQL ship type Q-IDs for submarine and coastguard
4. `87a6697` - feat(8): regenerate submarine and coastguard game data
5. `7b5a62b` - feat(8): enhance API curl responses with success status

## Verification
- TypeScript: All typechecks pass
- Tests: 58 tests passing
- Build: Vite build successful
- API: Supports `?mode=xxx` and `?all` query parameters

## Bug Fix: Ship Type Filtering
**Issue**: Submarine and coastguard modes selected incorrect ship types
- Submarine mode got a RoRo cargo ship (Q473932 was "roll-on/roll-off ship")
- Coastguard mode got a battleship (Q847109 was "dreadnought", Q3041792 was "reconnaissance aircraft")

**Fix**: Corrected SPARQL Q-IDs in `scripts/game-generator/src/modes.ts`:
- Submarine: Q4818021 (attack sub), Q2811 (sub), Q683570 (ballistic missile sub), Q17005311 (coastal sub), Q757587, Q757554 (nuclear subs)
- Coastguard: Q331795 (patrol vessel), Q11479409 (offshore patrol), Q10316200 (small patrol boat), Q683363 (cutter)

**Result**: Modes now correctly select ships:
- Submarine: HMS Spur (S-class submarine)
- Coastguard: NRP Bellatrix (Bellatrix II-class patrol boat)

## API Usage Examples
```bash
# List all available modes
curl /api/game/today?all

# Fetch specific mode
curl /api/game/today?mode=ww2
curl /api/game/today?mode=carrier

# Direct static file access (alternative)
curl /game-data-ww2.json
```

## Next Steps
- v2.0 milestone complete
- Future work: Fix SPARQL ship type filters for submarine/coastguard modes
