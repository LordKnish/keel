import { useState, useEffect, useCallback, useRef } from 'react';
import Confetti from 'react-confetti';
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
import { WinModal } from './components/WinModal/WinModal';
import type { ShipListEntry } from './hooks/useShipSearch';
import './styles/animations.css';
import './App.css';

function App() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive demo state
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [guessedIds, setGuessedIds] = useState<string[]>([]);
  const [guessResults, setGuessResults] = useState<GuessResult[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  
  // Win reveal state - reveals clues sequentially on win
  const [winRevealStep, setWinRevealStep] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  // Timer state
  const startTimeRef = useRef<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);

  // Window dimensions for confetti
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Current turn is 1 + number of guesses made
  const currentTurn = guessResults.length + 1;
  const totalTurns = 5;

  // Start timer when game data loads
  useEffect(() => {
    if (gameData && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  }, [gameData]);

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadGameData() {
      try {
        const response = await fetch('/api/game/today');
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

  // Sequential reveal effect on win
  useEffect(() => {
    if (!isRevealing) return;

    const maxSteps = 4; // specs, context, trivia, photo (0-3 indexes)
    if (winRevealStep >= maxSteps) {
      setIsRevealing(false);
      // Wait 1 second after all clues are revealed, then show modal
      const modalTimer = setTimeout(() => {
        setShowWinModal(true);
      }, 1000);
      return () => clearTimeout(modalTimer);
    }

    const timer = setTimeout(() => {
      setWinRevealStep((prev) => prev + 1);
    }, 600); // 600ms between each reveal

    return () => clearTimeout(timer);
  }, [isRevealing, winRevealStep]);

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
      setGuessedIds((prev) => [...prev, ship.id]);

      // Add to guess results
      const result: GuessResult = isCorrect ? 'correct' : 'wrong';
      setGuessResults((prev) => [...prev, result]);

      // Check for game end
      if (isCorrect) {
        // Calculate time taken
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setTimeTaken(elapsed);
        }
        
        setIsWin(true);
        setIsGameComplete(true);
        setShowConfetti(true);
        setIsRevealing(true);
        setWinRevealStep(0);
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

  // Calculate which clues to reveal (normal game flow or win reveal)
  const getClueRevealed = (clueIndex: number): boolean => {
    // After win, keep all clues revealed
    if (isWin && !isRevealing) {
      return true;
    }
    if (isWin && isRevealing) {
      // During win reveal, show clues based on winRevealStep
      return winRevealStep >= clueIndex;
    }
    // Normal gameplay - reveal based on current turn
    return currentTurn >= clueIndex + 1;
  };

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
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
      <WinModal
        isOpen={showWinModal}
        shipName={gameData.ship.name}
        guessCount={guessResults.length}
        totalTurns={totalTurns}
        guessResults={guessResults}
        timeTaken={timeTaken}
        onClose={() => setShowWinModal(false)}
      />
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
            photoUrl={gameData.clues.photo}
            shipName={gameData.ship.name}
            showPhoto={getClueRevealed(4) || currentTurn >= 5}
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
              revealed={getClueRevealed(1) || currentTurn >= 2}
            />
            <ContextClue
              data={gameData.clues.context}
              revealed={getClueRevealed(2) || currentTurn >= 3}
            />
            <TriviaClue
              text={gameData.clues.trivia}
              revealed={getClueRevealed(3) || currentTurn >= 4}
            />
            <PhotoReveal
              photoUrl={gameData.clues.photo}
              shipName={gameData.ship.name}
              revealed={getClueRevealed(4) || currentTurn >= 5}
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
              {isWin && !showWinModal && (
                <button
                  className="game-result__share-button"
                  onClick={() => setShowWinModal(true)}
                  type="button"
                >
                  Share Result 📋
                </button>
              )}
            </div>
          ) : (
            <ShipSearch onSelect={handleShipSelect} disabled={isGameComplete} excludeIds={guessedIds} />
          )
        }
      />
    </>
  );
}

export default App;
