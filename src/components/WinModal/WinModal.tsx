import { useState, useCallback } from 'react';
import type { GuessResult } from '../../types/game';
import './WinModal.css';

export interface WinModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Ship class name (e.g., "Fletcher-class destroyer") */
  className: string;
  /** Specific ship name (e.g., "USS Johnston") */
  shipName: string;
  /** Number of guesses it took */
  guessCount: number;
  /** Total turns allowed */
  totalTurns: number;
  /** Guess results for emoji display */
  guessResults: GuessResult[];
  /** Time taken to solve (in seconds) */
  timeTaken: number;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * WinModal displays the victory screen with share functionality.
 * Shows class name prominently, ship name secondary, stats, and share button.
 */
export function WinModal({
  isOpen,
  className,
  shipName,
  guessCount,
  totalTurns,
  guessResults,
  timeTaken,
  onClose,
}: WinModalProps) {
  const [copied, setCopied] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const generateShareText = useCallback(() => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const resultEmojis = guessResults
      .map((result) => (result === 'correct' ? '🟢' : '🔴'))
      .join('');

    const timeStr = formatTime(timeTaken);

    return `⚓ Keel ${today}\n🚢 ${guessCount}/${totalTurns} • ⏱️ ${timeStr}\n${resultEmojis}\n\nPlay at: ${window.location.origin}`;
  }, [guessResults, guessCount, totalTurns, timeTaken]);

  const handleCopy = useCallback(async () => {
    const shareText = generateShareText();

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generateShareText]);

  if (!isOpen) return null;

  // Display class name as primary with ship name in parentheses
  const displayText = `${className} (${shipName})`;

  return (
    <div className="win-modal-overlay" onClick={onClose}>
      <div className="win-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="win-modal__close"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          ×
        </button>

        <div className="win-modal__content">
          <h2 className="win-modal__title">🎉 Congratulations!</h2>
          <p className="win-modal__class-name">You identified {displayText}</p>

          <div className="win-modal__stats">
            <div className="win-modal__stat">
              <span className="win-modal__stat-value">{guessCount}/{totalTurns}</span>
              <span className="win-modal__stat-label">Guesses</span>
            </div>
            <div className="win-modal__stat">
              <span className="win-modal__stat-value">{formatTime(timeTaken)}</span>
              <span className="win-modal__stat-label">Time</span>
            </div>
          </div>

          <div className="win-modal__result">
            {guessResults.map((result, index) => (
              <span
                key={index}
                className={`win-modal__dot win-modal__dot--${result}`}
                aria-label={result}
              />
            ))}
          </div>

          <button
            className="win-modal__share-button"
            onClick={handleCopy}
            type="button"
          >
            {copied ? '✓ Copied!' : 'Share Result 📋'}
          </button>

          <p className="win-modal__share-preview">{generateShareText()}</p>
        </div>
      </div>
    </div>
  );
}
