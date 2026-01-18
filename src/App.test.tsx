import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

// Mock game data for tests
const mockGameData = {
  date: '2026-01-18',
  ship: {
    id: 'Q123',
    name: 'HMS Test Ship',
    aliases: [],
  },
  silhouette: 'data:image/png;base64,test',
  clues: {
    specs: {
      class: 'Test Class',
      displacement: '1000 tons',
      length: '100m',
      commissioned: '1940',
    },
    context: {
      nation: 'United Kingdom',
      conflicts: ['World War II'],
      status: 'Museum Ship',
    },
    trivia: 'A test trivia fact',
    photo: 'https://example.com/photo.jpg',
  },
};

describe('App', () => {
  beforeEach(() => {
    // Mock fetch
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGameData),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the Keel title after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Keel')).toBeInTheDocument();
    });
  });

  it('renders the tagline after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Daily warship guessing game')).toBeInTheDocument();
    });
  });

  it('renders the silhouette component', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByAltText('Mystery warship silhouette')).toBeInTheDocument();
    });
  });

  it('renders the turn indicator', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('group', { name: /Turn/ })).toBeInTheDocument();
    });
  });

  it('shows error state when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load game data/)).toBeInTheDocument();
    });
  });
});
