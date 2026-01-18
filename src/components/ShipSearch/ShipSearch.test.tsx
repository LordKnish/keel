import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShipSearch } from './ShipSearch';

// Mock ship list data
const mockShipList = {
  generatedAt: '2026-01-18T00:00:00Z',
  count: 5,
  ships: [
    { id: 'Q1', name: 'USS Enterprise' },
    { id: 'Q2', name: 'USS Enterprise (CVN-65)' },
    { id: 'Q3', name: 'HMS Victory' },
    { id: 'Q4', name: 'Bismarck' },
    { id: 'Q5', name: 'Yamato' },
  ],
};

describe('ShipSearch', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockShipList),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the search input', async () => {
    render(<ShipSearch onSelect={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Search for a ship')).toBeInTheDocument();
    });
  });

  it('shows loading placeholder while ship list loads', () => {
    render(<ShipSearch onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText('Loading ships...')).toBeInTheDocument();
  });

  it('shows normal placeholder after loading', async () => {
    render(<ShipSearch onSelect={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a ship name...')).toBeInTheDocument();
    });
  });

  it('shows error message when ship list fails to load', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    render(<ShipSearch onSelect={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load ships/)).toBeInTheDocument();
    });
  });

  it('shows search results when typing', async () => {
    const user = userEvent.setup();
    render(<ShipSearch onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a ship name...')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Search for a ship');
    await user.type(input, 'Ent');

    await waitFor(() => {
      expect(screen.getByText('USS Enterprise')).toBeInTheDocument();
    });
  });

  it('calls onSelect when a ship is selected', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ShipSearch onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a ship name...')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Search for a ship');
    await user.type(input, 'Enter');

    await waitFor(() => {
      expect(screen.getByText('USS Enterprise')).toBeInTheDocument();
    });

    // Click on the first result
    await user.click(screen.getByText('USS Enterprise'));

    expect(onSelect).toHaveBeenCalledWith({ id: 'Q1', name: 'USS Enterprise' });
  });

  it('clears input after selection', async () => {
    const user = userEvent.setup();
    render(<ShipSearch onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a ship name...')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Search for a ship');
    await user.type(input, 'Enter');

    await waitFor(() => {
      expect(screen.getByText('USS Enterprise')).toBeInTheDocument();
    });

    await user.click(screen.getByText('USS Enterprise'));

    expect(input).toHaveValue('');
  });

  it('disables input when disabled prop is true', async () => {
    render(<ShipSearch onSelect={vi.fn()} disabled />);

    await waitFor(() => {
      const input = screen.getByLabelText('Search for a ship');
      expect(input).toBeDisabled();
    });
  });

  it('does not show results for queries shorter than 2 characters', async () => {
    const user = userEvent.setup();
    render(<ShipSearch onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a ship name...')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Search for a ship');
    await user.type(input, 'E');

    // Should not show any results
    expect(screen.queryByText('USS Enterprise')).not.toBeInTheDocument();
  });
});
