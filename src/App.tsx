import { useState, useEffect } from 'react';
import type { GameData, GuessResult } from './types/game';
import { GameLayout } from './components/Game/GameLayout';
import { Silhouette } from './components/Silhouette/Silhouette';
import { TurnIndicator } from './components/TurnIndicator/TurnIndicator';
import { SpecsClue } from './components/Clues/SpecsClue';
import { ContextClue } from './components/Clues/ContextClue';
import { TriviaClue } from './components/Clues/TriviaClue';
import { PhotoReveal } from './components/Clues/PhotoReveal';
import './styles/animations.css';
import './App.css';

function App() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo state - hardcoded for testing different turn states
  const [currentTurn] = useState(3);
  const [guessResults] = useState<GuessResult[]>(['wrong', 'wrong']);

  useEffect(() => {
    async function loadGameData() {
      try {
        const response = await fetch('/game-data.json');
        if (!response.ok) {
          throw new Error(`Failed to load game data: ${response.status}`);
        }
        const data: GameData = await response.json();
        setGameData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadGameData();
  }, []);

  if (loading) {
    return (
      <div className="app app--loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="app app--error">
        <h1>Keel</h1>
        <p className="error-message">Failed to load game data: {error}</p>
      </div>
    );
  }

  const totalTurns = 5;

  return (
    <GameLayout
      header={
        <>
          <h1 className="app-title">Keel</h1>
          <p className="app-tagline">Daily warship guessing game</p>
        </>
      }
      silhouette={
        <Silhouette
          src={gameData.silhouette}
          alt="Mystery warship silhouette"
        />
      }
      turnIndicator={
        <TurnIndicator
          currentTurn={currentTurn}
          totalTurns={totalTurns}
          guessResults={guessResults}
        />
      }
      clues={
        <>
          <SpecsClue
            data={gameData.clues.specs}
            revealed={currentTurn >= 2}
          />
          <ContextClue
            data={gameData.clues.context}
            revealed={currentTurn >= 3}
          />
          <TriviaClue
            text={gameData.clues.trivia}
            revealed={currentTurn >= 4}
          />
          <PhotoReveal
            photoUrl={gameData.clues.photo}
            shipName={gameData.ship.name}
            revealed={currentTurn >= 5}
          />
        </>
      }
      footer={
        <div className="search-placeholder">
          <p className="search-placeholder__text">
            Search input coming in Phase 5, Plan 2
          </p>
        </div>
      }
    />
  );
}

export default App;
