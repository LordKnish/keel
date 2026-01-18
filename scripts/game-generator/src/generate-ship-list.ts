/**
 * Generate ship list for autocomplete in the game UI.
 * Queries Wikidata for all eligible ships (>1950, has image).
 *
 * Usage: npm run generate:ship-list
 * Output: public/ship-list.json
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ShipListData, ShipListEntry } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../../..');
const OUTPUT_PATH = join(PROJECT_ROOT, 'public/ship-list.json');

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const USER_AGENT =
  'Mozilla/5.0 (compatible; KeelGame/1.0; +https://github.com/keel-game)';

/**
 * Ship type Wikidata IDs to query.
 */
const SHIP_TYPES = [
  'Q174736', // destroyer
  'Q182531', // battleship
  'Q17205', // aircraft carrier
  'Q104843', // cruiser
  'Q161705', // frigate
  'Q170013', // corvette
  'Q2811', // submarine
];

interface ShipResult {
  ship: { value: string };
  shipLabel: { value: string };
}

/**
 * Extract Wikidata entity ID from URI.
 */
function extractEntityId(uri: string): string {
  const match = uri.match(/Q\d+$/);
  return match ? match[0] : uri;
}

/**
 * Fetch all eligible ship names from Wikidata.
 * Uses pagination to handle large result sets.
 */
async function fetchAllShips(): Promise<ShipListEntry[]> {
  const ships: ShipListEntry[] = [];
  const seenIds = new Set<string>();
  const batchSize = 1000;
  let offset = 0;
  let hasMore = true;

  const typeValues = SHIP_TYPES.map((t) => `wd:${t}`).join(' ');

  while (hasMore) {
    console.log(`Fetching ships at offset ${offset}...`);

    const query = `
SELECT DISTINCT ?ship ?shipLabel
WHERE {
  VALUES ?type { ${typeValues} }
  ?ship wdt:P31 ?type .                   # Instance of specific ship type
  ?ship wdt:P18 ?image .                  # Has image
  ?ship wdt:P729 ?commissioned .          # Has commissioned date

  # Filter for ships commissioned after 1950
  FILTER(YEAR(?commissioned) > 1950)

  # Must have English label (not Q-number)
  ?ship rdfs:label ?shipLabel .
  FILTER(LANG(?shipLabel) = "en")
  FILTER(!STRSTARTS(?shipLabel, "Q"))
}
ORDER BY ?shipLabel
LIMIT ${batchSize}
OFFSET ${offset}
    `.trim();

    const url = new URL(SPARQL_ENDPOINT);
    url.searchParams.set('query', query);
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`SPARQL query failed: ${response.status}`);
    }

    const data = await response.json();
    const results: ShipResult[] = data.results.bindings;

    if (results.length === 0) {
      hasMore = false;
    } else {
      for (const result of results) {
        const id = extractEntityId(result.ship.value);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          ships.push({
            id,
            name: result.shipLabel.value,
          });
        }
      }
      offset += batchSize;

      // Safety limit
      if (offset > 10000) {
        console.log('Reached safety limit of 10000 ships');
        hasMore = false;
      }

      // Rate limiting
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return ships;
}

/**
 * Generate ship list JSON file.
 */
async function generateShipList(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Keel Ship List Generator');
  console.log('='.repeat(60));

  console.log('\nFetching ships from Wikidata...');
  const ships = await fetchAllShips();

  console.log(`\nFound ${ships.length} ships`);

  // Sort alphabetically
  ships.sort((a, b) => a.name.localeCompare(b.name));

  const shipListData: ShipListData = {
    generatedAt: new Date().toISOString(),
    count: ships.length,
    ships,
  };

  // Write output
  console.log('\nWriting ship list...');
  const outputDir = dirname(OUTPUT_PATH);
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }
  await writeFile(OUTPUT_PATH, JSON.stringify(shipListData, null, 2));
  console.log(`  Written to: ${OUTPUT_PATH}`);
  console.log(`  File size: ${Math.round(JSON.stringify(shipListData).length / 1024)}KB`);

  // Show sample
  console.log('\nSample ships:');
  for (const ship of ships.slice(0, 10)) {
    console.log(`  - ${ship.name}`);
  }
  if (ships.length > 10) {
    console.log(`  ... and ${ships.length - 10} more`);
  }
}

// Run
generateShipList().catch((error) => {
  console.error('Generation failed:', error);
  process.exit(1);
});
