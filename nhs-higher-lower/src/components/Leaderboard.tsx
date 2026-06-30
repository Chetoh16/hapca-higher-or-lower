import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, RotateCcw, ArrowLeft, RefreshCw } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { useSound } from '../hooks/useSound';


interface Props {
  entries: LeaderboardEntry[];
  currentPlayerName: string;
  onBack: () => void;
  onRestart: () => void;
  onRefresh: () => void;
}

const RANK_ICONS = [
  <Trophy key="1" size={18} className="rank-icon rank-icon--gold" />,
  <Medal key="2" size={18} className="rank-icon rank-icon--silver" />,
  <Medal key="3" size={18} className="rank-icon rank-icon--bronze" />,
];

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
     return iso; 
  }
}

// the server returns one row per submission, not per player, so the same player can appear more than once. 
// keep just their best row.
function dedupeByUsername(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const seen = new Map<string, LeaderboardEntry>();
  for (const e of entries) {
    const existing = seen.get(e.username);
    if (!existing || e.score > existing.score) seen.set(e.username, e);
  }
  return Array.from(seen.values()).sort((a, b) => b.score - a.score);
}

export function Leaderboard({
  entries,
  currentPlayerName,
  onBack,
  onRestart,
  onRefresh,
}: Props) {

  const displayEntries = dedupeByUsername(entries);

  const { playTick } = useSound();

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
          <p className="lb-subtitle">Top scores from every player</p>
        </div>

        {/* Table */}
        <div className="lb-table">
          {displayEntries.length === 0 ? (
            <motion.div
              className="lb-empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Trophy size={36} className="lb-empty-icon" />
              <p>No scores yet!</p>
              <p className="lb-empty-sub">Be the first and claim your spot as the king of diseases.</p>
            </motion.div>
          ) : (
            displayEntries.map((entry, i) => {
              const isPlayer = entry.username === currentPlayerName;
              
              return (
                <motion.div
                  key={entry.username}
                  className="lb-row-wrap"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  layout
                >
                  {/* Main row*/}
                  <div className={`lb-row ${isPlayer ? 'lb-row--you' : ''}`}>
                    <div className="lb-rank">
                      {i < 3 ? RANK_ICONS[i] : <span className="lb-rank-num">{i + 1}</span>}
                    </div>
                    <div className="lb-name">
                      {entry.username}
                      {isPlayer && <span className="lb-you-tag">YOU</span>}
                    </div>
                    <div className="lb-time">{formatTime(entry.created_at)}</div>
                    <div className="lb-score">{entry.score}</div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Refresh leaderboard */}
        <div className="lb-data-row">
          <button
            className="lb-data-btn"
            onClick={() => { playTick(); onRefresh(); }}
            title="Refresh leaderboard"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Nav actions */}
        <div className="lb-actions">
          <motion.button
            className="lb-btn lb-btn--secondary"
            onClick={() => {
              playTick();
              onBack();
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={16} /> Back
          </motion.button>
          <motion.button
            className="lb-btn lb-btn--primary"
            onClick={() => {
              playTick();
              onRestart();
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={16} /> Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}