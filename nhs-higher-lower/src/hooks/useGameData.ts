import { useState, useEffect } from 'react';
import type { Block, GranularityKey } from '../types';
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

export function useGameData(
  granularity: GranularityKey
): UseGameDataReturn {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('/1998-2024-aggregate.json')
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }

        return r.json() as Promise<RawRow[]>;
      })
      .then((rows) => {
        const map = new Map<
          string,
          {
            blockID: string;
            chapter: string;
            category: string;

            fce_total: number;
            fae_total: number;
            fae_emergency: number;
            fce_day_case: number;
          }
        >();

        for (const row of rows) {
          // choose aggregation key based on granularity
          const key =
            granularity === 'block'
              ? row.block
              : row.category;

          const existing = map.get(key);

          if (existing) {
            existing.fce_total += row.fce_total ?? 0;
            existing.fae_total += row.fae_total ?? 0;
            existing.fae_emergency += row.fae_emergency ?? 0;
            existing.fce_day_case += row.fce_day_case ?? 0;
          } else {
            map.set(key, {
              blockID: key,

              chapter: row.chapter,

              category:
                granularity === 'block'
                  ? (
                      BLOCK_DISPLAY_NAMES[row.block] ??
                      row.mortality_list_1 ??
                      row.block
                    )
                  : (
                      row.description ??
                      row.category
                    ),

              fce_total: row.fce_total ?? 0,
              fae_total: row.fae_total ?? 0,
              fae_emergency: row.fae_emergency ?? 0,
              fce_day_case: row.fce_day_case ?? 0,
            });
          }
        }

        const result: Block[] = Array.from(map.values())
          .map((b) => ({
            blockID: b.blockID,
            chapter: b.chapter,
            category: b.category,

            fce_total: Math.round(b.fce_total),
            fae_total: Math.round(b.fae_total),
            fae_emergency: Math.round(b.fae_emergency),
            fce_day_case: Math.round(b.fce_day_case),
          }))
          .filter((b) => b.fce_total > 0);

        setBlocks(result);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, [granularity]);

  return {
    blocks,
    loading,
    error,
  };
}