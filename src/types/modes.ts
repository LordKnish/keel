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
  /** Order in unlock sequence (0 = main, 1-5 = bonus modes) */
  unlockOrder: number;
  /** Mode that must be completed to unlock this one (null for main) */
  prerequisiteMode: GameModeId | null;
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
    unlockOrder: 0,
    prerequisiteMode: null,
  },
  ww2: {
    id: 'ww2',
    name: 'WW2',
    description: 'World War 2 era (1939-1945)',
    icon: '🎖️',
    dataFile: '/game-data-ww2.json',
    unlockOrder: 1,
    prerequisiteMode: 'main',
  },
  coldwar: {
    id: 'coldwar',
    name: 'Cold War',
    description: 'Cold War era (1947-1991)',
    icon: '☢️',
    dataFile: '/game-data-coldwar.json',
    unlockOrder: 2,
    prerequisiteMode: 'ww2',
  },
  carrier: {
    id: 'carrier',
    name: 'Carrier',
    description: 'Aircraft carriers only',
    icon: '🛫',
    dataFile: '/game-data-carrier.json',
    unlockOrder: 3,
    prerequisiteMode: 'coldwar',
  },
  submarine: {
    id: 'submarine',
    name: 'Submarine',
    description: 'Submarines only',
    icon: '🔱',
    dataFile: '/game-data-submarine.json',
    unlockOrder: 4,
    prerequisiteMode: 'carrier',
  },
  coastguard: {
    id: 'coastguard',
    name: 'Small Ships',
    description: 'Small vessels',
    icon: '🚤',
    dataFile: '/game-data-coastguard.json',
    unlockOrder: 5,
    prerequisiteMode: 'submarine',
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
 * Get list of unlocked modes based on completion status.
 * A mode is unlocked if its prerequisite mode has been completed (win or lose).
 */
export function getUnlockedModes(completions: Partial<Record<GameModeId, ModeResult>>): GameModeId[] {
  return ALL_MODE_IDS.filter((modeId) => {
    const config = GAME_MODES[modeId];
    // Main is always unlocked
    if (config.prerequisiteMode === null) {
      return true;
    }
    // Other modes require prerequisite to be completed
    return !!completions[config.prerequisiteMode];
  });
}

/**
 * Check if a specific mode is unlocked.
 */
export function isModeUnlocked(
  modeId: GameModeId,
  completions: Partial<Record<GameModeId, ModeResult>>
): boolean {
  const config = GAME_MODES[modeId];
  if (config.prerequisiteMode === null) {
    return true;
  }
  return !!completions[config.prerequisiteMode];
}
