/**
 * Game data types for Keel daily game UI.
 * Mirrors types from scripts/game-generator/src/types.ts for frontend use.
 */

/**
 * Specs clue shown on Turn 2.
 * Example: "Class: Fletcher | Displacement: 2,050 tons | Length: 114m | Commissioned: 1943"
 */
export interface SpecsClue {
  /** Ship class name (e.g., "Fletcher-class") */
  class: string | null;
  /** Displacement in tons (e.g., "2,050 tons") */
  displacement: string | null;
  /** Length in meters (e.g., "114m") */
  length: string | null;
  /** Commission year or date (e.g., "1943") */
  commissioned: string | null;
}

/**
 * Context clue shown on Turn 3.
 * Example: "Nation: USA | Conflicts: WWII, Korean War | Status: Museum Ship"
 */
export interface ContextClue {
  /** Operating nation (e.g., "United States") */
  nation: string;
  /** List of conflicts the ship participated in */
  conflicts: string[];
  /** Current status (e.g., "Museum Ship", "Scrapped", "Active") */
  status: string | null;
}

/**
 * Complete clue set for all turns.
 */
export interface GameClues {
  /** Turn 2: Ship specifications */
  specs: SpecsClue;
  /** Turn 3: Historical context */
  context: ContextClue;
  /** Turn 4: Distinctive fact or trivia */
  trivia: string | null;
  /** Turn 5: Original photo URL */
  photo: string;
}

/**
 * Ship identity information for the game.
 */
export interface ShipIdentity {
  /** Wikidata entity ID (e.g., "Q12345") */
  id: string;
  /** Primary display name (e.g., "USS Enterprise") */
  name: string;
  /** Ship class name for matching (e.g., "Fletcher-class destroyer") */
  className: string | null;
  /** Alternative names/designations for fuzzy matching */
  aliases: string[];
}

/**
 * Class entry for search/autocomplete.
 */
export interface ClassListEntry {
  /** Synthetic ID based on normalized class name */
  id: string;
  /** Display name (e.g., "Fletcher-class destroyer") */
  name: string;
}

/**
 * Complete game data output for a single day.
 * This is loaded from public/game-data.json
 */
export interface GameData {
  /** Date this game is for (ISO date: "2026-01-18") */
  date: string;
  /** Ship identity (hidden until win/loss) */
  ship: ShipIdentity;
  /** Base64-encoded line art PNG */
  silhouette: string;
  /** All clues for turns 2-5 */
  clues: GameClues;
}

/**
 * Result of a single guess.
 */
export type GuessResult = 'correct' | 'wrong';

/**
 * Current game state for UI rendering.
 */
export interface GameState {
  /** Current turn number (1-5) */
  currentTurn: number;
  /** Total turns allowed */
  totalTurns: number;
  /** Results of previous guesses */
  guessResults: GuessResult[];
  /** Whether game is complete */
  isComplete: boolean;
  /** Whether player won */
  isWin: boolean;
}
