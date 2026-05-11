import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NameEntry } from './components/NameEntry';
import { GameCard } from './components/GameCard';
import { VsDivider } from './components/VsDivider';
import { ScoreBar } from './components/ScoreBar';
import { ResultScreen } from './components/ResultScreen';
import { Leaderboard } from './components/Leaderboard';
import { useGameData } from './hooks/useGameData';
import {
  SELECTED_FIRST_BLOCKS,
  pickRandom,
  getMetricValue,
  addToLeaderboard,
  getLeaderboard,
  getHighScore,
} from './utils/gameLogic';
import type { Block, GameState, MetricKey } from './types';
import './App.css';

// default metric is currently fce_total since that's the most intuitive one
const DEFAULT_METRIC: MetricKey = 'fce_total';

function App() {
  const { blocks, loading, error } = useGameData(DEFAULT_METRIC);

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

  const selectedQueueRef = useRef<string[]>([...SELECTED_FIRST_BLOCKS]);

  // Helpers 

  // pick the next block and show selected queue first, then random
  const pickNext = useCallback(
    (exclude: Set<string>): Block | null => {
      
      // drain selected queue
      while (selectedQueueRef.current.length > 0) {
        const id = selectedQueueRef.current.shift()!;
        const b = blocks.find((bl) => bl.blockID === id);
        if (b && !exclude.has(id)) return b;
      }
      return pickRandom(blocks, exclude);
    },
    [blocks],
  );

  // game starts here after name entry
  const handleStart = useCallback(
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
        currentLeft: left,
        currentRight: right,
        usedBlockIds: used,
        lastAnswerCorrect: null,
        isAnimating: false,
      }));
    },
    [pickNext],
  );

  // handle a guess
  const handleGuess = useCallback(
    (guess: 'higher' | 'lower') => {
      setState((s) => {
        if (!s.currentLeft || !s.currentRight || s.isAnimating) return s;

        const leftVal = getMetricValue(s.currentLeft, s.currentMetric);
        const rightVal = getMetricValue(s.currentRight, s.currentMetric);

        const correct =
          guess === 'higher' ? rightVal >= leftVal : rightVal <= leftVal;

        if (!correct) {
          // wrong answer: show result briefly, then go to result screen
          return { ...s, isAnimating: true, lastAnswerCorrect: false };
        }

        // correct answer: reveal value, then slide
        return { ...s, isAnimating: true, lastAnswerCorrect: true };
      });
    },
    [],
  );

  // handle animation completion: either advance to next pair (if correct) or go to result screen (if wrong)
  useEffect(() => {
    if (!state.isAnimating) return;

    const delay = state.lastAnswerCorrect ? 1200 : 1400;

    const timer = setTimeout(() => {
      if (!state.lastAnswerCorrect) {
        // wrong answer: add to leaderboard, go to result
        const entry = {
          name: state.playerName,
          score: state.score,
          timestamp: new Date().toISOString(),
        };
        addToLeaderboard(entry);
        setState((s) => ({
          ...s,
          phase: 'result',
          highScore: getHighScore(),
          isAnimating: false,
        }));
      } else {
        // correct answer: advance: right becomes left, pick new right
        setState((s) => {
          const newUsed = new Set(s.usedBlockIds);
          const newLeft = s.currentRight!;
          const newRight = pickNext(newUsed);

          if (!newRight) {
            // all blocks exhausted: game complete (treat as win, go to result)
            const entry = {
              name: s.playerName,
              score: s.score + 1,
              timestamp: new Date().toISOString(),
            };
            addToLeaderboard(entry);
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
  }, [state.isAnimating, state.lastAnswerCorrect, pickNext]);

  // restart the game
  const handleRestart = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: 'name-entry',
      score: 0,
      highScore: getHighScore(),
    }));
  }, []);

  // loading and error states
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

              // reveal value while animating result
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
            onLeaderboard={() =>
              setState((s) => ({ ...s, phase: 'leaderboard' }))
            }
          />
        )}

        {state.phase === 'leaderboard' && (
          <Leaderboard
            key="leaderboard"
            entries={getLeaderboard()}
            currentPlayerName={state.playerName}
            onBack={() => setState((s) => ({ ...s, phase: 'result' }))}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;