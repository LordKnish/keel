/**
 * Game mode types for multi-mode support in the frontend.
 */

export type GameModeId = 'main' | 'ww2' | 'coldwar' | 'carrier' | 'submarine' | 'coastguard';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  description: string;
  icon: string;
  dataFile: string;
}

/**
 * All game modes with their frontend configuration.
 */
export const GAME_MODES: Record<GameModeId, GameModeConfig> = {
  main: {
    id: 'main',
    name: 'Daily Keel',
    description: 'Modern warships (1980+)',
    icon: '⚓',
    dataFile: '/game-data-main.json',
  },
  ww2: {
    id: 'ww2',
    name: 'WW2',
    description: 'World War 2 era (1939-1945)',
    icon: '🎖️',
    dataFile: '/game-data-ww2.json',
  },
  coldwar: {
    id: 'coldwar',
    name: 'Cold War',
    description: 'Cold War era (1947-1991)',
    icon: '☢️',
    dataFile: '/game-data-coldwar.json',
  },
  carrier: {
    id: 'carrier',
    name: 'Carrier',
    description: 'Aircraft carriers only',
    icon: '🛫',
    dataFile: '/game-data-carrier.json',
  },
  submarine: {
    id: 'submarine',
    name: 'Submarine',
    description: 'Submarines only',
    icon: '🔱',
    dataFile: '/game-data-submarine.json',
  },
  coastguard: {
    id: 'coastguard',
    name: 'Coast Guard',
    description: 'Small vessels',
    icon: '🚤',
    dataFile: '/game-data-coastguard.json',
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

/**
 * Result of completing a mode.
 */
export interface ModeResult {
  isWin: boolean;
  guessCount: number;
  timeTaken: number;
  guessResults: ('correct' | 'wrong')[];
}

/**
 * Daily completion tracking across all modes.
 */
export interface DailyCompletion {
  date: string;
  modes: Partial<Record<GameModeId, ModeResult>>;
}
