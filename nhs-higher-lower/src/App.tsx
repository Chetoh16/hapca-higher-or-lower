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
  getHighScore,
  getPlayerBestScore,
  isUnclassified,
  startSession,
  getLeaderboard,
  submitScore,
} from './utils/gameLogic';
import type { Block, GameState, MetricKey, GranularityKey, LeaderboardEntry } from './types';
import './App.css';

const DEFAULT_METRIC: MetricKey = 'fae_total';
const DEFAULT_GRANULARITY: GranularityKey = 'block';

function App() {
  const [currentGranularity, setCurrentGranularity] = useState<GranularityKey>(DEFAULT_GRANULARITY);
  const { blocks, loading, error } = useGameData(currentGranularity);
  const { playCorrect, playWrong } = useSound();

  // the signed token needed to submit a score
  const [sessionToken, setSessionToken] = useState('');

  // the actual leaderboard rows fetched from the server (Leaderboard.tsx just renders this)
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);

  const [state, setState] = useState<GameState>({
    phase: 'home',
    playerName: '',
    score: 0,
    highScore: 0,
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

  const selectedQueueRef = useRef<string[]>([...SELECTED_FIRST_BLOCKS]);

  // fetches the global leaderboard from the server and refreshes the local cache/highScore.
  // called on load, whenever the leaderboard screen is opened, and after a score submits.
  const refreshLeaderboard = useCallback(async () => {
    try {
      const entries = await getLeaderboard();
      setLeaderboardEntries(entries);
      setState((s) => ({ ...s, highScore: getHighScore() }));
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    }
  }, []);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);


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

  // every new game has its own session token 
  const handleStart = useCallback(
    async (name: string) => {
      try {
        const token = await startSession(name);
        setSessionToken(token);
        startGame(name, state.currentMetric, state.currentGranularity);
      } catch (err) {
        console.error('Failed to start session', err);
      }
    },
    [startGame, state.currentMetric, state.currentGranularity],
  );


  const handleContinueAs = useCallback(async () => {
    try {
      const token = await startSession(state.playerName);
      setSessionToken(token);
      startGame(state.playerName, state.currentMetric, state.currentGranularity);
    } catch (err) {
      console.error('Failed to start session', err);
    }
  }, [startGame, state.playerName, state.currentMetric, state.currentGranularity]);

  const handleRestart = useCallback(() => {
    setState((s) => ({ ...s, phase: 'name-entry', score: 0 }));
  }, []);

  const handleHome = useCallback(() => {
    setState((s) => ({ ...s, phase: 'home' }));
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const handleGuess = useCallback((guess: 'higher' | 'lower') => {
    setState((s) => {
      if (!s.currentLeft || !s.currentRight || s.isAnimating) return s;
      const leftVal = getMetricValue(s.currentLeft, s.currentMetric);
      const rightVal = getMetricValue(s.currentRight, s.currentMetric);
      const correct = guess === 'higher' ? rightVal >= leftVal : rightVal <= leftVal;
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

    const timer = setTimeout(async () => {
      if (!state.lastAnswerCorrect) {
        try {
          await submitScore(
            {
              username: state.playerName,
              score: state.score,
              metric: state.currentMetric,
              granularity: state.currentGranularity,
            },
            sessionToken,
          );
        } catch (err) {
          console.error('Failed to submit score', err);
        }

        setState((s) => ({
          ...s,
          phase: 'result',
          highScore: getHighScore(),
          isAnimating: false,
        }));
        return;
      }

      setState((s) => {
        const newScore = s.score + 1;

        if (newScore % 5 === 0) {
          setConfettiTrigger((t) => t + 1);
        }

        const newUsed = new Set(s.usedBlockIds);
        const newLeft = s.currentRight!;
        const newRight = pickNext(newUsed);

        // ran out of diseases to compare so treat it as the end of the run
        if (!newRight) {
          submitScore(
            {
              username: s.playerName,
              score: newScore,
              metric: s.currentMetric,
              granularity: s.currentGranularity,
            },
            sessionToken,
          ).catch((err) => console.error('Failed to submit score', err));

          return {
            ...s,
            score: newScore,
            phase: 'result',
            highScore: Math.max(getHighScore(), newScore),
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
    }, delay);

    return () => clearTimeout(timer);
  }, [
    state.isAnimating,
    state.lastAnswerCorrect,
    pickNext,
    playCorrect,
    playWrong,
    sessionToken,
    state.playerName,
    state.score,
    state.currentMetric,
    state.currentGranularity,
  ]);
  
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
      {/* Confetti canvas - sits above everything, pointer-events none */}
      <Confetti trigger={confettiTrigger} />

      <AnimatePresence mode="wait">
        {state.phase === 'home' && (
          <HomePage
            key="home"
            onPlay={handleHomePlay}
            onLeaderboard={() => {
              refreshLeaderboard();
              setState((s) => ({ ...s, phase: 'leaderboard' }));
            }}
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
            onLeaderboard={() => {
              refreshLeaderboard();
              setState((s) => ({ ...s, phase: 'leaderboard' }));
            }}
            onHome={handleHome}
          />
        )}

        {state.phase === 'leaderboard' && (
          <Leaderboard
            key="leaderboard"
            entries={leaderboardEntries}
            currentPlayerName={state.playerName}
            onBack={() => setState((s) => ({ ...s, phase: state.score > 0 ? 'result' : 'home' }))}
            onRestart={handleRestart}
            onRefresh={refreshLeaderboard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;