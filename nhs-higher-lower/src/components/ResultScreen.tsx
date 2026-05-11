import { motion } from 'framer-motion';
import { RotateCcw, Trophy, TrendingDown } from 'lucide-react';

// placeholder loss images/gifs
// add something funnier
const LOSS_IMAGES: string[] = [
  'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
  'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  'https://media.giphy.com/media/26ufnwz3wDUli7GU0/giphy.gif',
];

interface Props {
  score: number;
  highScore: number;
  playerName: string;
  onRestart: () => void;
  onLeaderboard: () => void;
}

export function ResultScreen({
  score,
  highScore,
  playerName,
  onRestart,
  onLeaderboard,
}: Props) {
  const imgSrc = LOSS_IMAGES[Math.floor(Math.random() * LOSS_IMAGES.length)];
  const isNewHighScore = score > 0 && score >= highScore;

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
        {/* Reaction image / gif */}
        <div className="result-img-wrap">
          <img
            src={imgSrc}
            alt="Game over reaction"
            className="result-img"
          />
        </div>

        <div className="result-icon-row">
          <TrendingDown size={32} className="result-icon" />
        </div>

        <h2 className="result-title">Unlucky, {playerName}!</h2>
        <p className="result-subtitle">Your answer was wrong.</p>

        {/* Score display */}
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

        {/* CTA buttons */}
        <div className="result-actions">
          <motion.button
            className="result-btn result-btn--primary"
            onClick={onRestart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <RotateCcw size={18} />
            Play Again
          </motion.button>
          <motion.button
            className="result-btn result-btn--secondary"
            onClick={onLeaderboard}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Trophy size={18} />
            Leaderboard
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}