import { motion } from 'framer-motion';
import { RotateCcw, Trophy, TrendingDown, UserCheck, Home } from 'lucide-react';
import { useSound } from '../hooks/useSound';

const LOSS_IMAGES: string[] = [
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNml1MWoxaTU0cnlrbWpocmtrdzI3dmR2eXg1amdsOXAzYWExcWI1OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qiw4VaWbXYDQqK6mgm/giphy.gif',
];

const chosenImg = LOSS_IMAGES[Math.floor(Math.random() * LOSS_IMAGES.length)];

interface Props {
  score: number;
  highScore: number;
  playerName: string;
  onRestart: () => void;
  onContinueAs: () => void;
  onLeaderboard: () => void;
  onHome: () => void;
}

export function ResultScreen({
  score,
  highScore,
  playerName,
  onRestart,
  onContinueAs,
  onLeaderboard,
  onHome,
}: Props) {
  const isNewHighScore = score > 0 && score >= highScore;
  const { playTick } = useSound();

  return (
    <motion.div
      className="result-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="result-card"
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="result-img-wrap">
          <img src={chosenImg} alt="Game over reaction" className="result-img" />
        </div>

        <div className="result-icon-row">
          <TrendingDown size={32} className="result-icon" />
        </div>

        <h2 className="result-title">Unlucky, {playerName}!</h2>
        <p className="result-subtitle">Your answer was wrong.</p>

        <div className="result-scores">
          <div className="result-score-box">
            <span className="result-score-label">Your score</span>
            <motion.span
              className="result-score-value"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 250 }}
            >
              {score}
            </motion.span>
          </div>
          <div className="result-score-divider" />
          <div className="result-score-box">
            <span className="result-score-label">
              <Trophy size={13} style={{ marginRight: 4 }} />
              Best
            </span>
            <span className="result-score-value result-score-value--high">
              {highScore}
            </span>
          </div>
        </div>

        {isNewHighScore && (
          <motion.div
            className="result-new-high"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            🎉 New high score!
          </motion.div>
        )}

        <motion.button
          className="result-btn result-btn--continue"
          onClick={() => { playTick(); onContinueAs(); }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <UserCheck size={18} />
          Play again as {playerName}
        </motion.button>

        <div className="result-actions">
          <motion.button
            className="result-btn result-btn--secondary"
            onClick={() => { playTick(); onHome(); }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Home size={16} />
            Home
          </motion.button>
          <motion.button
            className="result-btn result-btn--secondary"
            onClick={() => { playTick(); onRestart(); }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <RotateCcw size={16} />
            Change name
          </motion.button>
          <motion.button
            className="result-btn result-btn--secondary"
            onClick={() => { playTick(); onLeaderboard(); }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Trophy size={16} />
            Leaderboard
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}