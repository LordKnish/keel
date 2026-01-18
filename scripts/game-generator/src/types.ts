/**
 * Game data types for Keel daily game generation.
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
 * Complete game data output for a single day.
 * This is written to public/game-data.json
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
 * Entry in the used ships tracking file.
 */
export interface UsedShipEntry {
  /** Wikidata entity ID */
  id: string;
  /** Ship name (for human readability) */
  name: string;
  /** Date when this ship was used */
  usedDate: string;
}

/**
 * Used ships tracking file structure.
 */
export interface UsedShipsData {
  /** List of ships already featured */
  ships: UsedShipEntry[];
}

/**
 * Ship entry for autocomplete list.
 */
export interface ShipListEntry {
  /** Primary name */
  name: string;
  /** Wikidata ID */
  id: string;
}

/**
 * Ship list for autocomplete (public/ship-list.json).
 * @deprecated Use ClassListData instead - game now uses class-based guessing
 */
export interface ShipListData {
  /** Generated timestamp */
  generatedAt: string;
  /** Total ship count */
  count: number;
  /** All searchable ships */
  ships: ShipListEntry[];
}

/**
 * Class entry for autocomplete list.
 */
export interface ClassListEntry {
  /** Synthetic ID based on normalized class name */
  id: string;
  /** Display name (e.g., "Fletcher-class destroyer") */
  name: string;
}

/**
 * Class list for autocomplete (public/ship-list.json).
 */
export interface ClassListData {
  /** Generated timestamp */
  generatedAt: string;
  /** Total class count */
  count: number;
  /** All searchable classes */
  classes: ClassListEntry[];
}

/**
 * Raw ship data from Wikidata query.
 */
export interface WikidataShipResult {
  ship: { value: string };
  shipLabel: { value: string };
  image?: { value: string };
  class?: { value: string };
  classLabel?: { value: string };
  country?: { value: string };
  countryLabel?: { value: string };
  operator?: { value: string };
  operatorLabel?: { value: string };
  operatorCountry?: { value: string };
  operatorCountryLabel?: { value: string };
  length?: { value: string };
  displacement?: { value: string };
  commissioned?: { value: string };
  decommissioned?: { value: string };
  status?: { value: string };
  statusLabel?: { value: string };
  conflict?: { value: string };
  conflictLabel?: { value: string };
  article?: { value: string };
}
