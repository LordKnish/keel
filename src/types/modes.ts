/**
 * Game mode types for multi-mode support in the frontend.
 */

export type GameModeId = 'main' | 'ww2' | 'coldwar' | 'amphibious' | 'submarine' | 'coastguard';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  description: string;
  icon: string;
  dataFile: string;
  /** URL path for this mode (e.g., "/ww2", "/cold-war") */
  path: string;
}

/**
 * All game modes with their frontend configuration.
 */
export const GAME_MODES: Record<GameModeId, GameModeConfig> = {
  main: {
    id: 'main',
    name: 'Daily Keel',
    description: 'Modern warships (1980+)',
    icon: 'fa-solid fa-anchor',
    dataFile: '/game-data-main.json',
    path: '/',
  },
  ww2: {
    id: 'ww2',
    name: 'WW2',
    description: 'World War 2 era (1939-1945)',
    icon: 'fa-solid fa-medal',
    dataFile: '/game-data-ww2.json',
    path: '/ww2',
  },
  coldwar: {
    id: 'coldwar',
    name: 'Cold War',
    description: 'Cold War era (1947-1991)',
    icon: 'fa-solid fa-radiation',
    dataFile: '/game-data-coldwar.json',
    path: '/cold-war',
  },
  amphibious: {
    id: 'amphibious',
    name: 'Amphibious',
    description: 'Amphibious assault ships',
    icon: 'fa-solid fa-helicopter',
    dataFile: '/game-data-amphibious.json',
    path: '/amphibious',
  },
  submarine: {
    id: 'submarine',
    name: 'Submarine',
    description: 'Submarines only',
    icon: 'fa-solid fa-water',
    dataFile: '/game-data-submarine.json',
    path: '/submarine',
  },
  coastguard: {
    id: 'coastguard',
    name: 'Small Ships',
    description: 'Small vessels',
    icon: 'fa-solid fa-ship',
    dataFile: '/game-data-coastguard.json',
    path: '/small-ships',
  },
};

/**
 * All mode IDs in order.
 */
export const ALL_MODE_IDS: GameModeId[] = ['main', 'ww2', 'coldwar', 'amphibious', 'submarine', 'coastguard'];

/**
 * Bonus mode IDs (excludes main).
 */
export const BONUS_MODE_IDS: GameModeId[] = ['ww2', 'coldwar', 'amphibious', 'submarine', 'coastguard'];

/**
 * Result of completing a mode.
 */
export interface ModeResult {
  isWin: boolean;
  guessCount: number;
  timeTaken: number;
  guessResults: ('correct' | 'wrong')[];
  shipId: string; // Track which ship this completion is for
}

/**
 * Daily completion tracking across all modes.
 */
export interface DailyCompletion {
  date: string;
  modes: Partial<Record<GameModeId, ModeResult>>;
}

/**
 * Get mode ID from URL path.
 * Returns 'main' if path doesn't match any mode.
 */
export function getModeByPath(path: string): GameModeId {
  const mode = ALL_MODE_IDS.find((modeId) => GAME_MODES[modeId].path === path);
  return mode || 'main';
}
