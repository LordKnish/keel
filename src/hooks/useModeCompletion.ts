/**
 * Hook for tracking game mode completion in localStorage.
 * Persists completion state across page refreshes and resets daily.
 */

import { useState, useCallback, useEffect } from 'react';
import type { GameModeId, ModeResult, DailyCompletion } from '../types/modes';

const STORAGE_KEY = 'keel-daily-completion';

/**
 * Get today's date in ISO format (YYYY-MM-DD).
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Load completion data from localStorage.
 * Returns empty completion if data is missing or from a different day.
 */
function loadCompletion(): DailyCompletion {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { date: getToday(), modes: {} };
    }

    const data: DailyCompletion = JSON.parse(stored);
    // Reset if different day
    if (data.date !== getToday()) {
      return { date: getToday(), modes: {} };
    }
    return data;
  } catch {
    return { date: getToday(), modes: {} };
  }
}

/**
 * Save completion data to localStorage.
 */
function saveCompletion(data: DailyCompletion): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('Failed to save completion to localStorage');
  }
}

/**
 * Hook for tracking mode completion.
 *
 * @param mode - The game mode to track
 * @returns Completion state and functions
 */
export function useModeCompletion(mode: GameModeId) {
  const [completion, setCompletion] = useState<DailyCompletion>(loadCompletion);

  // Sync with localStorage on mount and when mode changes
  useEffect(() => {
    setCompletion(loadCompletion());
  }, [mode]);

  // Check if this mode is complete
  const isComplete = !!completion.modes[mode];
  const result = completion.modes[mode];

  // Mark the current mode as complete
  const markComplete = useCallback(
    (modeResult: ModeResult) => {
      setCompletion((prev) => {
        const updated: DailyCompletion = {
          date: getToday(),
          modes: { ...prev.modes, [mode]: modeResult },
        };
        saveCompletion(updated);
        return updated;
      });
    },
    [mode]
  );

  // Check if main mode is complete (for unlocking bonus modes)
  const isMainComplete = !!completion.modes.main;

  return {
    /** Whether the current mode is complete */
    isComplete,
    /** The result if complete, undefined otherwise */
    result,
    /** Mark the current mode as complete with result */
    markComplete,
    /** Whether main mode is complete (for bonus mode gating) */
    isMainComplete,
    /** All completion data for all modes */
    allCompletions: completion.modes,
  };
}
