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

// use localStorage to keep a leaderboard
const LS_KEY = 'nhs_leaderboard';

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
  } catch {
    return [];
  }
}

export function addToLeaderboard(entry: LeaderboardEntry): void {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem(LS_KEY, JSON.stringify(board.slice(0, 20)));
}

export function getHighScore(): number {
  const board = getLeaderboard();
  return board.length > 0 ? board[0].score : 0;
}