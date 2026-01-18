import { useState, useEffect, useCallback } from 'react';
import type { GameData, GuessResult } from './types/game';
import { GameLayout } from './components/Game/GameLayout';
import { Silhouette } from './components/Silhouette/Silhouette';
import { TurnIndicator } from './components/TurnIndicator/TurnIndicator';
import { SpecsClue } from './components/Clues/SpecsClue';
import { ContextClue } from './components/Clues/ContextClue';
import { TriviaClue } from './components/Clues/TriviaClue';
import { PhotoReveal } from './components/Clues/PhotoReveal';
import { ShipSearch } from './components/ShipSearch/ShipSearch';
import { GuessHistory, type GuessEntry } from './components/GuessHistory/GuessHistory';
import type { ShipListEntry } from './hooks/useShipSearch';
import './styles/animations.css';
import './App.css';

function App() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive demo state
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [guessResults, setGuessResults] = useState<GuessResult[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isWin, setIsWin] = useState(false);

  // Current turn is 1 + number of guesses made
  const currentTurn = guessResults.length + 1;
  const totalTurns = 5;

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

  const handleShipSelect = useCallback(
    (ship: ShipListEntry) => {
      if (!gameData || isGameComplete) return;

      // Check if the guess is correct
      const isCorrect =
        ship.id === gameData.ship.id ||
        ship.name.toLowerCase() === gameData.ship.name.toLowerCase() ||
        gameData.ship.aliases.some(
          (alias) => alias.toLowerCase() === ship.name.toLowerCase()
        );

      // Add to guess history
      const newGuess: GuessEntry = {
        shipName: ship.name,
        correct: isCorrect,
      };
      setGuesses((prev) => [...prev, newGuess]);

      // Add to guess results
      const result: GuessResult = isCorrect ? 'correct' : 'wrong';
      setGuessResults((prev) => [...prev, result]);

      // Check for game end
      if (isCorrect) {
        setIsWin(true);
        setIsGameComplete(true);
        console.log('Correct! You identified:', gameData.ship.name);
      } else if (guessResults.length + 1 >= totalTurns) {
        setIsGameComplete(true);
        console.log('Game over! The ship was:', gameData.ship.name);
      } else {
        console.log('Wrong guess:', ship.name, '- Try again!');
      }
    },
    [gameData, isGameComplete, guessResults.length]
  );

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
      guessHistory={<GuessHistory guesses={guesses} />}
      search={
        isGameComplete ? (
          <div className="game-result">
            <p className="game-result__text">
              {isWin
                ? `Congratulations! You identified ${gameData.ship.name}!`
                : `Game over! The ship was ${gameData.ship.name}.`}
            </p>
          </div>
        ) : (
          <ShipSearch onSelect={handleShipSelect} disabled={isGameComplete} />
        )
      }
    />
  );
}

export default App;
