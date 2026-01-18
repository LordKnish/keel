# Keel - Warship Guessing Game

A daily challenge game for naval history enthusiasts, similar to Wordle but focused on identifying warships.

## Project Structure

- `.planning/` - Project planning documents (PROJECT.md, roadmap, plans)
- `src/` - Source code (Vite + React + TypeScript)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Key Decisions

- Silhouette quality is the core differentiator - must be fully automated
- Data sourced from Wikidata/Navypedia/NVR (evaluate during POC)
- Free hosting on Vercel, eventual serverless functions for daily generation
- 1000+ ships target for comprehensive database

## Architecture Notes

- Static site for POC phase
- Daily ship selection via deterministic algorithm (date-based)
- Client-side game logic, pre-generated silhouettes
