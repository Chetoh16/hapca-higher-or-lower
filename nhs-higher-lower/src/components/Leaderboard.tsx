import { motion } from 'framer-motion';
import { Trophy, Medal, RotateCcw, ArrowLeft } from 'lucide-react';
import type { LeaderboardEntry } from '../types';

interface Props {
  entries: LeaderboardEntry[];
  currentPlayerName: string;
  onBack: () => void;
  onRestart: () => void;
}

const RANK_ICONS = [
  <Trophy key="1" size={18} className="rank-icon rank-icon--gold" />,
  <Medal key="2" size={18} className="rank-icon rank-icon--silver" />,
  <Medal key="3" size={18} className="rank-icon rank-icon--bronze" />,
];

// include time in the leaderboard
function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function Leaderboard({
  entries,
  currentPlayerName,
  onBack,
  onRestart,
}: Props) {
  return (
    <motion.div
      className="leaderboard-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="leaderboard-panel"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="lb-header">
          <Trophy size={28} className="lb-header-icon" />
          <h2 className="lb-title">Leaderboard</h2>
          <p className="lb-subtitle">Top 20 NHS Higher or Lower scores</p>
        </div>

        {/* Table */}
        <div className="lb-table">
          {entries.length === 0 && (
            <div className="lb-empty">No scores yet — be the first!</div>
          )}

          {entries.map((entry, i) => {
            const isPlayer = entry.name === currentPlayerName;
            return (
              <motion.div
                key={`${entry.name}-${entry.timestamp}`}
                className={`lb-row ${isPlayer ? 'lb-row--you' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                {/* Rank */}
                <div className="lb-rank">
                  {i < 3 ? (
                    RANK_ICONS[i]
                  ) : (
                    <span className="lb-rank-num">{i + 1}</span>
                  )}
                </div>

                {/* Name */}
                <div className="lb-name">
                  {entry.name}
                  {isPlayer && <span className="lb-you-tag">YOU</span>}
                </div>

                {/* Time */}
                <div className="lb-time">{formatTime(entry.timestamp)}</div>

                {/* Score */}
                <div className="lb-score">{entry.score}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="lb-actions">
          <motion.button
            className="lb-btn lb-btn--secondary"
            onClick={onBack}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
          <motion.button
            className="lb-btn lb-btn--primary"
            onClick={onRestart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={16} />
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}