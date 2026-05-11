import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';

interface Props {
  score: number;
  highScore: number;
  playerName: string;
}

export function ScoreBar({ score, highScore, playerName }: Props) {
  return (
    <motion.div
      className="score-bar"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
    >
      {/* Player name + current score */}
      <div className="score-left">
        <Zap size={16} className="score-icon" />
        <span className="score-name">{playerName}</span>
      </div>

      <div className="score-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            className="score-current"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {score}
          </motion.span>
        </AnimatePresence>
        <span className="score-label">pts</span>
      </div>

      {/* High score */}
      <div className="score-right">
        <Trophy size={16} className="score-icon score-icon-trophy" />
        <span className="score-high-label">Best</span>
        <span className="score-high-value">{highScore}</span>
      </div>
    </motion.div>
  );
}