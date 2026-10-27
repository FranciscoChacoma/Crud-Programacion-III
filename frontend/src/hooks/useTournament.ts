import { useCallback, useEffect, useState } from 'react';
import { getTournament } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import type { Tournament } from '../types';

// `reload` refreshes the step counters after changes (new pairs, results, etc.).
export function useTournament(id: string | undefined) {
  const { token } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [notFound, setNotFound] = useState(false);

  const reload = useCallback(() => {
    if (!token || !id) return;
    getTournament(id, token)
      .then(t => { setTournament(t); setNotFound(false); })
      .catch(() => setNotFound(true));
  }, [token, id]);

  useEffect(reload, [reload]);

  return { tournament, notFound, reload, setTournament };
}
