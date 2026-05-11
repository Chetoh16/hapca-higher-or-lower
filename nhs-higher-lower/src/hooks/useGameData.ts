import { useState, useEffect } from 'react';
import type { Block, MetricKey } from '../types';
import { BLOCK_DISPLAY_NAMES } from '../types';

interface RawRow {
  year: number;
  block: string;
  category: string;
  subcategory: string;
  description: string;
  chapter: string;
  mortality_list_1: string;
  fce_total: number;
  fae_total: number;
  fae_emergency: number;
  fce_day_case: number;
  [key: string]: unknown;
}

interface UseGameDataReturn {
  blocks: Block[];
  loading: boolean;
  error: string | null;
}


// hook to load and process game data from the 1998–2024 json dataset
export function useGameData(_metric: MetricKey): UseGameDataReturn {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/1998-2024-aggregate.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<RawRow[]>;
      })
      .then((rows) => {
        // aggregate: sum metrics per block (across all years & subcategories)
        const map = new Map<
          string,
          {
            block: string;
            chapter: string;
            category: string;
            fce_total: number;
            fae_total: number;
            fae_emergency: number;
            fce_day_case: number;
          }
        >();

        for (const row of rows) {
          const key = row.block;
          const existing = map.get(key);
          if (existing) {
            existing.fce_total += row.fce_total ?? 0;
            existing.fae_total += row.fae_total ?? 0;
            existing.fae_emergency += row.fae_emergency ?? 0;
            existing.fce_day_case += row.fce_day_case ?? 0;
          } else {
            map.set(key, {
              block: row.block,
              chapter: row.chapter,
              category: row.mortality_list_1 ?? row.category,
              fce_total: row.fce_total ?? 0,
              fae_total: row.fae_total ?? 0,
              fae_emergency: row.fae_emergency ?? 0,
              fce_day_case: row.fce_day_case ?? 0,
            });
          }
        }

        // map to block type, using the human-readable display names
        const result: Block[] = Array.from(map.values())
          .map((agg) => ({
            blockID: agg.block,
            chapter: agg.chapter,
            category: BLOCK_DISPLAY_NAMES[agg.block] ?? agg.category,
            fce_total: Math.round(agg.fce_total),
            fae_total: Math.round(agg.fae_total),
            fae_emergency: Math.round(agg.fae_emergency),
            fce_day_case: Math.round(agg.fce_day_case),
          }))
          .filter((b) => b.fce_total > 0);

        setBlocks(result);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return { blocks, loading, error };
}