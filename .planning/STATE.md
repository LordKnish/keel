# Project State

## Current Position

**Milestone**: 1 (MVP)
**Phase**: 4 (Daily Game Generation)
**Status**: Complete

## Progress

### Milestone 1: MVP

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Line Art Generation POC | Complete | 2/2 |
| 2 | Data Source Evaluation | Complete | 1/1 |
| 3 | Project Setup | Complete | 1/1 |
| 4 | Daily Game Generation | Complete | 1/1 |
| 5 | Game UI Components | Not Started | 0/0 |
| 6 | Game Logic | Not Started | 0/0 |
| 7 | Polish & Share | Not Started | 0/0 |

## Recent Activity

- 2026-01-18: Project initialized
- 2026-01-18: Roadmap created with 7 phases
- 2026-01-18: Phase 1 research completed (RESEARCH.md)
- 2026-01-18: Phase 1 plan 1 created (01-PLAN.md)
- 2026-01-18: Phase 1 plan 1 executed - 100% silhouette success rate
- 2026-01-18: Pivot to line art for better detail preservation
- 2026-01-18: Line art research completed (LINE-ART-RESEARCH.md)
- 2026-01-18: Phase 1 plan 2 created (02-PLAN.md) - programmatic line art
- 2026-01-18: Phase 1 plan 2 executed - 100% line art success rate
- 2026-01-18: Phase 2 research completed (RESEARCH.md)
- 2026-01-18: Phase 2 plan 1 created (01-PLAN.md) - Wikidata pipeline
- 2026-01-18: Phase 2 plan 1 executed - 99 ships, 100% image download success
- 2026-01-18: Phase 3 plan 1 created (01-PLAN.md) - Vite + React + TypeScript setup
- 2026-01-18: Phase 3 plan 1 executed - full build pipeline working
- 2026-01-18: Phase 4 plan 1 created (01-PLAN.md) - daily game generation
- 2026-01-18: Phase 4 plan 1 executed - full generate command working (HMS Achilles)

## Blockers

None

## Key Decisions

| Decision | Phase | Rationale |
|----------|-------|-----------|
| Use @imgly/background-removal-node | 1 | 100% success rate, no Python dependency needed |
| RGBA PNG preprocessing | 1 | Required by @imgly for proper segmentation |
| Skip rembg evaluation | 1 | @imgly exceeded requirements |
| Use OpenCV.js for line art | 1 | Bilateral filter + adaptive threshold not in Sharp |
| Use line art over silhouettes | 1 | Better detail preservation, more distinguishing features |
| Default parameters work | 1 | 100% success without tuning proves robustness |
| Use Wikidata + Commons | 2 | Free SPARQL API, 70K+ ships, direct image links, no scraping |
| Use tsx over ts-node | 2 | Better ESM module resolution |
| Browser-like User-Agent | 2 | Wikimedia requires it for downloads |
| Vite + React + TypeScript | 3 | Fast build, modern stack, Vercel-compatible |
| Vitest over Jest | 3 | Native Vite integration, faster |
| ESLint flat config | 3 | Modern config format, simpler setup |
| Ships must be newer than 1950 | 4 | User requirement for modern vessels |

## Notes

**Phase 4 Complete!**

Daily game generation command fully working:
- All 9 tasks completed with per-task commits
- Generates random ship from Wikidata (>1950, has image)
- Fetches clue data (specs, context, Wikipedia trivia)
- Downloads image and generates line art
- Outputs `public/game-data.json`
- Tracks used ships to avoid duplicates

**Test run**: HMS Achilles (Q4353101) - Leander-class frigate, Chile

**Generate commands:**
```bash
cd scripts/game-generator
npm run generate           # Generate today's game
npm run generate:ship-list # Generate autocomplete list
```

**Next: Phase 5 - Game UI Components**

Build React components to display the game:
- Silhouette display (Turn 1)
- Ship search/autocomplete
- Clue reveal components (Turns 2-5)
- Turn indicator and guess history

---
*Last updated: 2026-01-18*
