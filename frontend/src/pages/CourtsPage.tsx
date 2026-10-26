import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createCourt, deleteCourt, getCourts } from '../api/courts';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { Layout } from '../components/Layout';
import { TournamentHeader, TournamentPlaceholder } from '../components/TournamentHeader';
import { Alert, Button, Card, CardHeader, EmptyState, IconButton, LoadingBlock, useFeedback } from '../components/ui';
import type { Court } from '../types';

export function CourtsPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { confirm, toast } = useFeedback();
  const { tournament, notFound } = useTournament(id);
  const [courts, setCourts] = useState<Court[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadCourts = useCallback(() => {
    if (!token || !id) return;
    getCourts(id, token)
      .then(setCourts)
      .catch(err => toast(err instanceof Error ? err.message : 'Error al obtener las canchas', 'error'))
      .finally(() => setLoading(false));
  }, [token, id, toast]);

  useEffect(loadCourts, [loadCourts]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || !name.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await createCourt(id, name.trim(), token);
      setName('');
      toast('Cancha agregada');
      loadCourts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cancha');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (court: Court) => {
    if (!token || !id) return;
    const ok = await confirm({ title: `Eliminar "${court.name}"`, message: 'La cancha dejará de usarse al generar el fixture.' });
    if (!ok) return;
    try {
      await deleteCourt(id, court.id, token);
      toast('Cancha eliminada');
      loadCourts();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar la cancha', 'error');
    }
  };

  if (!tournament) {
    return <Layout><TournamentPlaceholder notFound={notFound} /></Layout>;
  }

  return (
    <Layout>
      <TournamentHeader tournament={tournament} counts={loading ? {} : { courts: courts.length }} />

      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <CardHeader
            title="Agregar cancha"
            subtitle="Las canchas cargadas son la capacidad real que usa el algoritmo para armar el fixture."
          />
          <form onSubmit={handleAdd} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group">
              <input className="input" value={name} onChange={e => setName(e.target.value)}
                placeholder="Ej: Cancha 1" required aria-label="Nombre de la cancha" />
              <Button type="submit" icon="plus" loading={submitting}>Agregar</Button>
            </div>
            {error && <Alert>{error}</Alert>}
          </form>
        </Card>

        <Card>
          <CardHeader title="Canchas disponibles" subtitle={loading ? undefined : `${courts.length} en total`} />
          {loading ? <LoadingBlock /> : courts.length === 0 ? (
            <EmptyState
              icon="court"
              title="No hay canchas cargadas"
              description="Agregá al menos una para poder generar el fixture."
            />
          ) : (
            <ul className="court-list">
              {courts.map((c, i) => (
                <li key={c.id} className="court-item">
                  <span className="court-index">{i + 1}</span>
                  <span className="court-name">{c.name}</span>
                  <IconButton icon="trash" label="Eliminar cancha" danger onClick={() => handleDelete(c)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Layout>
  );
}
