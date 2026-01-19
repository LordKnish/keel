/**
 * Game mode configuration for multi-mode support.
 * Defines filters for each game mode (year range, ship types).
 */

export type GameModeId = 'main' | 'ww2' | 'coldwar' | 'carrier' | 'submarine' | 'coastguard';

export interface ModeConfig {
  id: GameModeId;
  name: string;
  description: string;
  yearMin: number | null;  // null = no minimum
  yearMax: number | null;  // null = no maximum
  shipTypes: string[];     // Wikidata Q-IDs
}

/**
 * All game modes with their configuration.
 */
export const GAME_MODES: Record<GameModeId, ModeConfig> = {
  main: {
    id: 'main',
    name: 'Daily Keel',
    description: 'Modern warships (1980+)',
    yearMin: 1980,
    yearMax: null,
    shipTypes: ['Q174736', 'Q182531', 'Q17205', 'Q104843', 'Q161705', 'Q170013', 'Q2811', 'Q2607934'],
  },
  ww2: {
    id: 'ww2',
    name: 'WW2',
    description: 'World War 2 ships (1939-1945)',
    yearMin: 1939,
    yearMax: 1945,
    shipTypes: ['Q174736', 'Q182531', 'Q17205', 'Q104843', 'Q161705', 'Q170013', 'Q2811'],
  },
  coldwar: {
    id: 'coldwar',
    name: 'Cold War',
    description: 'Cold War era ships (1947-1991)',
    yearMin: 1947,
    yearMax: 1991,
    shipTypes: ['Q174736', 'Q182531', 'Q17205', 'Q104843', 'Q161705', 'Q170013', 'Q2811'],
  },
  carrier: {
    id: 'carrier',
    name: 'Aircraft Carrier',
    description: 'Aircraft carriers only',
    yearMin: null,
    yearMax: null,
    shipTypes: ['Q17205'],
  },
  submarine: {
    id: 'submarine',
    name: 'Submarine',
    description: 'Submarines only',
    yearMin: null,
    yearMax: null,
    // Q4818021=attack submarine, Q2811=submarine, Q683570=ballistic missile submarine,
    // Q17005311=coastal submarine, Q757587=nuclear attack sub, Q757554=nuclear submarine
    shipTypes: ['Q4818021', 'Q2811', 'Q683570', 'Q17005311', 'Q757587', 'Q757554'],
  },
  coastguard: {
    id: 'coastguard',
    name: 'Coast Guard',
    description: 'Patrol vessels and cutters',
    yearMin: null,
    yearMax: null,
    // Q331795=patrol vessel, Q11479409=offshore patrol vessel,
    // Q10316200=small patrol boat, Q683363=cutter
    shipTypes: ['Q331795', 'Q11479409', 'Q10316200', 'Q683363'],
  },
};

/**
 * All mode IDs in order.
 */
export const ALL_MODE_IDS: GameModeId[] = ['main', 'ww2', 'coldwar', 'carrier', 'submarine', 'coastguard'];

/**
 * Bonus mode IDs (excludes main).
 */
export const BONUS_MODE_IDS: GameModeId[] = ['ww2', 'coldwar', 'carrier', 'submarine', 'coastguard'];
