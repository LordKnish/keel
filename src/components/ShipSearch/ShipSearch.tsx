import { useState, useCallback } from 'react';
import {
  ComboBox,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
} from 'react-aria-components';
import { useShipSearch, type ShipListEntry } from '../../hooks/useShipSearch';
import { ShipOption } from './ShipOption';
import './ShipSearch.css';

export interface ShipSearchProps {
  /** Callback when a ship is selected */
  onSelect: (ship: ShipListEntry) => void;
  /** Whether the search is disabled */
  disabled?: boolean;
}

/**
 * Ship search autocomplete component using React Aria ComboBox.
 * Provides accessible fuzzy search for ship names.
 */
export function ShipSearch({ onSelect, disabled = false }: ShipSearchProps) {
  const { search, isLoading, error } = useShipSearch();
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState<ShipListEntry[]>([]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      const results = search(value);
      setItems(results);
    },
    [search]
  );

  const handleSelectionChange = useCallback(
    (key: React.Key | null) => {
      if (key === null) return;
      const selected = items.find((item) => item.id === key);
      if (selected) {
        onSelect(selected);
        setInputValue('');
        setItems([]);
      }
    },
    [items, onSelect]
  );

  if (error) {
    return (
      <div className="ship-search ship-search--error">
        <p className="ship-search__error-message">
          Failed to load ships. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="ship-search">
      <ComboBox
        className="ship-search__combobox"
        inputValue={inputValue}
        items={items}
        onInputChange={handleInputChange}
        onSelectionChange={handleSelectionChange}
        isDisabled={disabled || isLoading}
        allowsCustomValue={false}
        menuTrigger="focus"
        aria-label="Search for a ship"
      >
        <Label className="ship-search__label sr-only">Search for a ship</Label>
        <div className="ship-search__input-wrapper">
          <Input
            className="ship-search__input"
            placeholder={isLoading ? 'Loading ships...' : 'Type a ship name...'}
          />
        </div>
        <Popover className="ship-search__popover">
          <ListBox className="ship-search__listbox">
            {(item: ShipListEntry) => (
              <ListBoxItem
                key={item.id}
                id={item.id}
                textValue={item.name}
                className="ship-search__listbox-item"
              >
                <ShipOption name={item.name} />
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  );
}
