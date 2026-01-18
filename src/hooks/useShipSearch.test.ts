import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useShipSearch } from './useShipSearch';

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

describe('useShipSearch', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockShipList),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns loading true initially', () => {
    const { result } = renderHook(() => useShipSearch());
    expect(result.current.isLoading).toBe(true);
  });

  it('returns loading false after ship list loads', async () => {
    const { result } = renderHook(() => useShipSearch());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns error null when load succeeds', async () => {
    const { result } = renderHook(() => useShipSearch());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it('returns error when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useShipSearch());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('returns error when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useShipSearch());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('404');
  });

  it('search returns empty array for query shorter than 2 chars', async () => {
    const { result } = renderHook(() => useShipSearch());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.search('E')).toEqual([]);
    expect(result.current.search('')).toEqual([]);
  });

  it('search returns matching ships', async () => {
    const { result } = renderHook(() => useShipSearch());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const results = result.current.search('Enterprise');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.name).toContain('Enterprise');
  });

  it('search handles fuzzy matching', async () => {
    const { result } = renderHook(() => useShipSearch());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should find Bismarck even with a typo
    const results = result.current.search('Bismark');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.name).toBe('Bismarck');
  });

  it('search returns max 8 results', async () => {
    // Create a mock with more than 8 matching ships
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          generatedAt: '2026-01-18T00:00:00Z',
          count: 10,
          ships: [
            { id: 'Q1', name: 'USS Ship 1' },
            { id: 'Q2', name: 'USS Ship 2' },
            { id: 'Q3', name: 'USS Ship 3' },
            { id: 'Q4', name: 'USS Ship 4' },
            { id: 'Q5', name: 'USS Ship 5' },
            { id: 'Q6', name: 'USS Ship 6' },
            { id: 'Q7', name: 'USS Ship 7' },
            { id: 'Q8', name: 'USS Ship 8' },
            { id: 'Q9', name: 'USS Ship 9' },
            { id: 'Q10', name: 'USS Ship 10' },
          ],
        }),
    } as Response);

    const { result } = renderHook(() => useShipSearch());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const results = result.current.search('USS');
    expect(results.length).toBeLessThanOrEqual(8);
  });
});
