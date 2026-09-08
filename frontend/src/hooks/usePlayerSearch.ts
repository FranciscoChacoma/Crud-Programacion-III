import { useState, useEffect } from 'react';
import * as Types from '../types';
type Player = Types.Player;
import { searchPlayers } from '../api/players';

export function usePlayerSearch(query: string) {
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchPlayers(query);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return { results, loading };
}