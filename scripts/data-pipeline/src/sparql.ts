/**
 * Ship type Wikidata entity IDs.
 */
export const SHIP_TYPES = {
  warship: 'Q3114762',
  destroyer: 'Q174736',
  battleship: 'Q182531',
  aircraftCarrier: 'Q17205',
  cruiser: 'Q104843',
  frigate: 'Q161705',
  corvette: 'Q170013',
  submarine: 'Q2811',
} as const;

/**
 * Wikidata property IDs.
 */
export const PROPERTIES = {
  instanceOf: 'P31',
  subclassOf: 'P279',
  image: 'P18',
  vesselClass: 'P289',
  country: 'P17',
  operator: 'P137',
  length: 'P2043',
  beam: 'P2261',
  commissioned: 'P729',
  decommissioned: 'P730',
  conflict: 'P607',
} as const;

export interface QueryOptions {
  /** Ship type to query (defaults to all warships) */
  shipType?: keyof typeof SHIP_TYPES;
  /** Only include ships with images */
  requireImage?: boolean;
  /** Maximum results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Build SPARQL query for warships with optional filters.
 */
export function buildWarshipQuery(options: QueryOptions = {}): string {
  const {
    shipType,
    requireImage = true,
    limit = 100,
    offset = 0,
  } = options;

  const typeFilter = shipType
    ? `wd:${SHIP_TYPES[shipType]}`
    : `wd:${SHIP_TYPES.warship}`;

  // Use subclass traversal to include all warship types
  const instancePattern = shipType
    ? `?ship wdt:P31 ${typeFilter} .`
    : `?ship wdt:P31/wdt:P279* ${typeFilter} .`;

  const imagePattern = requireImage
    ? `?ship wdt:P18 ?image .`
    : `OPTIONAL { ?ship wdt:P18 ?image . }`;

  return `
SELECT DISTINCT
  ?ship ?shipLabel
  ?type ?typeLabel
  ?image
  ?class ?classLabel
  ?country ?countryLabel
  ?length ?beam
  ?commissioned
  ?article
WHERE {
  ${instancePattern}
  ?ship wdt:P31 ?type .
  ${imagePattern}

  OPTIONAL { ?ship wdt:P289 ?class . }
  OPTIONAL { ?ship wdt:P17 ?country . }
  OPTIONAL { ?ship wdt:P2043 ?length . }
  OPTIONAL { ?ship wdt:P2261 ?beam . }
  OPTIONAL { ?ship wdt:P729 ?commissioned . }

  # Get English Wikipedia article if exists
  OPTIONAL {
    ?article schema:about ?ship ;
             schema:isPartOf <https://en.wikipedia.org/> .
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY ?shipLabel
LIMIT ${limit}
OFFSET ${offset}
  `.trim();
}

/**
 * Build query to count total warships with images.
 */
export function buildCountQuery(shipType?: keyof typeof SHIP_TYPES): string {
  const typeFilter = shipType
    ? `wd:${SHIP_TYPES[shipType]}`
    : `wd:${SHIP_TYPES.warship}`;

  const instancePattern = shipType
    ? `?ship wdt:P31 ${typeFilter} .`
    : `?ship wdt:P31/wdt:P279* ${typeFilter} .`;

  return `
SELECT (COUNT(DISTINCT ?ship) AS ?count)
WHERE {
  ${instancePattern}
  ?ship wdt:P18 ?image .
}
  `.trim();
}

/**
 * Get the Wikidata SPARQL endpoint URL.
 */
export function getSparqlEndpoint(): string {
  return 'https://query.wikidata.org/sparql';
}

/**
 * Convert Commons filename to full URL.
 * The filename from Wikidata may already be URL-encoded, so we need to handle both cases.
 * Example: "Moreno%20Battleship%20LOC%2017604.jpg" or "USS Enterprise (CV-6).jpg"
 *       -> "https://commons.wikimedia.org/wiki/Special:FilePath/Moreno_Battleship_LOC_17604.jpg"
 */
export function commonsFileToUrl(filename: string): string {
  // Remove "File:" prefix if present
  let cleanName = filename.replace(/^(File:|Image:)/i, '');

  // First decode if it's already URL-encoded (from Wikidata)
  try {
    cleanName = decodeURIComponent(cleanName);
  } catch {
    // If decoding fails, it wasn't encoded
  }

  // Replace spaces with underscores (Commons convention)
  cleanName = cleanName.replace(/ /g, '_');

  // Now properly encode for URL, but preserve underscores
  const encoded = encodeURIComponent(cleanName)
    .replace(/%5F/g, '_')  // Keep underscores
    .replace(/%2F/g, '/'); // Keep slashes if any

  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}`;
}

/**
 * Extract Wikidata entity ID from URI.
 * Example: "http://www.wikidata.org/entity/Q12345" -> "Q12345"
 */
export function extractEntityId(uri: string): string {
  const match = uri.match(/Q\d+$/);
  return match ? match[0] : uri;
}
