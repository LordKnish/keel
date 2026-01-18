/**
 * Vercel Serverless Function for daily game generation.
 * Triggered by Vercel Cron at 12:00 AM UTC daily.
 *
 * This function:
 * 1. Selects a random ship from Wikidata (not previously used)
 * 2. Fetches clue data (specs, context, trivia, photo)
 * 3. Generates line art silhouette
 * 4. Stores game data in Neon PostgreSQL
 * 5. Tracks used ships in Neon PostgreSQL
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import cv from '@techstark/opencv-js';
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal-node';

// ============================================================================
// Types
// ============================================================================

interface SpecsClue {
  class: string | null;
  displacement: string | null;
  length: string | null;
  commissioned: string | null;
}

interface ContextClue {
  nation: string;
  conflicts: string[];
  status: string | null;
}

interface GameClues {
  specs: SpecsClue;
  context: ContextClue;
  trivia: string | null;
  photo: string;
}

interface ShipIdentity {
  id: string;
  name: string;
  aliases: string[];
}

interface GameData {
  date: string;
  ship: ShipIdentity;
  silhouette: string;
  clues: GameClues;
}

interface WikidataShipResult {
  ship: { value: string };
  shipLabel: { value: string };
  image?: { value: string };
  class?: { value: string };
  classLabel?: { value: string };
  country?: { value: string };
  countryLabel?: { value: string };
  operator?: { value: string };
  operatorLabel?: { value: string };
  operatorCountry?: { value: string };
  operatorCountryLabel?: { value: string };
  length?: { value: string };
  displacement?: { value: string };
  commissioned?: { value: string };
  decommissioned?: { value: string };
  status?: { value: string };
  statusLabel?: { value: string };
  conflict?: { value: string };
  conflictLabel?: { value: string };
  article?: { value: string };
}

interface SelectedShip {
  id: string;
  name: string;
  imageUrl: string;
  className: string | null;
  country: string | null;
  length: string | null;
  displacement: string | null;
  commissioned: string | null;
  decommissioned: string | null;
  status: string | null;
  conflicts: string[];
  wikipediaTitle: string | null;
}

interface WikipediaSummary {
  title: string;
  extract: string;
  description?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'Mozilla/5.0 (compatible; KeelGame/1.0; +https://github.com/keel-game)';
const CRON_SECRET = process.env.CRON_SECRET;

const SHIP_TYPES = [
  'Q174736',   // destroyer
  'Q182531',   // battleship
  'Q17205',    // aircraft carrier
  'Q104843',   // cruiser
  'Q161705',   // frigate
  'Q170013',   // corvette
  'Q2811',     // submarine
];

// ============================================================================
// Database Functions (Neon PostgreSQL)
// ============================================================================

async function getUsedShipIds(): Promise<string[]> {
  try {
    const result = await sql`SELECT wikidata_id FROM used_ships`;
    return result.rows.map((row) => row.wikidata_id);
  } catch (error) {
    console.error('Failed to fetch used ships:', error);
    return [];
  }
}

async function markShipUsed(id: string, name: string): Promise<void> {
  try {
    await sql`
      INSERT INTO used_ships (wikidata_id, name, used_date)
      VALUES (${id}, ${name}, CURRENT_DATE)
      ON CONFLICT (wikidata_id) DO NOTHING
    `;
    console.log(`Marked ${name} (${id}) as used`);
  } catch (error) {
    console.error('Failed to mark ship as used:', error);
    throw error;
  }
}

async function saveGameData(gameData: GameData): Promise<void> {
  const { date, ship, silhouette, clues } = gameData;
  
  // Convert arrays to PostgreSQL array format
  const aliasesArray = `{${ship.aliases.map(a => `"${a.replace(/"/g, '\\"')}"`).join(',')}}`;
  const conflictsArray = `{${clues.context.conflicts.map(c => `"${c.replace(/"/g, '\\"')}"`).join(',')}}`;
  
  try {
    await sql`
      INSERT INTO game_data (
        game_date,
        ship_id,
        ship_name,
        ship_aliases,
        silhouette,
        clues_specs_class,
        clues_specs_displacement,
        clues_specs_length,
        clues_specs_commissioned,
        clues_context_nation,
        clues_context_conflicts,
        clues_context_status,
        clues_trivia,
        clues_photo
      ) VALUES (
        ${date}::date,
        ${ship.id},
        ${ship.name},
        ${aliasesArray}::text[],
        ${silhouette},
        ${clues.specs.class},
        ${clues.specs.displacement},
        ${clues.specs.length},
        ${clues.specs.commissioned},
        ${clues.context.nation},
        ${conflictsArray}::text[],
        ${clues.context.status},
        ${clues.trivia},
        ${clues.photo}
      )
      ON CONFLICT (game_date) DO UPDATE SET
        ship_id = EXCLUDED.ship_id,
        ship_name = EXCLUDED.ship_name,
        ship_aliases = EXCLUDED.ship_aliases,
        silhouette = EXCLUDED.silhouette,
        clues_specs_class = EXCLUDED.clues_specs_class,
        clues_specs_displacement = EXCLUDED.clues_specs_displacement,
        clues_specs_length = EXCLUDED.clues_specs_length,
        clues_specs_commissioned = EXCLUDED.clues_specs_commissioned,
        clues_context_nation = EXCLUDED.clues_context_nation,
        clues_context_conflicts = EXCLUDED.clues_context_conflicts,
        clues_context_status = EXCLUDED.clues_context_status,
        clues_trivia = EXCLUDED.clues_trivia,
        clues_photo = EXCLUDED.clues_photo,
        updated_at = CURRENT_TIMESTAMP
    `;
    console.log(`Saved game data for ${date}`);
  } catch (error) {
    console.error('Failed to save game data:', error);
    throw error;
  }
}

// ============================================================================
// SPARQL Functions
// ============================================================================

function buildCountQuery(excludeIds: string[]): string {
  const excludeFilter =
    excludeIds.length > 0
      ? `FILTER(?ship NOT IN (${excludeIds.map((id) => `wd:${id}`).join(', ')}))`
      : '';

  const typeValues = SHIP_TYPES.map((t) => `wd:${t}`).join(' ');

  return `
SELECT (COUNT(DISTINCT ?ship) AS ?count)
WHERE {
  VALUES ?type { ${typeValues} }
  ?ship wdt:P31 ?type .
  ?ship wdt:P18 ?image .
  ?ship wdt:P729 ?commissioned .

  OPTIONAL { ?ship wdt:P2043 ?length . }
  OPTIONAL { ?ship wdt:P2386 ?displacement . }
  FILTER(BOUND(?length) || BOUND(?displacement))

  FILTER(YEAR(?commissioned) > 1950)

  ?ship rdfs:label ?label .
  FILTER(LANG(?label) = "en")
  FILTER(!STRSTARTS(?label, "Q"))

  ${excludeFilter}
}
  `.trim();
}

function buildShipQuery(excludeIds: string[], offset: number): string {
  const excludeFilter =
    excludeIds.length > 0
      ? `FILTER(?ship NOT IN (${excludeIds.map((id) => `wd:${id}`).join(', ')}))`
      : '';

  const typeValues = SHIP_TYPES.map((t) => `wd:${t}`).join(' ');

  return `
SELECT DISTINCT
  ?ship ?shipLabel
  ?image
  ?class ?classLabel
  ?country ?countryLabel
  ?operator ?operatorLabel
  ?operatorCountry ?operatorCountryLabel
  ?length ?displacement
  ?commissioned
  ?conflict ?conflictLabel
  ?decommissioned
  ?status ?statusLabel
  ?article
WHERE {
  VALUES ?type { ${typeValues} }
  ?ship wdt:P31 ?type .
  ?ship wdt:P18 ?image .
  ?ship wdt:P729 ?commissioned .

  OPTIONAL { ?ship wdt:P2043 ?length . }
  OPTIONAL { ?ship wdt:P2386 ?displacement . }
  FILTER(BOUND(?length) || BOUND(?displacement))

  FILTER(YEAR(?commissioned) > 1950)

  ?ship rdfs:label ?label .
  FILTER(LANG(?label) = "en")
  FILTER(!STRSTARTS(?label, "Q"))

  ${excludeFilter}

  OPTIONAL { ?ship wdt:P289 ?class . }
  OPTIONAL { ?ship wdt:P17 ?country . }
  OPTIONAL {
    ?ship wdt:P137 ?operator .
    OPTIONAL { ?operator wdt:P17 ?operatorCountry . }
  }
  OPTIONAL { ?ship wdt:P607 ?conflict . }
  OPTIONAL { ?ship wdt:P730 ?decommissioned . }
  OPTIONAL { ?ship wdt:P1308 ?status . }

  OPTIONAL {
    ?article schema:about ?ship ;
             schema:isPartOf <https://en.wikipedia.org/> .
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY ?shipLabel
LIMIT 1
OFFSET ${offset}
  `.trim();
}

interface SparqlResponse<T> {
  results: {
    bindings: T[];
  };
}

async function executeSparql<T>(query: string): Promise<T[]> {
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

  const data = (await response.json()) as SparqlResponse<T>;
  return data.results.bindings;
}

async function getEligibleShipCount(excludeIds: string[]): Promise<number> {
  const query = buildCountQuery(excludeIds);
  const results = await executeSparql<{ count: { value: string } }>(query);

  if (results.length === 0) {
    return 0;
  }

  return parseInt(results[0].count.value, 10);
}

// ============================================================================
// Ship Selection Functions
// ============================================================================

function extractEntityId(uri: string): string {
  const match = uri.match(/Q\d+$/);
  return match ? match[0] : uri;
}

function commonsFileToUrl(filename: string): string {
  let cleanName = filename.replace(/^(File:|Image:)/i, '');

  try {
    cleanName = decodeURIComponent(cleanName);
  } catch {
    // If decoding fails, it wasn't encoded
  }

  cleanName = cleanName.replace(/ /g, '_');

  const encoded = encodeURIComponent(cleanName)
    .replace(/%5F/g, '_')
    .replace(/%2F/g, '/');

  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}`;
}

function parseShipResult(results: WikidataShipResult[]): SelectedShip {
  const first = results[0];

  const conflicts = new Set<string>();
  for (const row of results) {
    if (row.conflictLabel?.value) {
      conflicts.add(row.conflictLabel.value);
    }
  }

  let country: string | null = null;
  if (first.countryLabel?.value) {
    country = first.countryLabel.value;
  } else if (first.operatorCountryLabel?.value) {
    country = first.operatorCountryLabel.value;
  } else if (first.operatorLabel?.value) {
    country = first.operatorLabel.value;
  }

  let wikipediaTitle: string | null = null;
  if (first.article?.value) {
    const match = first.article.value.match(/\/wiki\/(.+)$/);
    if (match) {
      wikipediaTitle = decodeURIComponent(match[1].replace(/_/g, ' '));
    }
  }

  let status: string | null = null;
  const decommissioned = first.decommissioned?.value
    ? new Date(first.decommissioned.value).getFullYear().toString()
    : null;

  if (first.statusLabel?.value) {
    status = first.statusLabel.value;
  } else if (decommissioned) {
    status = `Decommissioned ${decommissioned}`;
  } else {
    const conflictArray = Array.from(conflicts);
    const recentConflicts = conflictArray.filter((c) => {
      const lower = c.toLowerCase();
      return (
        lower.includes('iraq') ||
        lower.includes('afghan') ||
        lower.includes('gulf') ||
        lower.includes('syria') ||
        lower.includes('2000') ||
        lower.includes('2010') ||
        lower.includes('2020')
      );
    });
    if (recentConflicts.length > 0) {
      status = 'Active or recently active';
    }
  }

  return {
    id: extractEntityId(first.ship.value),
    name: first.shipLabel.value,
    imageUrl: first.image?.value
      ? commonsFileToUrl(first.image.value.split('/').pop() || '')
      : '',
    className: first.classLabel?.value || null,
    country,
    length: first.length?.value ? `${Math.round(parseFloat(first.length.value))}m` : null,
    displacement: first.displacement?.value
      ? `${Math.round(parseFloat(first.displacement.value)).toLocaleString()} tons`
      : null,
    commissioned: first.commissioned?.value
      ? new Date(first.commissioned.value).getFullYear().toString()
      : null,
    decommissioned,
    status,
    conflicts: Array.from(conflicts),
    wikipediaTitle,
  };
}

async function selectRandomShip(excludeIds: string[]): Promise<SelectedShip | null> {
  console.log(`Counting eligible ships (excluding ${excludeIds.length})...`);

  const count = await getEligibleShipCount(excludeIds);
  console.log(`Found ${count} eligible ships`);

  if (count === 0) {
    return null;
  }

  const offset = Math.floor(Math.random() * count);
  console.log(`Selecting ship at offset ${offset}...`);

  const query = buildShipQuery(excludeIds, offset);
  const results = await executeSparql<WikidataShipResult>(query);

  if (results.length === 0) {
    console.warn('No ship found at offset, retrying...');
    const newOffset = Math.floor(Math.random() * count);
    const retryResults = await executeSparql<WikidataShipResult>(
      buildShipQuery(excludeIds, newOffset)
    );
    if (retryResults.length === 0) {
      return null;
    }
    return parseShipResult(retryResults);
  }

  return parseShipResult(results);
}

// ============================================================================
// Clue Functions
// ============================================================================

async function fetchWikipediaSummary(title: string): Promise<WikipediaSummary | null> {
  try {
    const encodedTitle = encodeURIComponent(title.replace(/ /g, '_'));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Wikipedia summary fetch failed: ${response.status}`);
      return null;
    }

    return (await response.json()) as WikipediaSummary;
  } catch (error) {
    console.warn('Failed to fetch Wikipedia summary:', error);
    return null;
  }
}

function extractTrivia(summary: WikipediaSummary | null): string | null {
  if (!summary?.extract) {
    return null;
  }

  const text = summary.extract;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

  const interestingKeywords = [
    'famous', 'notable', 'first', 'last', 'only', 'largest', 'fastest',
    'sunk', 'battle', 'war', 'attack', 'served', 'participated',
    'known for', 'renamed', 'converted', 'museum', 'memorial',
    'preserved', 'film', 'movie',
  ];

  for (const sentence of sentences.slice(1)) {
    const lower = sentence.toLowerCase();
    if (interestingKeywords.some((kw) => lower.includes(kw))) {
      return sentence.trim();
    }
  }

  if (sentences.length > 1) {
    return sentences[1].trim();
  }

  if (summary.description) {
    return summary.description;
  }

  return null;
}

function buildSpecsClue(ship: SelectedShip): SpecsClue {
  return {
    class: ship.className,
    displacement: ship.displacement,
    length: ship.length,
    commissioned: ship.commissioned,
  };
}

function buildContextClue(ship: SelectedShip): ContextClue {
  return {
    nation: ship.country || 'Unknown',
    conflicts: ship.conflicts,
    status: ship.status,
  };
}

async function fetchClues(ship: SelectedShip): Promise<GameClues> {
  console.log(`Fetching clues for ${ship.name}...`);

  let trivia: string | null = null;
  if (ship.wikipediaTitle) {
    console.log(`  Fetching Wikipedia summary for ${ship.wikipediaTitle}...`);
    const summary = await fetchWikipediaSummary(ship.wikipediaTitle);
    trivia = extractTrivia(summary);
    if (trivia) {
      console.log(`  Found trivia: "${trivia.substring(0, 50)}..."`);
    }
  }

  return {
    specs: buildSpecsClue(ship),
    context: buildContextClue(ship),
    trivia,
    photo: ship.imageUrl,
  };
}

// ============================================================================
// Line Art Generation
// ============================================================================

let cvReady = false;
async function initCV(): Promise<void> {
  if (cvReady) return;
  await new Promise<void>((resolve) => {
    if (cv.Mat) {
      resolve();
    } else {
      cv.onRuntimeInitialized = () => resolve();
    }
  });
  cvReady = true;
}

function bufferToMat(buffer: Buffer, width: number, height: number): cv.Mat {
  const mat = new cv.Mat(height, width, cv.CV_8UC4);
  mat.data.set(buffer);
  return mat;
}

function matToBuffer(mat: cv.Mat): Buffer {
  return Buffer.from(mat.data);
}

async function downloadImage(url: string): Promise<Buffer> {
  console.log(`  Downloading image from ${url.substring(0, 60)}...`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'image/*,*/*',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function generateLineArtFromUrl(imageUrl: string): Promise<string> {
  const start = Date.now();

  await initCV();

  // 1. Download image
  const inputBuffer = await downloadImage(imageUrl);

  // 2. Preprocess for background removal
  console.log('  Preprocessing image...');
  const preprocessed = await sharp(inputBuffer)
    .resize(800, null, { withoutEnlargement: true })
    .toColorspace('srgb')
    .ensureAlpha()
    .png()
    .toBuffer();

  // 3. Remove background
  console.log('  Removing background (this may take a moment)...');
  const uint8Array = new Uint8Array(preprocessed);
  const blob = new Blob([uint8Array], { type: 'image/png' });
  const resultBlob = await removeBackground(blob);
  const noBgBuffer = Buffer.from(await resultBlob.arrayBuffer());

  // Get dimensions
  const { data, info } = await sharp(noBgBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // 4. Load into OpenCV
  console.log('  Generating line art...');
  const src = bufferToMat(data, width, height);
  const gray = new cv.Mat();
  const bilateral = new cv.Mat();
  const binary = new cv.Mat();
  const output = new cv.Mat();

  // 5. Convert to grayscale
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // 6. Bilateral filter
  cv.bilateralFilter(gray, bilateral, 9, 75, 75);

  // 7. Adaptive threshold
  cv.adaptiveThreshold(
    bilateral,
    binary,
    255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY,
    11,
    2
  );

  // 8. Apply alpha mask
  cv.cvtColor(binary, output, cv.COLOR_GRAY2RGBA);

  const outputData = matToBuffer(output);
  for (let i = 0; i < outputData.length; i += 4) {
    const originalAlpha = data[i + 3];
    if (originalAlpha === undefined || originalAlpha < 128) {
      outputData[i] = 255;
      outputData[i + 1] = 255;
      outputData[i + 2] = 255;
      outputData[i + 3] = 255;
    } else {
      outputData[i + 3] = 255;
    }
  }

  // 9. Export as PNG buffer
  const lineArt = await sharp(outputData, {
    raw: { width, height, channels: 4 },
  })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();

  // Cleanup OpenCV mats
  src.delete();
  gray.delete();
  bilateral.delete();
  binary.delete();
  output.delete();

  const timeMs = Date.now() - start;
  console.log(`  Line art generated in ${timeMs}ms (${width}x${height})`);

  return lineArt.toString('base64');
}

// ============================================================================
// Main Handler
// ============================================================================

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
): Promise<VercelResponse> {
  // Verify cron secret for security (Vercel sends this header for cron jobs)
  const authHeader = request.headers.authorization;
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('='.repeat(60));
    console.log('Keel Game Generator (Vercel Cron)');
    console.log('='.repeat(60));

    // 1. Load used ships from database
    const usedIds = await getUsedShipIds();
    console.log(`\nUsed ships: ${usedIds.length}`);

    // 2. Select random ship
    console.log('\nSelecting random ship...');
    const ship = await selectRandomShip(usedIds);

    if (!ship) {
      return response.status(500).json({
        error: 'No eligible ships found',
        message: 'Check query or reset used ships.',
      });
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
      return response.status(500).json({
        error: 'Failed to generate line art',
        details: error instanceof Error ? error.message : String(error),
      });
    }

    // 5. Build game data
    const shipIdentity: ShipIdentity = {
      id: ship.id,
      name: ship.name,
      aliases: [],
    };

    if (ship.className) {
      shipIdentity.aliases.push(ship.className);
    }

    const gameData: GameData = {
      date: new Date().toISOString().split('T')[0],
      ship: shipIdentity,
      silhouette: `data:image/png;base64,${silhouette}`,
      clues,
    };

    // 6. Save to Neon PostgreSQL
    console.log('\nSaving game data to database...');
    await saveGameData(gameData);

    // 7. Mark ship as used
    await markShipUsed(ship.id, ship.name);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Generation Complete!');
    console.log('='.repeat(60));

    return response.status(200).json({
      success: true,
      ship: {
        id: ship.id,
        name: ship.name,
      },
      date: gameData.date,
      clues: {
        specs: `${clues.specs.class || 'N/A'}, ${clues.specs.commissioned || 'N/A'}`,
        nation: clues.context.nation,
        conflicts: clues.context.conflicts.length,
        hasTrivia: !!clues.trivia,
      },
      silhouetteSizeKB: Math.round(silhouette.length / 1024),
    });
  } catch (error) {
    console.error('Generation failed:', error);
    return response.status(500).json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
