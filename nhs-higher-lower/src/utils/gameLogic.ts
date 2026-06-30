import type { Block, LeaderboardEntry, MetricKey } from '../types';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

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


// remove unclassified
const UNCLASSIFIED_CATEGORIES = new Set([
  'Unclassified',
  'unclassified',
]);

export function isUnclassified(block: Block): boolean {
  // Filter by both category label AND chapter (Chapter XIX/XXI contain many unclassified)
  return UNCLASSIFIED_CATEGORIES.has(block.category);
}


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
  // Exclude used blocks AND unclassified ones
  const pool = blocks.filter(
    (b) => !excludeIds.has(b.blockID) && !isUnclassified(b),
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getMetricValue(block: Block, metric: MetricKey): number {
  return (block[metric] as number | undefined) ?? block.fce_total;
}



// Start Session
export async function startSession(username: string): Promise<string> {
  const res = await fetch(`${FUNCTIONS_URL}/start-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) {
    throw new Error('Failed to start session');
  }

  const data: { sessionToken: string } = await res.json();
  return data.sessionToken;
}



// Submit Score
export async function submitScore(
  entry: Omit<LeaderboardEntry, 'created_at'>, // the database handles creation time so no need to send it + prevents fake data
  sessionToken: string  // security token proving valid game session
){

  const res = await fetch(`${FUNCTIONS_URL}/submit-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...entry, sessionToken }),
  });

  if (!res.ok) {
    throw new Error('Failed to submit score');
  }
  
  // refresh cache after submit so UI stays in sync
  await getLeaderboard();
}


// Leaderboard

// cache it so it doesn't have to make too many api calls
let leaderboardCache: LeaderboardEntry[] = [];

export function getCachedLeaderboard(): LeaderboardEntry[] {
  return leaderboardCache;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {

  const res = await fetch(`${FUNCTIONS_URL}/get-leaderboard`);

  if (!res.ok){
    throw new Error('Failed to fetch leaderboard');
  }

  // converts the HTTP response body into a JavaScript object
  const data: { leaderboard: LeaderboardEntry[] } = await res.json();

  // returns leaderboardCache but if it's missing then returns an empty array
  leaderboardCache = data.leaderboard ?? [];
  return leaderboardCache;
}



export function getHighScore(): number {
  if (!leaderboardCache.length) return 0;

  // return highest score and 0 if it doesn't exist
  return leaderboardCache.length > 0 ? leaderboardCache[0].score : 0;
}

export function getPlayerBestScore(username: string): number {
  const entries = leaderboardCache.filter((e) => e.username === username);
  return entries.length > 0 ? entries[0].score : 0;
}

export function playerExists(username: string): boolean {
  return leaderboardCache.some((e) => e.username === username);
}

