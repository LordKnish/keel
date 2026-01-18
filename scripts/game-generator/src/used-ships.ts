/**
 * Track ships that have already been used in daily games.
 * Prevents duplicates across game generations.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { UsedShipsData, UsedShipEntry } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USED_SHIPS_PATH = join(__dirname, '../data/used-ships.json');

/**
 * Load used ships data from file.
 */
async function loadUsedShips(): Promise<UsedShipsData> {
  try {
    if (!existsSync(USED_SHIPS_PATH)) {
      return { ships: [] };
    }
    const data = await readFile(USED_SHIPS_PATH, 'utf-8');
    return JSON.parse(data) as UsedShipsData;
  } catch {
    return { ships: [] };
  }
}

/**
 * Save used ships data to file.
 */
async function saveUsedShips(data: UsedShipsData): Promise<void> {
  // Ensure data directory exists
  const dir = dirname(USED_SHIPS_PATH);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(USED_SHIPS_PATH, JSON.stringify(data, null, 2));
}

/**
 * Get list of all used ship IDs.
 */
export async function getUsedShipIds(): Promise<string[]> {
  const data = await loadUsedShips();
  return data.ships.map((s) => s.id);
}

/**
 * Check if a ship has already been used.
 */
export async function isShipUsed(id: string): Promise<boolean> {
  const ids = await getUsedShipIds();
  return ids.includes(id);
}

/**
 * Mark a ship as used.
 */
export async function markShipUsed(id: string, name: string): Promise<void> {
  const data = await loadUsedShips();

  // Check if already exists
  if (data.ships.some((s) => s.id === id)) {
    console.log(`Ship ${name} (${id}) already marked as used`);
    return;
  }

  const entry: UsedShipEntry = {
    id,
    name,
    usedDate: new Date().toISOString().split('T')[0],
  };

  data.ships.push(entry);
  await saveUsedShips(data);
  console.log(`Marked ${name} (${id}) as used`);
}

/**
 * Get count of used ships.
 */
export async function getUsedShipCount(): Promise<number> {
  const data = await loadUsedShips();
  return data.ships.length;
}

/**
 * Clear all used ships (for testing).
 */
export async function clearUsedShips(): Promise<void> {
  await saveUsedShips({ ships: [] });
}
