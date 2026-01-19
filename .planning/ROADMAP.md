# Keel Roadmap

## v1.0: Switch from ship name to ship class

**Goal**: Change the game mechanic so players guess ship classes instead of specific ship names, while accepting both as correct answers.

**Requirements gathered**:
- Search dropdown shows only ship classes (not individual ships)
- Both class name and ship name accepted as correct guesses
- Win display shows both class name and specific ship name

### Phase 1: Update data structures and types ✅
- [x] Update `ship-list.json` generation to output classes instead of ships
- [x] Update TypeScript types for class-based data
- [x] Update `game-data.json` structure to include className
- **Completed**: 6 commits, 44 classes generated

### Phase 2: Update search/guess logic ✅
- [x] Modify `useShipSearch` hook to search classes
- [x] Update `ShipSearch` component for class selection
- [x] Update guess validation to accept both class and ship name
- **Completed**: 6 commits, all tests passing

### Phase 3: Update UI display ✅
- [x] Update win modal to show both class and ship name
- [x] Update game complete message
- [x] Update guess history display
- **Completed**: 3 commits

### Phase 4: Update data pipeline scripts ✅
- [x] Modify ship-list generation to output unique classes
- [x] Ensure game-generator outputs class info properly
- [x] Regenerate data files
- **Completed in Phase 1**: Data pipeline already updated

### Phase 5: Testing and polish ✅
- [x] Update tests for new class-based logic
- [x] Manual testing of full game flow
- [x] Fix any edge cases
- **Completed**: 58 tests passing, all functionality working

---

## v2.0: Bonus Game Modes

**Goal**: Add 5 bonus game modes that unlock after completing the main daily Keel game, each with different ship filters.

**Bonus Modes**:
1. **WW2 Ship** - Ships from World War 2 era (1939-1945)
2. **Cold War Ship** - Ships from Cold War era (1947-1991)
3. **Aircraft Carrier** - Carrier-specific challenges
4. **Submarine** - Submarine-specific challenges
5. **Coast Guard Vessel** - Small vessels and patrol boats

### Phase 6: Multi-mode architecture ✅
- [x] Design game mode data structure and API
- [x] Create mode-specific SPARQL query builders
- [x] Add mode parameter to game data generation
- [x] Create separate game data files per mode
- [x] Add mode completion tracking (localStorage)
- **Completed**: 8 commits
  - Created `modes.ts` for backend with SPARQL filters
  - Created `src/types/modes.ts` for frontend
  - Updated `select-ship.ts` with parameterized queries
  - Updated `used-ships.ts` for per-mode tracking
  - Updated `index.ts` with --all and --mode CLI flags
  - Created `useModeCompletion` hook for localStorage
  - Updated `App.tsx` with mode support
  - Updated API endpoint with mode parameter

### Phase 7: Mode Selection UI with Sequential Unlocking ✅
*(Consolidates original phases 7-9)*

**Sequential Unlock Order**:
1. Main (Daily Keel) - Always available
2. WW2 - Unlocks after completing Main
3. Cold War - Unlocks after completing WW2
4. Carrier - Unlocks after completing Cold War
5. Submarine - Unlocks after completing Carrier
6. Coast Guard - Unlocks after completing Submarine

**Tasks**:
- [x] Update mode types with unlock order and prerequisites
- [x] Update useModeCompletion hook with unlock logic
- [x] Create ModeMenu component (hamburger menu)
- [x] Create ModeMenu styles (slide-out panel)
- [x] Integrate ModeMenu into App header (left side)
- [x] Update header layout (hamburger left, help right)
- [x] Add mode lock enforcement
- [x] Generate game data for main mode
- [x] Verify and test

**Completed**: 5 commits
- Added unlock order fields to mode config
- Added unlock checking functions to hook
- Created ModeMenu component with slide-out panel
- Integrated into App header with grid layout
- Updated tests for mode name tagline

### Phase 8: Testing and polish ✅
- [x] Generate game data for all 6 modes (`npm run generate -- --all`)
- [x] Test all 5 bonus modes end-to-end
- [x] Verify ship pool sizes are adequate
- [x] Add API curl support for all modes (`?mode=xxx`, `?all`)
- [x] Update any affected tests
- **Completed**: 2 commits
  - Generated game data for all 6 modes
  - Added API support for curling any mode
  - 58 tests passing

---

## v2.0 Complete

All phases complete. 5 bonus game modes available with sequential unlocking.
