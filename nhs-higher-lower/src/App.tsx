import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { HomePage } from './components/HomePage';
import { NameEntry } from './components/NameEntry';
import { GameCard } from './components/GameCard';
import { VsDivider } from './components/VsDivider';
import { ScoreBar } from './components/ScoreBar';
import { ResultScreen } from './components/ResultScreen';
import { Leaderboard } from './components/Leaderboard';
import { Confetti } from './components/Confetti';
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
  isUnclassified,
} from './utils/gameLogic';
import type { Block, GameState, MetricKey, GranularityKey } from './types';
import './App.css';

const DEFAULT_METRIC: MetricKey = 'fce_total';
const DEFAULT_GRANULARITY: GranularityKey = 'block';

function App() {
  const [currentGranularity, setCurrentGranularity] = useState<GranularityKey>(DEFAULT_GRANULARITY);
  const { blocks, loading, error } = useGameData(currentGranularity);
  const { playCorrect, playWrong } = useSound();

  const [state, setState] = useState<GameState>({
    phase: 'home',
    playerName: '',
    score: 0,
    highScore: getHighScore(),
    currentLeft: null,
    currentRight: null,
    usedBlockIds: new Set(),
    currentMetric: DEFAULT_METRIC,
    currentGranularity: DEFAULT_GRANULARITY,
    isAnimating: false,
    lastAnswerCorrect: null,
  });

  // Confetti: increment to trigger a burst
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const prevScoreRef = useRef(0);

  const [lbKey, setLbKey] = useState(0);
  const selectedQueueRef = useRef<string[]>([...SELECTED_FIRST_BLOCKS]);

  const pickNext = useCallback(
    (exclude: Set<string>): Block | null => {
      // Try from curated queue first, skipping unclassified
      while (selectedQueueRef.current.length > 0) {
        const id = selectedQueueRef.current.shift()!;
        const b = blocks.find((bl) => bl.blockID === id);
        if (b && !exclude.has(id) && !isUnclassified(b)) return b;
      }
      return pickRandom(blocks, exclude);
    },
    [blocks],
  );

  const startGame = useCallback(
    (name: string, metric: MetricKey, granularity: GranularityKey) => {
      selectedQueueRef.current = [...SELECTED_FIRST_BLOCKS];
      prevScoreRef.current = 0;
      const used = new Set<string>();
      const left = pickNext(used)!;
      if (!left) return;
      used.add(left.blockID);
      const right = pickNext(used);
      if (!right) return;
      used.add(right.blockID);

      setState((s) => ({
        ...s,
        phase: 'playing',
        playerName: name,
        score: 0,
        highScore: Math.max(getHighScore(), getPlayerBestScore(name)),
        currentLeft: left,
        currentRight: right,
        usedBlockIds: used,
        currentMetric: metric,
        currentGranularity: granularity,
        lastAnswerCorrect: null,
        isAnimating: false,
      }));
    },
    [pickNext],
  );

  // From home page: set settings + go to name entry
  const handleHomePlay = useCallback(
    (metric: MetricKey, granularity: GranularityKey) => {
      setCurrentGranularity(granularity);
      setState((s) => ({
        ...s,
        phase: 'name-entry',
        currentMetric: metric,
        currentGranularity: granularity,
      }));
    },
    [],
  );

  const handleStart = useCallback(
    (name: string) => {
      startGame(name, state.currentMetric, state.currentGranularity);
    },
    [startGame, state.currentMetric, state.currentGranularity],
  );

  const handleContinueAs = useCallback(() => {
    startGame(state.playerName, state.currentMetric, state.currentGranularity);
  }, [startGame, state.playerName, state.currentMetric, state.currentGranularity]);

  const handleRestart = useCallback(() => {
    setState((s) => ({ ...s, phase: 'name-entry', score: 0, highScore: getHighScore() }));
  }, []);

  const handleHome = useCallback(() => {
    setState((s) => ({ ...s, phase: 'home', highScore: getHighScore() }));
  }, []);

  const handleGuess = useCallback((guess: 'higher' | 'lower') => {
    setState((s) => {
      if (!s.currentLeft || !s.currentRight || s.isAnimating) return s;
      const leftVal  = getMetricValue(s.currentLeft, s.currentMetric);
      const rightVal = getMetricValue(s.currentRight, s.currentMetric);
      const correct  = guess === 'higher' ? rightVal >= leftVal : rightVal <= leftVal;
      return { ...s, isAnimating: true, lastAnswerCorrect: correct };
    });
  }, []);

  // Handle answer resolution
  useEffect(() => {
    if (!state.isAnimating) return;

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
          const newScore = s.score + 1;

          // Confetti on multiples of 5
          if (newScore % 5 === 0) {
            setConfettiTrigger((t) => t + 1);
          }

          const newUsed = new Set(s.usedBlockIds);
          const newLeft  = s.currentRight!;
          const newRight = pickNext(newUsed);

          if (!newRight) {
            addToLeaderboard({
              name: s.playerName,
              score: newScore,
              timestamp: new Date().toISOString(),
            });
            return {
              ...s,
              score: newScore,
              phase: 'result',
              highScore: getHighScore(),
              isAnimating: false,
            };
          }

          newUsed.add(newRight.blockID);
          return {
            ...s,
            score: newScore,
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
  }, [state.isAnimating, state.lastAnswerCorrect, pickNext, playCorrect, playWrong]);

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
      {/* Confetti canvas — sits above everything, pointer-events none */}
      <Confetti trigger={confettiTrigger} />

      <AnimatePresence mode="wait">
        {state.phase === 'home' && (
          <HomePage
            key="home"
            onPlay={handleHomePlay}
            onLeaderboard={() => setState((s) => ({ ...s, phase: 'leaderboard' }))}
            highScore={state.highScore}
          />
        )}

        {state.phase === 'name-entry' && (
          <NameEntry
            key="name-entry"
            onStart={handleStart}
            onBack={handleHome}
          />
        )}

        {state.phase === 'playing' && state.currentLeft && state.currentRight && (
          <div key="playing" className="game-layout">
            <GameCard
              block={state.currentLeft}
              side="left"
              revealed
              metric={state.currentMetric}
            />
            <VsDivider/>
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
              onHome={handleHome}
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
            onHome={handleHome}
          />
        )}

        {state.phase === 'leaderboard' && (
          <Leaderboard
            key={`leaderboard-${lbKey}`}
            entries={getLeaderboard()}
            currentPlayerName={state.playerName}
            onBack={() => setState((s) => ({ ...s, phase: state.score > 0 ? 'result' : 'home' }))}
            onRestart={handleRestart}
            onImported={() => setLbKey((k) => k + 1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;