# Phase 8: Testing and Polish

<objective>
Generate game data for all bonus modes, verify end-to-end gameplay, and polish the mode selection UX.
</objective>

<context>
**Prior Work:**
- Phase 6: Multi-mode architecture complete (SPARQL filters, per-mode tracking, CLI flags)
- Phase 7: Mode selection UI complete (hamburger menu, sequential unlocking)

**Current State:**
- Only `game-data-main.json` exists in `/public`
- Bonus modes (ww2, coldwar, carrier, submarine, coastguard) have no game data files
- 58 tests passing, TypeScript compiles, Vite builds

**Ship Pool Sizes (from research):**
| Mode | Count |
|------|-------|
| Main | ~61 ships |
| WW2 | 332 ships |
| Cold War | 225 ships |
| Carrier | 30 ships |
| Submarine | 71 ships |
| Coast Guard | 33 ships |

**Key Files:**
- `scripts/game-generator/src/index.ts` - Generator with `--all` and `--mode=xxx` flags
- `src/types/modes.ts` - Frontend mode config with data file paths
- `src/App.tsx` - Mode state, data fetching, completion tracking
- `src/components/ModeMenu/ModeMenu.tsx` - Hamburger menu with unlock logic
- `src/hooks/useModeCompletion.ts` - localStorage tracking
</context>

<tasks>

## Task 1: Generate game data for all bonus modes

**Objective:** Run the game generator for all 6 modes to create game data files.

**Steps:**
1. Navigate to game-generator directory
2. Run `npm run generate -- --all` to generate all modes
3. Verify all 6 files exist in `/public`:
   - `game-data-main.json`
   - `game-data-ww2.json`
   - `game-data-coldwar.json`
   - `game-data-carrier.json`
   - `game-data-submarine.json`
   - `game-data-coastguard.json`
4. Check each file has valid structure (date, ship, silhouette, clues)

**Verification:**
- [ ] All 6 game data files exist
- [ ] Each file has valid JSON structure
- [ ] No generation errors

---

## Task 2: Run test suite and typecheck

**Objective:** Verify all existing tests pass and no type errors.

**Steps:**
1. Run `npm test` from project root
2. Run `npm run typecheck`
3. Run `npm run build` to verify production build

**Verification:**
- [ ] All 58+ tests pass
- [ ] No TypeScript errors
- [ ] Vite build succeeds

---

## Task 3: Manual end-to-end testing

**Objective:** Verify each mode works through complete gameplay.

**Steps:**
1. Start dev server with `npm run dev`
2. Test main mode:
   - Verify game loads with correct ship
   - Make guesses, verify clue reveals
   - Complete game (win or lose)
   - Verify completion saved to localStorage
3. Test mode unlock sequence:
   - After completing main, verify WW2 unlocks
   - After completing WW2, verify Cold War unlocks
   - Continue through unlock chain
4. Test each bonus mode:
   - Verify different ship appears for each mode
   - Verify era/type filters are working (ships match mode theme)
   - Verify completion tracking per mode

**Verification:**
- [ ] Main mode plays through correctly
- [ ] Sequential unlocking works
- [ ] Each bonus mode loads its own ship
- [ ] Completion tracking works across modes

---

## Task 4: Polish mode menu transitions

**Objective:** Review and improve mode menu UX if needed.

**Steps:**
1. Test hamburger menu open/close animations
2. Verify backdrop click closes menu
3. Verify Escape key closes menu
4. Check lock/unlock visual states
5. Check completed mode checkmark display
6. Verify current mode highlight

**Verification:**
- [ ] Menu opens/closes smoothly
- [ ] Visual states are clear (locked, unlocked, completed, current)
- [ ] Keyboard accessibility works

---

## Task 5: Update STATE.md and ROADMAP.md

**Objective:** Mark Phase 8 and v2.0 milestone as complete.

**Steps:**
1. Update `.planning/STATE.md`:
   - Mark Phase 8 as complete
   - Note v2.0 milestone completion
2. Update `.planning/ROADMAP.md`:
   - Add checkmarks to Phase 8 tasks
   - Add completion note

**Verification:**
- [ ] STATE.md reflects completion
- [ ] ROADMAP.md shows v2.0 complete

</tasks>

<verification>
**Overall Phase Success:**
- [ ] All 6 game data files generated
- [ ] All tests pass
- [ ] All modes playable end-to-end
- [ ] Sequential unlocking works correctly
- [ ] Mode menu UX is polished
- [ ] Documentation updated
</verification>

<output>
**Phase Complete When:**
1. Running `npm run generate -- --all` creates all 6 mode data files
2. `npm test && npm run typecheck && npm run build` all succeed
3. Manual testing confirms all modes work with correct ship filtering
4. Mode menu transitions and states are polished
5. STATE.md and ROADMAP.md mark v2.0 as complete

**Commit Pattern:** `{type}(8): {description}`
</output>
