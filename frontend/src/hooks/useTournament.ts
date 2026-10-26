import { useEffect, useState } from 'react';
import { getTournaments } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import type { Tournament } from '../types';

// The API has no GET /tournaments/:id, so we look it up in the organizer's list.
export function useTournament(id: string | undefined) {
  const { token } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    getTournaments(token)
      .then(list => {
        const t = list.find(x => x.id === id) ?? null;
        setTournament(t);
        setNotFound(!t);
      })
      .catch(() => setNotFound(true));
  }, [token, id]);

  return { tournament, notFound };
}
