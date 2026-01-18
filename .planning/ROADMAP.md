# Keel Roadmap

## Milestone 1: MVP

### Phase 1: Line Art Generation POC ✅
**Goal**: Prove automated line art generation works at quality needed for gameplay

**Why first**: This is the core differentiator. If we can't generate recognizable ship illustrations automatically, the game concept doesn't work. Must validate before building anything else.

**Research**: Yes - evaluate programmatic image processing approaches (edge detection, background removal)

**Approach**: Purely programmatic - no AI image generation APIs. Must work offline with deterministic results.

**Deliverables**:
- ✅ Working line art generation script (OpenCV.js bilateral + adaptive threshold)
- ✅ Background removal (@imgly) + line art pipeline
- ✅ Test results on 31 ship images (100% success rate)
- ✅ Documented algorithm and quality metrics

**Plans**: 2/2 complete (silhouettes + line art)

---

### Phase 2: Data Source Evaluation ✅
**Goal**: Determine best data source(s) for ship data

**Why here**: Need to know what data we're working with before building UI. Data availability shapes what clues we can show.

**Research**: Yes - evaluate Wikidata, Navypedia, NavBase, NVR for coverage, API quality, image availability

**Deliverables**:
- ✅ Evaluation report on each source (RESEARCH.md)
- ✅ Data fetching scripts for chosen source (scripts/data-pipeline/)
- ✅ Sample dataset (99 ships) with images, types, classes

**Plans**: 1/1 complete (Wikidata pipeline)

**Key findings**:
- Wikidata: 70K+ ships, free SPARQL API, best option
- Commons: All images freely licensed
- Country coverage low (12.1%) - need operator fallback

---

### Phase 3: Project Setup ✅
**Goal**: Vite + React + TypeScript scaffolding with development tooling

**Why here**: Foundation for all UI work. Quick phase - standard scaffolding.

**Research**: No

**Deliverables**:
- ✅ Vite project with React 19 + TypeScript 5.9
- ✅ ESLint (flat config), Prettier, Vitest testing
- ✅ GitHub Actions CI workflow
- ✅ Vercel deployment configuration

**Plans**: 1/1 complete

---

### Phase 4: Daily Game Generation
**Goal**: Build the generation command that produces a complete game for one ship

**Why here**: Need game data before building UI that displays it.

**Research**: No

**Architecture**:
1. Query Wikidata for random eligible ship (>1950, has image, not previously used)
2. Fetch full data: specs (class, displacement, length, commissioned), context (nation, conflicts, status), trivia
3. Download image → generate line art
4. Output game JSON with all clues + assets
5. Track used ships to avoid duplicates

**Deliverables**:
- `generate-game` command that outputs today's game data
- Game data types (Ship, GameData, Clues)
- Used ships tracking (JSON file)
- Line art integration from Phase 1 scripts

**Output format**:
```json
{
  "ship": { "id": "Q12345", "name": "USS Enterprise" },
  "silhouette": "base64 or path",
  "clues": {
    "specs": { "class": "...", "displacement": "...", ... },
    "context": { "nation": "...", "conflicts": [...], ... },
    "trivia": "Famous for...",
    "photo": "url or path"
  }
}
```

---

### Phase 5: Game UI Components
**Goal**: Build core UI components for the 5-turn game experience

**Why here**: Now we have game data - can build the visual layer.

**Research**: No

**Deliverables**:
- Silhouette display component (Turn 1)
- Ship search/autocomplete with fuzzy matching
- Clue reveal components:
  - Specs card (Turn 2)
  - Context card (Turn 3)
  - Trivia card (Turn 4)
  - Photo reveal (Turn 5)
- Turn indicator and guess history

---

### Phase 6: Game Logic
**Goal**: Implement 5-turn game loop with win/loss states

**Why here**: UI components exist - wire them together with game state.

**Research**: No

**Deliverables**:
- Game state management (current turn, guesses, win/loss)
- Turn progression logic
- Correct/incorrect guess handling
- Win/loss detection
- Load game data from generated JSON

---

### Phase 7: Polish & Share
**Goal**: Complete game experience with share functionality and mobile responsiveness

**Why here**: Core game works - add the Wordle-like viral mechanics.

**Research**: No

**Deliverables**:
- Share card generation (emoji grid like Wordle)
- Results summary screen ("Success in X turns")
- Mobile-responsive layout
- Wikipedia link on loss
- Local storage for daily progress

---

## Phase Summary

| # | Phase | Goal | Research | Status |
|---|-------|------|----------|--------|
| 1 | Line Art Generation POC | Prove automated line art works | Yes | Complete (2 plans) |
| 2 | Data Source Evaluation | Choose best data sources | Yes | Complete (1 plan) |
| 3 | Project Setup | Vite/React/TS scaffolding | No | Complete (1 plan) |
| 4 | Daily Game Generation | Generate one ship's game data | No | Not Started |
| 5 | Game UI Components | Build visual components | No | Not Started |
| 6 | Game Logic | Implement 5-turn game loop | No | Not Started |
| 7 | Polish & Share | Mobile, share, finishing touches | No | Not Started |

---

## MVP Success Criteria

By the end of Milestone 1:
- Run `generate-game` → produces complete game data for one ship
- Load game in browser → see silhouette, make guesses
- Play full 5-turn loop with clue reveals
- Win/loss states work
- Share results

---
*Last updated: 2026-01-18 after architecture clarification*
