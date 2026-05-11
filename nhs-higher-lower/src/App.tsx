import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NameEntry } from './components/NameEntry';
import { GameCard } from './components/GameCard';
import { VsDivider } from './components/VsDivider';
import { ScoreBar } from './components/ScoreBar';
import { ResultScreen } from './components/ResultScreen';
import { Leaderboard } from './components/Leaderboard';
import { useGameData } from './hooks/useGameData';
import { useSound } from './hooks/useSound';
import {
  SELECTED_FIRST_BLOCKS,
  pickRandom,
  getMetricValue,
  addToLeaderboard,
  getLeaderboard,
  getHighScore,
  getPlayerBestScore,
} from './utils/gameLogic';
import type { Block, GameState, MetricKey } from './types';
import './App.css';

const DEFAULT_METRIC: MetricKey = 'fce_total';

function App() {
  const { blocks, loading, error } = useGameData(DEFAULT_METRIC);
  const { playCorrect, playWrong, playTick } = useSound();

  const [state, setState] = useState<GameState>({
    phase: 'name-entry',
    playerName: '',
    score: 0,
    highScore: getHighScore(),
    currentLeft: null,
    currentRight: null,
    usedBlockIds: new Set(),
    currentMetric: DEFAULT_METRIC,
    isAnimating: false,
    lastAnswerCorrect: null,
  });

  // Force re-render of leaderboard after import
  const [lbKey, setLbKey] = useState(0);

  const selectedQueueRef = useRef<string[]>([...SELECTED_FIRST_BLOCKS]);

  const pickNext = useCallback(
    (exclude: Set<string>): Block | null => {
      while (selectedQueueRef.current.length > 0) {
        const id = selectedQueueRef.current.shift()!;
        const b = blocks.find((bl) => bl.blockID === id);
        if (b && !exclude.has(id)) return b;
      }
      return pickRandom(blocks, exclude);
    },
    [blocks],
  );

  // Start / restart as a given name
  const startGame = useCallback(
    (name: string) => {
      selectedQueueRef.current = [...SELECTED_FIRST_BLOCKS];
      const used = new Set<string>();
      const left = pickNext(used)!;
      used.add(left.blockID);
      const right = pickNext(used)!;
      used.add(right.blockID);

      setState((s) => ({
        ...s,
        phase: 'playing',
        playerName: name,
        score: 0,
        // Show this player's personal best (or global high score if higher)
        highScore: Math.max(getHighScore(), getPlayerBestScore(name)),
        currentLeft: left,
        currentRight: right,
        usedBlockIds: used,
        lastAnswerCorrect: null,
        isAnimating: false,
      }));
    },
    [pickNext],
  );

  const handleStart = useCallback((name: string) => startGame(name), [startGame]);

  // "Play again as X" — same name, fresh game
  const handleContinueAs = useCallback(() => {
    startGame(state.playerName);
  }, [startGame, state.playerName]);

  // "Change name" — back to name-entry
  const handleRestart = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: 'name-entry',
      score: 0,
      highScore: getHighScore(),
    }));
  }, []);

  // Guess handler
  const handleGuess = useCallback((guess: 'higher' | 'lower') => {
    setState((s) => {
      if (!s.currentLeft || !s.currentRight || s.isAnimating) return s;
      const leftVal = getMetricValue(s.currentLeft, s.currentMetric);
      const rightVal = getMetricValue(s.currentRight, s.currentMetric);
      const correct = guess === 'higher' ? rightVal >= leftVal : rightVal <= leftVal;
      return { ...s, isAnimating: true, lastAnswerCorrect: correct };
    });
  }, []);

  useEffect(() => {
    if (!state.isAnimating) return;

    // Play sound immediately when answer is known
    if (state.lastAnswerCorrect) {
      playCorrect();
    } else {
      playWrong();
    }

    const delay = state.lastAnswerCorrect ? 1200 : 1400;

    const timer = setTimeout(() => {
      if (!state.lastAnswerCorrect) {
        addToLeaderboard({
          name: state.playerName,
          score: state.score,
          timestamp: new Date().toISOString(),
        });
        setState((s) => ({
          ...s,
          phase: 'result',
          highScore: getHighScore(),
          isAnimating: false,
        }));
      } else {
        setState((s) => {
          const newUsed = new Set(s.usedBlockIds);
          const newLeft = s.currentRight!;
          const newRight = pickNext(newUsed);

          if (!newRight) {
            addToLeaderboard({
              name: s.playerName,
              score: s.score + 1,
              timestamp: new Date().toISOString(),
            });
            return {
              ...s,
              score: s.score + 1,
              phase: 'result',
              highScore: getHighScore(),
              isAnimating: false,
            };
          }

          newUsed.add(newRight.blockID);
          return {
            ...s,
            score: s.score + 1,
            currentLeft: newLeft,
            currentRight: newRight,
            usedBlockIds: newUsed,
            isAnimating: false,
            lastAnswerCorrect: null,
          };
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  // playCorrect/playWrong are stable refs, safe to include
  }, [state.isAnimating, state.lastAnswerCorrect, pickNext, playCorrect, playWrong]);

  // Loading / error
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading NHS data…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app-loading">
        <p className="app-error">Failed to load data: {error}</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="team-badge">
        Team 3
      </div>
      <AnimatePresence mode="wait">
        {state.phase === 'name-entry' && (
          <NameEntry key="name-entry" onStart={handleStart} />
        )}

        {state.phase === 'playing' && state.currentLeft && state.currentRight && (
          <div key="playing" className="game-layout">
            <GameCard
              block={state.currentLeft}
              side="left"
              revealed
              metric={state.currentMetric}
            />
            <VsDivider />
            <GameCard
              block={state.currentRight}
              side="right"
              revealed={state.isAnimating}
              metric={state.currentMetric}
              onHigher={() => handleGuess('higher')}
              onLower={() => handleGuess('lower')}
              isAnimating={state.isAnimating}
              answerCorrect={state.isAnimating ? state.lastAnswerCorrect : null}
            />
            <ScoreBar
              score={state.score}
              highScore={state.highScore}
              playerName={state.playerName}
            />
          </div>
        )}

        {state.phase === 'result' && (
          <ResultScreen
            key="result"
            score={state.score}
            highScore={state.highScore}
            playerName={state.playerName}
            onRestart={handleRestart}
            onContinueAs={handleContinueAs}
            onLeaderboard={() => setState((s) => ({ ...s, phase: 'leaderboard' }))}
          />
        )}

        {state.phase === 'leaderboard' && (
          <Leaderboard
            key={`leaderboard-${lbKey}`}
            entries={getLeaderboard()}
            currentPlayerName={state.playerName}
            onBack={() => setState((s) => ({ ...s, phase: 'result' }))}
            onRestart={handleRestart}
            onImported={() => setLbKey((k) => k + 1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;