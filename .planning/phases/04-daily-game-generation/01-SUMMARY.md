# Phase 4, Plan 1: Summary

## Status: Complete

## Objective

Build the `generate-game` command that picks a random eligible ship from Wikidata, fetches all clue data, generates line art, and outputs a complete game JSON ready for the UI.

## Results

### Success Criteria - All Met

- [x] `npm run generate` in game-generator produces `public/game-data.json`
- [x] Game data contains: ship info, base64 silhouette, all 4 clue types
- [x] Ships filtered to post-1950 with images
- [x] Used ships tracked and excluded from selection
- [x] Ship list generated for autocomplete

### Test Run Output

First successful generation: **HMS Achilles (Q4353101)**
- Country: Chile
- Class: Leander-class frigate
- Commissioned: 1970
- Trivia: "She was sold to Chile in 1991 and served in the Chilean Navy as Ministro Zenteno."
- Line art: 5KB base64 PNG (800x411)
- Generation time: ~3 seconds

### Files Created

```
scripts/game-generator/
├── package.json           # Project setup with dependencies
├── tsconfig.json          # TypeScript configuration
├── src/
│   ├── index.ts           # Main generate command
│   ├── types.ts           # GameData interfaces
│   ├── select-ship.ts     # Random ship selector
│   ├── fetch-clues.ts     # Clue data fetcher + Wikipedia trivia
│   ├── generate-lineart.ts # Line art from URL
│   ├── used-ships.ts      # Usage tracker
│   └── generate-ship-list.ts # Autocomplete list generator
└── data/
    └── used-ships.json    # Tracked ships

public/
├── game-data.json         # Today's game data
└── ship-list.json         # All searchable ships (if generated)
```

## Tasks Completed

| # | Task | Commits |
|---|------|---------|
| 1 | Create game generation script structure | `feat(04-1)` |
| 2 | Define game data types | `feat(04-1)` |
| 3 | Build random ship selector | `feat(04-1)` |
| 4 | Build clue data fetcher | `feat(04-1)` |
| 5 | Integrate line art generation | `feat(04-1)` |
| 6 | Build used ships tracker | `feat(04-1)` |
| 7 | Build main generate command | `feat(04-1)` |
| 8 | Add ship list for autocomplete | `feat(04-1)` |
| 9 | Test end-to-end generation | verified |

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| VALUES clause for ship types | SPARQL subclass traversal too slow; explicit type IDs (destroyer, battleship, carrier, cruiser, frigate, corvette, submarine) much faster |
| Uint8Array for Blob conversion | TypeScript's Buffer type not assignable to BlobPart; explicit conversion required |
| Wikipedia REST API for trivia | Simple extract endpoint, filters for "interesting" sentences with keywords |
| JSON-based used ships tracking | Simple, human-readable, sufficient for daily generation |

## Problems Solved

### 1. SPARQL Subclass Traversal Returns 0 Results

**Problem**: Original query `?ship wdt:P31/wdt:P279* wd:Q3114762` returned 0 results.

**Solution**: Use VALUES clause with specific ship type Wikidata IDs:
```sparql
VALUES ?type { wd:Q174736 wd:Q182531 wd:Q17205 wd:Q104843 wd:Q161705 wd:Q170013 wd:Q2811 }
?ship wdt:P31 ?type .
```

**Result**: 247 eligible ships found.

### 2. TypeScript Buffer/Blob Type Error

**Problem**: `Type 'Buffer<ArrayBufferLike>' is not assignable to type 'BlobPart'`

**Solution**: Convert Buffer to Uint8Array before creating Blob:
```typescript
const uint8Array = new Uint8Array(preprocessed);
const blob = new Blob([uint8Array], { type: 'image/png' });
```

## Sample Output

```json
{
  "date": "2026-01-18",
  "ship": {
    "id": "Q4353101",
    "name": "HMS Achilles",
    "aliases": ["Leander-class frigate"]
  },
  "silhouette": "data:image/png;base64,iVBORw0KGgo...",
  "clues": {
    "specs": {
      "class": "Leander-class frigate",
      "displacement": null,
      "length": null,
      "commissioned": "1970"
    },
    "context": {
      "nation": "Chile",
      "conflicts": [],
      "status": null
    },
    "trivia": "She was sold to Chile in 1991 and served in the Chilean Navy as Ministro Zenteno.",
    "photo": "https://commons.wikimedia.org/wiki/Special:FilePath/HMS_Achilles_(F12)_at_Chatham_on_3_May_1981.jpg"
  }
}
```

## Usage

```bash
cd scripts/game-generator
npm install
npm run generate           # Generate today's game
npm run generate:ship-list # Generate autocomplete list
```

## Next Steps

Phase 4 is now complete. Ready for **Phase 5: Game UI Components** which will:
- Display the silhouette
- Build ship search/autocomplete
- Create clue reveal components
- Add turn indicator and guess history

---
*Completed: 2026-01-18*
