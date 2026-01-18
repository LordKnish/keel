# Keel - Daily Warship Guessing Game

## Vision

A daily challenge game for naval history enthusiasts. Like Wordle or Framed, but focused entirely on identifying historical and modern warships. Every 24 hours, players worldwide compete to identify the same ship in as few guesses as possible.

## Problem

Naval history enthusiasts lack a dedicated, engaging daily game that tests their ship recognition skills. Existing trivia formats don't leverage the visual distinctiveness of warships or create the "one shot per day" ritual that makes Wordle compelling.

## Solution

A 5-turn progressive reveal game:

1. **Turn 1 - Silhouette**: Blacked-out outline only - tests hull profile recognition
2. **Turn 2 - Specs**: Class, displacement, length, commission date
3. **Turn 3 - Context**: Nation, conflicts, current status
4. **Turn 4 - Trivia**: Distinctive fact or historical lore
5. **Turn 5 - Photo**: Original image (possibly pixelated/obscured)

Player guesses via fuzzy-matched search bar. Correct guess at any turn wins. After 5 wrong guesses, the ship is revealed with Wikipedia link.

## Requirements

### Validated

(None yet - ship to validate)

### Active

- [ ] Generate clean silhouettes from ship photos (fully automated, no manual cleanup)
- [ ] Fetch ship data from best available source (Wikidata, Navypedia, NVR - evaluate during POC)
- [ ] Build 1000+ ship database with photos, specs, history, trivia
- [ ] 5-turn progressive reveal game loop
- [ ] Fuzzy search for ship guessing
- [ ] Daily ship rotation (deterministic, same ship worldwide)
- [ ] Win/loss summary screen with share functionality
- [ ] Mobile-responsive web UI

### Out of Scope (v1)

- User accounts and leaderboards - keep anonymous, frictionless
- Native mobile apps - web-only for now
- Multiplayer/competitive modes - focus on single-player daily ritual
- Backend infrastructure - static site for POC, Vercel functions later
- Manual silhouette curation - must be fully automated

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Silhouette = clean outline only | Simpler to generate reliably, still recognizable by profile | Pending |
| Fully automated silhouette generation | 1000+ ships requires automation, no manual cleanup budget | Pending |
| Evaluate multiple data sources | No single source may have complete coverage; research-driven choice | Pending |
| Vite + React + TypeScript | Modern, fast, type-safe, good Vercel support | Pending |
| Static site for POC | Validate silhouette algorithm before adding infrastructure | Pending |
| Free hosting (Vercel) | No budget for hosting; eventual serverless functions for daily generation | Pending |

## Technical Context

**Stack**: Vite + React + TypeScript

**Data Sources to Evaluate**:
- Wikidata (structured, good API)
- Navypedia (naval-specific, may have better coverage)
- NavBase
- NVR (Naval Vessel Register - US Navy official)

**Silhouette Generation** (to research):
- Canvas/browser-based edge detection
- Node.js image processing (Sharp, Jimp)
- Background removal APIs
- Custom algorithm TBD during POC

**Deployment**: Vercel free tier
- Static hosting for POC
- Serverless functions for daily generation later

## Phases

POC approach:
1. **Silhouette Generation POC** - Prove the core mechanic works
2. **Vite/React Setup** - Project scaffolding
3. **Game Page UI** - Layout and components
4. **Game Loop** - Turn progression and win/loss logic
5. **Data Integration** - Connect to ship database
6. **Polish** - Share functionality, responsive design

## Success Criteria

- Silhouettes are recognizable by hull profile (automated generation)
- Game loop feels like Wordle (addictive daily ritual)
- 1000+ ships in database with accurate data
- Works on mobile browsers
- Shareable results

---
*Last updated: 2026-01-18 after initialization*
