/**
 * Main entry point for game generation.
 * Generates a complete game data file for one random ship.
 *
 * Usage: npm run generate
 * Output: public/game-data.json
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { selectRandomShip } from './select-ship.js';
import { fetchClues } from './fetch-clues.js';
import { generateLineArtFromUrl } from './generate-lineart.js';
import { getUsedShipIds, markShipUsed } from './used-ships.js';
import type { GameData, ShipIdentity } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../../..');
const OUTPUT_PATH = join(PROJECT_ROOT, 'public/game-data.json');

/**
 * Generate today's game data.
 */
async function generateGame(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Keel Game Generator');
  console.log('='.repeat(60));

  // 1. Load used ships
  const usedIds = await getUsedShipIds();
  console.log(`\nUsed ships: ${usedIds.length}`);

  // 2. Select random ship
  console.log('\nSelecting random ship...');
  const ship = await selectRandomShip(usedIds);

  if (!ship) {
    console.error('No eligible ships found! Check query or reset used ships.');
    process.exit(1);
  }

  console.log(`\nSelected: ${ship.name} (${ship.id})`);
  console.log(`  Country: ${ship.country || 'Unknown'}`);
  console.log(`  Class: ${ship.className || 'Unknown'}`);
  console.log(`  Commissioned: ${ship.commissioned || 'Unknown'}`);

  // 3. Fetch clues
  console.log('\nFetching clue data...');
  const clues = await fetchClues(ship);

  // 4. Generate line art
  console.log('\nGenerating line art...');
  let silhouette: string;
  try {
    silhouette = await generateLineArtFromUrl(ship.imageUrl);
  } catch (error) {
    console.error('Failed to generate line art:', error);
    process.exit(1);
  }

  // 5. Build game data
  const shipIdentity: ShipIdentity = {
    id: ship.id,
    name: ship.name,
    aliases: [], // Could add class name, hull number, etc.
  };

  // Add class name as alias if available
  if (ship.className) {
    shipIdentity.aliases.push(ship.className);
  }

  const gameData: GameData = {
    date: new Date().toISOString().split('T')[0],
    ship: shipIdentity,
    silhouette: `data:image/png;base64,${silhouette}`,
    clues,
  };

  // 6. Write output
  console.log('\nWriting game data...');
  const outputDir = dirname(OUTPUT_PATH);
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }
  await writeFile(OUTPUT_PATH, JSON.stringify(gameData, null, 2));
  console.log(`  Written to: ${OUTPUT_PATH}`);

  // 7. Mark ship as used
  await markShipUsed(ship.id, ship.name);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Generation Complete!');
  console.log('='.repeat(60));
  console.log(`Ship: ${ship.name}`);
  console.log(`Date: ${gameData.date}`);
  console.log(`Clues:`);
  console.log(`  Specs: ${clues.specs.class || 'N/A'}, ${clues.specs.commissioned || 'N/A'}`);
  console.log(`  Nation: ${clues.context.nation}`);
  console.log(`  Conflicts: ${clues.context.conflicts.length > 0 ? clues.context.conflicts.join(', ') : 'None recorded'}`);
  console.log(`  Trivia: ${clues.trivia ? clues.trivia.substring(0, 60) + '...' : 'N/A'}`);
  console.log(`  Photo: ${clues.photo.substring(0, 60)}...`);
  console.log(`\nSilhouette size: ${Math.round(silhouette.length / 1024)}KB`);
}

// Run
generateGame().catch((error) => {
  console.error('Generation failed:', error);
  process.exit(1);
});
