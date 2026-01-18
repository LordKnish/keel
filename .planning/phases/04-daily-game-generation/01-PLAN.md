# Phase 4, Plan 1: Daily Game Generation Command

## Objective

Build the `generate-game` command that picks a random eligible ship from Wikidata, fetches all clue data, generates line art, and outputs a complete game JSON ready for the UI.

## Context

### What We Have (from prior phases)
- **Line art generation** (`scripts/silhouette-poc/src/lineart.ts`): `generateLineArt()` function that works with 100% success rate
- **Wikidata SPARQL** (`scripts/data-pipeline/src/sparql.ts`): Query builders, endpoint, `commonsFileToUrl()`
- **Ship types** (`scripts/data-pipeline/src/types.ts`): `Ship` interface with quality flags
- **Image downloading**: Browser-like User-Agent pattern validated

### Architecture
1. Query Wikidata for random eligible ship (>1950, has image, not in used list)
2. Fetch full data: specs, context, trivia
3. Download image → generate line art
4. Output game JSON to `public/game-data.json`
5. Add ship to used list

### Key Constraints
- Ships must be commissioned after 1950
- Must have an image on Commons
- Must not be in `used-ships.json`
- Country fallback: use P137 (operator) when P17 (country) missing

## Tasks

### Task 1: Create Game Generation Script Structure
**Action**: Set up `scripts/game-generator/` with package.json, tsconfig.json, and main entry point

**Files**:
- `scripts/game-generator/package.json`
- `scripts/game-generator/tsconfig.json`
- `scripts/game-generator/src/index.ts` (main entry)

**Dependencies**: Copy from data-pipeline + add line art deps (@imgly, @techstark/opencv-js, sharp)

**Verification**: `npm run generate` runs without errors (even if empty output)

---

### Task 2: Define Game Data Types
**Action**: Create TypeScript interfaces for game output

**Types**:
```typescript
interface GameData {
  date: string;  // ISO date (2026-01-18)
  ship: {
    id: string;      // Wikidata ID
    name: string;    // Display name for win condition
    aliases: string[]; // Alternative names for fuzzy match
  };
  silhouette: string;  // Base64 PNG or path
  clues: {
    specs: SpecsClue;     // Turn 2
    context: ContextClue; // Turn 3
    trivia: string;       // Turn 4
    photo: string;        // Turn 5 - URL or base64
  };
}

interface SpecsClue {
  class: string | null;
  displacement: string | null;
  length: string | null;
  commissioned: string | null;
}

interface ContextClue {
  nation: string;
  conflicts: string[];
  status: string | null;
}
```

**File**: `scripts/game-generator/src/types.ts`

**Verification**: Types compile without error

---

### Task 3: Build Random Ship Selector
**Action**: Create SPARQL query that finds a random eligible ship

**Query requirements**:
- Commissioned date > 1950 (P729)
- Has image (P18)
- Has English label (not Q-number)
- NOT in used-ships.json list
- Include operator fallback for country

**Approach**:
1. Query for eligible ships count
2. Pick random offset
3. Fetch that ship with full data

**File**: `scripts/game-generator/src/select-ship.ts`

**Verification**: Returns a random ship with required fields populated

---

### Task 4: Build Clue Data Fetcher
**Action**: Fetch complete clue data for selected ship

**Data needed**:
- Specs: class, displacement, length, commissioned date
- Context: nation (P17 or P137→country), conflicts (P607), status
- Trivia: Wikipedia extract or notable fact
- Photo: Commons image URL

**Wikipedia API** for trivia:
```
https://en.wikipedia.org/api/rest_v1/page/summary/{title}
```

**File**: `scripts/game-generator/src/fetch-clues.ts`

**Verification**: Returns populated clue object for a test ship

---

### Task 5: Integrate Line Art Generation
**Action**: Copy line art module from silhouette-poc and adapt for game generator

**Steps**:
1. Copy `lineart.ts` to game-generator
2. Add function to generate line art from URL (download first)
3. Return base64-encoded PNG

**File**: `scripts/game-generator/src/generate-lineart.ts`

**Verification**: Generates line art from a Wikidata ship image URL

---

### Task 6: Build Used Ships Tracker
**Action**: Create simple JSON-based tracking of previously used ships

**File structure** (`data/used-ships.json`):
```json
{
  "ships": [
    { "id": "Q12345", "name": "USS Enterprise", "usedDate": "2026-01-18" }
  ]
}
```

**Functions**:
- `isShipUsed(id: string): boolean`
- `markShipUsed(id: string, name: string): void`
- `getUsedShipIds(): string[]`

**File**: `scripts/game-generator/src/used-ships.ts`

**Verification**: Can add/check ships in tracker

---

### Task 7: Build Main Generate Command
**Action**: Wire everything together in main entry point

**Flow**:
1. Load used ships list
2. Select random eligible ship (not in used list)
3. Fetch full clue data
4. Download image and generate line art
5. Build GameData object
6. Write to `public/game-data.json`
7. Mark ship as used
8. Log success with ship name

**File**: `scripts/game-generator/src/index.ts`

**npm script**: `"generate": "tsx src/index.ts"`

**Verification**: Running `npm run generate` produces valid `public/game-data.json`

---

### Task 8: Add Ship List for Autocomplete
**Action**: Generate a list of all searchable ship names for the UI

**Output** (`public/ship-list.json`):
```json
{
  "ships": [
    { "name": "USS Enterprise", "aliases": ["CV-6", "Big E"] },
    ...
  ]
}
```

**Note**: This can be a separate script or generated alongside game data. For MVP, can use a static subset.

**Approach**: Query Wikidata for all ships >1950 with images, extract names

**File**: `scripts/game-generator/src/generate-ship-list.ts`

**Verification**: Produces JSON with 100+ ship names

---

### Task 9: Test End-to-End Generation
**Action**: Run full generation and validate output

**Checks**:
- `public/game-data.json` exists and is valid JSON
- Contains all required fields (ship, silhouette, clues)
- Silhouette is valid base64 PNG
- Clues have reasonable data (not all null)
- Ship is added to used-ships.json

**Verification**: Manual inspection + JSON schema validation

---

## Success Criteria

- [ ] `npm run generate` in game-generator produces `public/game-data.json`
- [ ] Game data contains: ship info, base64 silhouette, all 4 clue types
- [ ] Ships filtered to post-1950 with images
- [ ] Used ships tracked and excluded from selection
- [ ] Ship list generated for autocomplete

## Output

```
scripts/game-generator/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # Main generate command
│   ├── types.ts           # GameData interfaces
│   ├── select-ship.ts     # Random ship selector
│   ├── fetch-clues.ts     # Clue data fetcher
│   ├── generate-lineart.ts # Line art from URL
│   ├── used-ships.ts      # Usage tracker
│   └── generate-ship-list.ts # Autocomplete list
└── data/
    └── used-ships.json    # Tracked ships

public/
├── game-data.json         # Today's game
└── ship-list.json         # All searchable ships
```

## Dependencies

From existing scripts:
- `@imgly/background-removal-node`
- `@techstark/opencv-js`
- `sharp`
- `tsx`

## Estimated Tasks: 9

---
*Created: 2026-01-18*
