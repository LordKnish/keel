import './ShipOption.css';

export interface ShipOptionProps {
  /** Ship name to display */
  name: string;
}

/**
 * Custom list item for ship autocomplete dropdown.
 * Displays ship name with clean styling.
 */
export function ShipOption({ name }: ShipOptionProps) {
  return (
    <div className="ship-option">
      <span className="ship-option__name">{name}</span>
    </div>
  );
}
