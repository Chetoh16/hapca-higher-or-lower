import type { Block, LeaderboardEntry, MetricKey } from '../types';

// interesting blocks will show up first to make the game more engaging. 
// these appear in the first 5–10 rounds; order matters
export const SELECTED_FIRST_BLOCKS: string[] = [
  'C00-C97',    // All Cancers
  'A50-A64',    // STIs
  'B20-B24',    // HIV/AIDS
  'J40-J47',    // COPD/Asthma (covers vaping-related)
  'T36-T50',    // Drug/medication poisoning
  'I20-I25',    // Heart attacks
  'K50-K52',    // Crohn's / Colitis
  'G40-G47',    // Epilepsy & sleep
  'N30-N39',    // UTIs
  'M00-M25',    // Arthritis
];

// formatting numbers for display
export function formatAdmissions(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toLocaleString();
}

export function formatAdmissionsExact(n: number): string {
  return n.toLocaleString('en-GB');
}

// pick a new unique random block 
export function pickRandom(
  blocks: Block[],
  excludeIds: Set<string>
): Block | null {
  const pool = blocks.filter((b) => !excludeIds.has(b.blockID));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getMetricValue(block: Block, metric: MetricKey): number {
  return (block[metric] as number | undefined) ?? block.fce_total;
}

// Leaderboard — localStorage with JSON export support
//
// HOW IT WORKS:
// - Scores are stored in localStorage under the key "nhs_leaderboard" as a
//   JSON array of { name, score, timestamp }.
// - On each page load the app reads from localStorage.
// - "Export to JSON" triggers a browser download of the current leaderboard as
//   leaderboard.json — you can open/edit this file to delete names, then
//   re-import it via the Import button (or paste it back into localStorage).
// - If a player enters the same name (exact case match) as an existing entry,
//   their previous best score is displayed and they continue as that player.
//   A new entry is still added when they finish (so history is preserved), but
//   only the best score per name is shown prominently.
//
const LS_KEY = 'nhs_leaderboard';

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const all: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    // Sort by score descending
    return all.sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

export function addToLeaderboard(entry: LeaderboardEntry): void {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  // Keep top 50 entries total (preserves history across name)
  localStorage.setItem(LS_KEY, JSON.stringify(board.slice(0, 50)));
}

export function getHighScore(): number {
  const board = getLeaderboard();
  return board.length > 0 ? board[0].score : 0;
}

export function getPlayerBestScore(name: string): number {
  const board = getLeaderboard();
  const entries = board.filter((e) => e.name === name);
  return entries.length > 0 ? entries[0].score : 0;
}

export function playerExists(name: string): boolean {
  return getLeaderboard().some((e) => e.name === name);
}

// Export / Import

export function exportLeaderboard(): void {
  const data = getLeaderboard();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leaderboard.json';
  a.click();
  URL.revokeObjectURL(url);
}
/**
 * Deletes ALL entries for a given player name (exact match) from localStorage.
 */
export function deletePlayerFromLeaderboard(name: string): void {
  const board = getLeaderboard().filter((e) => e.name !== name);
  localStorage.setItem(LS_KEY, JSON.stringify(board));
}

/**
 * Imports a leaderboard from a JSON file, replacing the current one.
 * Call this after editing the exported file to remove entries.
 */
export function importLeaderboard(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as LeaderboardEntry[];
        data.sort((a, b) => b.score - a.score);
        localStorage.setItem(LS_KEY, JSON.stringify(data.slice(0, 50)));
        resolve();
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
}