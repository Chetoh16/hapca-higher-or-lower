import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, RotateCcw, ArrowLeft, Download, X, Trash2 } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { exportLeaderboard, deletePlayerFromLeaderboard } from '../utils/gameLogic';
import { useSound } from '../hooks/useSound';


interface Props {
  entries: LeaderboardEntry[];
  currentPlayerName: string;
  onBack: () => void;
  onRestart: () => void;
  onImported: () => void; // still used after delete to refresh parent
}

const RANK_ICONS = [
  <Trophy key="1" size={18} className="rank-icon rank-icon--gold" />,
  <Medal  key="2" size={18} className="rank-icon rank-icon--silver" />,
  <Medal  key="3" size={18} className="rank-icon rank-icon--bronze" />,
];

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function dedupeByName(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const seen = new Map<string, LeaderboardEntry>();
  for (const e of entries) {
    const existing = seen.get(e.name);
    if (!existing || e.score > existing.score) seen.set(e.name, e);
  }
  return Array.from(seen.values()).sort((a, b) => b.score - a.score);
}

export function Leaderboard({
  entries,
  currentPlayerName,
  onBack,
  onRestart,
  onImported,
}: Props) {
  // Which row is expanded (showing the delete confirm)
  const [expandedName, setExpandedName] = useState<string | null>(null);
  // Local copy so deletions are instant without waiting for parent re-render
  const [localEntries, setLocalEntries] = useState<LeaderboardEntry[]>(entries);

  const displayEntries = dedupeByName(localEntries);

  const { playTick } = useSound();

  const handleRowClick = (name: string) => {
    setExpandedName((prev) => (prev === name ? null : name));
  };

  const handleDelete = (name: string) => {
    deletePlayerFromLeaderboard(name);
    setLocalEntries((prev) => prev.filter((e) => e.name !== name));
    setExpandedName(null);
    // notify parent to re-read 
    onImported();
  };

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
          <p className="lb-subtitle">Best score per player - click a name to remove</p>
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
              const isPlayer = entry.name === currentPlayerName;
              const isExpanded = expandedName === entry.name;

              return (
                <motion.div
                  key={entry.name}
                  className={`lb-row-wrap ${isExpanded ? 'lb-row-wrap--expanded' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  layout
                >
                  {/* Main row*/}
                  <div
                    className={`lb-row lb-row--clickable ${isPlayer ? 'lb-row--you' : ''} ${isExpanded ? 'lb-row--open' : ''}`}
                    onClick={() => {
                      playTick();
                      handleRowClick(entry.name);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleRowClick(entry.name)}
                    aria-expanded={isExpanded}
                  >
                    <div className="lb-rank">
                      {i < 3 ? RANK_ICONS[i] : <span className="lb-rank-num">{i + 1}</span>}
                    </div>
                    <div className="lb-name">
                      {entry.name}
                      {isPlayer && <span className="lb-you-tag">YOU</span>}
                    </div>
                    <div className="lb-time">{formatTime(entry.timestamp)}</div>
                    <div className="lb-score">{entry.score}</div>
                    {/* Chevron indicator */}
                    <motion.div
                      className="lb-row-chevron"
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ›
                    </motion.div>
                  </div>

                  {/* Delete drawer*/}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="lb-delete-drawer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                      >
                        <div className="lb-delete-inner">
                          <span className="lb-delete-label">
                            Remove <strong>{entry.name}</strong> from the leaderboard?
                          </span>
                          <div className="lb-delete-btns">
                            <button
                              className="lb-delete-confirm"
                              onClick={(e) => {playTick(); e.stopPropagation(); handleDelete(entry.name); }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                            <button
                              className="lb-delete-cancel"
                              onClick={(e) => {playTick(); e.stopPropagation(); setExpandedName(null); }}
                            >
                              <X size={14} /> Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Export row */}
        <div className="lb-data-row">
          <button className="lb-data-btn" onClick={() => {
            playTick();
            exportLeaderboard();
          }} title="Download leaderboard.json">
            <Download size={14} /> Export JSON
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