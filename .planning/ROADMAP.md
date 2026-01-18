# Keel Roadmap

## Milestone 1: MVP

### Phase 1: Silhouette Generation POC
**Goal**: Prove automated silhouette generation works at quality needed for gameplay

**Why first**: This is the core differentiator. If we can't generate recognizable silhouettes automatically, the game concept doesn't work. Must validate before building anything else.

**Research**: Yes - evaluate image processing approaches, test with varied ship photos

**Deliverables**:
- Working silhouette generation script
- Test results on 20+ varied ship images
- Documented algorithm and quality metrics

---

### Phase 2: Data Source Evaluation
**Goal**: Determine best data source(s) for 1000+ ship database

**Why here**: Need to know what data we're working with before building UI. Data availability shapes what clues we can show.

**Research**: Yes - evaluate Wikidata, Navypedia, NavBase, NVR for coverage, API quality, image availability

**Deliverables**:
- Evaluation report on each source
- Data fetching scripts for chosen source(s)
- Sample dataset (50-100 ships) with all required fields

---

### Phase 3: Project Setup
**Goal**: Vite + React + TypeScript scaffolding with development tooling

**Why here**: Foundation for all UI work. Quick phase - standard scaffolding.

**Research**: No

**Deliverables**:
- Vite project with React + TypeScript
- ESLint, Prettier, basic testing setup
- CI/CD pipeline for Vercel deployment

---

### Phase 4: Ship Data Pipeline
**Goal**: Build and populate ship database from chosen sources

**Why here**: Need data before building game UI that displays it.

**Research**: No

**Deliverables**:
- Ship data types/interfaces
- Data fetching and processing scripts
- JSON database with 1000+ ships
- Pre-generated silhouettes for all ships

---

### Phase 5: Game UI Components
**Goal**: Build core UI components for the game experience

**Why here**: Now we have data and silhouettes - can build the visual layer.

**Research**: No

**Deliverables**:
- Silhouette display component
- Ship search/autocomplete with fuzzy matching
- Clue reveal components (specs, context, trivia, photo)
- Turn indicator and progress display

---

### Phase 6: Game Logic
**Goal**: Implement 5-turn game loop with win/loss states

**Why here**: UI components exist - wire them together with game state.

**Research**: No

**Deliverables**:
- Game state management
- Turn progression logic
- Correct/incorrect guess handling
- Daily ship selection (deterministic algorithm)
- Win/loss detection

---

### Phase 7: Polish & Share
**Goal**: Complete game experience with share functionality and mobile responsiveness

**Why here**: Core game works - add the Wordle-like viral mechanics.

**Research**: No

**Deliverables**:
- Share card generation (emoji grid like Wordle)
- Results summary screen
- Mobile-responsive layout
- Wikipedia link on loss
- Local storage for daily progress

---

## Phase Summary

| # | Phase | Goal | Research | Status |
|---|-------|------|----------|--------|
| 1 | Silhouette Generation POC | Prove automated silhouettes work | Yes | Complete |
| 2 | Data Source Evaluation | Choose best data sources | Yes | Not Started |
| 3 | Project Setup | Vite/React/TS scaffolding | No | Not Started |
| 4 | Ship Data Pipeline | Build 1000+ ship database | No | Not Started |
| 5 | Game UI Components | Build visual components | No | Not Started |
| 6 | Game Logic | Implement game loop | No | Not Started |
| 7 | Polish & Share | Mobile, share, finishing touches | No | Not Started |

---
*Last updated: 2026-01-18 after Phase 1 completion*
