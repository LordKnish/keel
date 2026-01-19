/**
 * API endpoint to fetch today's game data.
 * GET /api/game/today?mode=main
 *
 * Query parameters:
 *   mode: 'main' | 'ww2' | 'coldwar' | 'carrier' | 'submarine' | 'coastguard'
 *         Defaults to 'main' if not specified.
 *   all: If present, returns a summary of all available modes (for curl convenience)
 *
 * Main mode is fetched from the database.
 * Bonus modes are read from static JSON files.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

type GameModeId = 'main' | 'ww2' | 'coldwar' | 'carrier' | 'submarine' | 'coastguard';

const VALID_MODES: GameModeId[] = ['main', 'ww2', 'coldwar', 'carrier', 'submarine', 'coastguard'];

interface GameData {
  date: string;
  ship: {
    id: string;
    name: string;
    aliases: string[];
  };
  silhouette: string;
  clues: {
    specs: {
      class: string | null;
      displacement: string | null;
      length: string | null;
      commissioned: string | null;
    };
    context: {
      nation: string;
      conflicts: string[];
      status: string | null;
    };
    trivia: string | null;
    photo: string;
  };
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
): Promise<VercelResponse> {
  // Allow CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    // Handle 'all' query - return available modes summary
    if ('all' in request.query) {
      const modes = VALID_MODES.map((modeId) => ({
        mode: modeId,
        endpoint: `/api/game/today?mode=${modeId}`,
        staticFile: `/game-data-${modeId}.json`,
      }));
      return response.status(200).json({
        availableModes: modes,
        usage: 'curl /api/game/today?mode=ww2',
      });
    }

    // Parse and validate mode parameter
    const modeParam = request.query.mode;
    const mode: GameModeId = typeof modeParam === 'string' && VALID_MODES.includes(modeParam as GameModeId)
      ? (modeParam as GameModeId)
      : 'main';

    // For bonus modes, try to read from static JSON file
    if (mode !== 'main') {
      // In Vercel, public files are in the root of the deployment
      const staticPath = join(process.cwd(), 'public', `game-data-${mode}.json`);

      if (existsSync(staticPath)) {
        const fileContent = readFileSync(staticPath, 'utf-8');
        const gameData = JSON.parse(fileContent);

        // Cache for 5 minutes
        response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
        return response.status(200).json(gameData);
      }

      return response.status(404).json({
        error: `Game data not available for mode '${mode}'`,
        hint: `Static file /game-data-${mode}.json not found`,
      });
    }

    // Get today's date in UTC
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's game from database
    const result = await sql`
      SELECT
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
      FROM game_data
      WHERE game_date = ${today}::date
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return response.status(404).json({
        error: 'No game found for today',
        date: today,
      });
    }

    const row = result.rows[0];

    // Transform database row to GameData format
    const gameData: GameData = {
      date: row.game_date.toISOString().split('T')[0],
      ship: {
        id: row.ship_id,
        name: row.ship_name,
        aliases: row.ship_aliases || [],
      },
      silhouette: row.silhouette,
      clues: {
        specs: {
          class: row.clues_specs_class,
          displacement: row.clues_specs_displacement,
          length: row.clues_specs_length,
          commissioned: row.clues_specs_commissioned,
        },
        context: {
          nation: row.clues_context_nation,
          conflicts: row.clues_context_conflicts || [],
          status: row.clues_context_status,
        },
        trivia: row.clues_trivia,
        photo: row.clues_photo,
      },
    };

    // Cache for 5 minutes
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    return response.status(200).json(gameData);
  } catch (error) {
    console.error('Failed to fetch game data:', error);
    return response.status(500).json({
      error: 'Failed to fetch game data',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
