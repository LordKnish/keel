import { useState, useCallback, useRef } from 'react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';
import { useShipSearch, type ShipListEntry } from '../../hooks/useShipSearch';
import './ShipSearch.css';

export interface ShipSearchProps {
  /** Callback when a ship is selected */
  onSelect: (ship: ShipListEntry) => void;
  /** Whether the search is disabled */
  disabled?: boolean;
}

/**
 * Ship search autocomplete component using shadcn Command (cmdk).
 * Provides accessible fuzzy search for ship names.
 */
export function ShipSearch({ onSelect, disabled = false }: ShipSearchProps) {
  const { search, isLoading, error } = useShipSearch();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState<ShipListEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);

      // Perform search and update items in the same handler
      if (value.length >= 2) {
        const results = search(value);
        setItems(results);
        setOpen(results.length > 0);
      } else {
        setItems([]);
        setOpen(false);
      }
    },
    [search]
  );

  const handleSelect = useCallback(
    (shipId: string) => {
      const selected = items.find((item) => item.id === shipId);
      if (selected) {
        onSelect(selected);
        setInputValue('');
        setItems([]);
        setOpen(false);
      }
    },
    [items, onSelect]
  );

  // Close popover on escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }, []);

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
    <div className="ship-search" onKeyDown={handleKeyDown}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Command
            className="ship-search__command"
            shouldFilter={false}
          >
            <CommandInput
              ref={inputRef}
              className="ship-search__input"
              placeholder={isLoading ? 'Loading ships...' : 'Type a ship name...'}
              value={inputValue}
              onValueChange={handleInputChange}
              disabled={disabled || isLoading}
              aria-label="Search for a ship"
            />
          </Command>
        </PopoverAnchor>
        <PopoverContent
          className="ship-search__popover"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          align="start"
          sideOffset={4}
        >
          <Command shouldFilter={false}>
            <CommandList className="ship-search__list">
              <CommandEmpty>No ships found</CommandEmpty>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  className="ship-search__item"
                >
                  {item.name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
