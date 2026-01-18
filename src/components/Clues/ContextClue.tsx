import type { ContextClue as ContextClueData } from '../../types/game';
import { ClueCard } from './ClueCard';
import './ContextClue.css';

export interface ContextClueProps {
  /** Context data to display */
  data: ContextClueData;
  /** Whether the clue is revealed */
  revealed: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * ContextClue displays historical context (Turn 3).
 * Shows: Nation, Conflicts, Status.
 */
export function ContextClue({
  data,
  revealed,
  className = '',
}: ContextClueProps) {
  const conflictsText =
    data.conflicts.length > 0
      ? data.conflicts.join(', ')
      : null;

  return (
    <ClueCard
      title="Historical Context"
      variant="context"
      revealed={revealed}
      className={className}
    >
      <dl className="context-clue">
        <div className="context-clue__item">
          <dt className="context-clue__label">Nation</dt>
          <dd className="context-clue__value">{data.nation}</dd>
        </div>

        <div className="context-clue__item">
          <dt className="context-clue__label">Conflicts</dt>
          <dd className="context-clue__value">
            {conflictsText ?? (
              <span className="context-clue__none">None recorded</span>
            )}
          </dd>
        </div>

        <div className="context-clue__item">
          <dt className="context-clue__label">Status</dt>
          <dd className="context-clue__value">
            {data.status ?? (
              <span className="context-clue__none">Unknown</span>
            )}
          </dd>
        </div>
      </dl>
    </ClueCard>
  );
}
