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
    shipTypes: ['Q2811', 'Q473932'],
  },
  coastguard: {
    id: 'coastguard',
    name: 'Coast Guard',
    description: 'Small vessels and patrol boats',
    yearMin: null,
    yearMax: null,
    shipTypes: ['Q1797385', 'Q847109', 'Q3041792'],
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
