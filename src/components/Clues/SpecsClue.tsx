import type { SpecsClue as SpecsClueData } from '../../types/game';
import { ClueCard } from './ClueCard';
import './SpecsClue.css';

export interface SpecsClueProps {
  /** Specs data to display */
  data: SpecsClueData;
  /** Whether the clue is revealed */
  revealed: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * SpecsClue displays ship technical specifications (Turn 2).
 * Shows: Displacement, Length, Commissioned date.
 * Note: Class removed since players now guess by class name.
 */
export function SpecsClue({
  data,
  revealed,
  className = '',
}: SpecsClueProps) {
  const specs = [
    { label: 'Displacement', value: data.displacement },
    { label: 'Length', value: data.length },
    { label: 'Commissioned', value: data.commissioned },
  ];

  return (
    <ClueCard
      title="Specifications"
      variant="specs"
      revealed={revealed}
      className={className}
    >
      <dl className="specs-clue">
        {specs.map(({ label, value }) => (
          <div key={label} className="specs-clue__item">
            <dt className="specs-clue__label">{label}</dt>
            <dd className="specs-clue__value">
              {value ?? <span className="specs-clue__unknown">Unknown</span>}
            </dd>
          </div>
        ))}
      </dl>
    </ClueCard>
  );
}
