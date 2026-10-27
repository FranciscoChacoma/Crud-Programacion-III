import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { setTournamentVenues } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { Layout } from '../components/Layout';
import { NextStep, TournamentHeader, TournamentPlaceholder } from '../components/TournamentHeader';
import { VenueManager } from '../components/VenueManager';
import { Alert, useFeedback } from '../components/ui';
import type { Venue } from '../types';

export function TournamentVenuesPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { toast } = useFeedback();
  const { tournament, notFound, reload, setTournament } = useTournament(id);

  const handleToggle = async (venue: Venue, selected: boolean) => {
    if (!token || !id || !tournament) return;
    const ids = tournament.venues.map(v => v.id).filter(v => v !== venue.id);
    if (selected) ids.push(venue.id);
    try {
      setTournament(await setTournamentVenues(id, ids, token));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al actualizar las sedes', 'error');
    }
  };

  // Agregar o quitar canchas cambia la capacidad del torneo: refrescamos el contador del paso.
  const handleChanged = useCallback(() => reload(), [reload]);

  if (!tournament) {
    return <Layout><TournamentPlaceholder notFound={notFound} /></Layout>;
  }

  // Grupos de 4: cada pareja juega 3 partidos.
  const matches = tournament.pairCount >= 2 ? Math.round(tournament.pairCount * 3 / 2) : 0;

  return (
    <Layout>
      <TournamentHeader tournament={tournament} />
      <div style={{ maxWidth: 820 }}>
        <Alert tone="info" style={{ marginBottom: 16 }}>
          Cada partido dura 1:30, así que una cancha entrega 8 turnos por día (de 09:00 a 21:00).
          {matches > 0 && (
            <> Con {tournament.pairCount} parejas son unos {matches} partidos de grupo: conviene tener al menos{' '}
              {Math.ceil(matches / 6)} canchas para que haya margen.</>
          )}
        </Alert>
        <VenueManager selectedIds={tournament.venues.map(v => v.id)} onToggle={handleToggle} onChanged={handleChanged} />
        <NextStep tournament={tournament} current="venues"
          hint={tournament.courtCount === 0 ? 'Activá al menos una sede con canchas.' : 'Generá los grupos y el horario de partidos.'} />
      </div>
    </Layout>
  );
}
