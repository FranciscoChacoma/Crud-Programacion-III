import { useEffect, useState, useMemo, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteTournament, getTournaments } from '../api/tournaments';
import { deletePair, getPairsByTournament } from '../api/pairs';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Badge, Button, EmptyState, PageHeader, Spinner, Table, Td, Th, Tr } from '../components/ui';
import { categoryLabel, levelColor, scheduleShortLabel, theme } from '../theme';
import type { Pair, PairLevel, Tournament } from '../types';

const LEVEL_ORDER: Record<PairLevel, number> = { ALTO: 0, MEDIO: 1, BAJO: 2 };

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [deletingPairId, setDeletingPairId] = useState<string | null>(null);
  const [deletingTournament, setDeletingTournament] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    getTournaments(token).then(list => setTournament(list.find((t: Tournament) => t.id === id) || null));
    loadPairs();
  }, [token, id]);

  const loadPairs = () => {
    if (!token || !id) return;
    setLoading(true);
    getPairsByTournament(id, token).then(setPairs).catch(console.error).finally(() => setLoading(false));
  };

  const sortedPairs = useMemo(() => {
    return [...pairs].sort((a, b) => {
      const diff = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [pairs, sortDir]);

  const handleDeleteTournament = async () => {
    if (!token || !id || !tournament) return;
    if (!window.confirm(`¿Eliminar "${tournament.name}"? Se van a borrar también sus canchas, parejas y fixture.`)) return;
    setDeletingTournament(true);
    try {
      await deleteTournament(id, token);
      navigate('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el torneo');
      setDeletingTournament(false);
    }
  };

  const handleDeletePair = async (pair: Pair) => {
    if (!token) return;
    if (!window.confirm(`¿Eliminar la pareja ${pair.player1.name} ${pair.player1.lastName} / ${pair.player2.name} ${pair.player2.lastName}?`)) return;
    setDeletingPairId(pair.id);
    try {
      await deletePair(pair.id, token);
      setPairs(prev => prev.filter(p => p.id !== pair.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la pareja');
    } finally {
      setDeletingPairId(null);
    }
  };

  if (!tournament) {
    return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div></Layout>;
  }

  return (
    <Layout>
      <PageHeader
        title={tournament.name}
        onBack={() => navigate('/dashboard')}
        backLabel="Torneos"
        subtitle={
          <div style={s.meta}>
            <Badge>{categoryLabel[tournament.category]}</Badge>
            <span style={s.type}>{tournament.type === 'ESTANDAR' ? 'Estándar' : 'Americano'}</span>
          </div>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(`/tournaments/${id}/courts`)}>🎾 Canchas</Button>
            <Button variant="secondary" onClick={() => navigate(`/tournaments/${id}/fixture`)}>📋 Fixture</Button>
            <Button onClick={() => navigate(`/tournaments/${id}/pairs/new`)}>+ Inscribir Pareja</Button>
            <Button variant="danger" onClick={handleDeleteTournament} disabled={deletingTournament} title="Eliminar torneo">
              🗑
            </Button>
          </>
        }
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : sortedPairs.length === 0 ? (
        <EmptyState
          title="No hay parejas inscriptas aún"
          description="Inscribí la primera pareja para poder generar el fixture del torneo."
          action={<Button onClick={() => navigate(`/tournaments/${id}/pairs/new`)}>Inscribir pareja</Button>}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Jugador 1</Th>
              <Th>Jugador 2</Th>
              <Th>Categoría</Th>
              <Th style={{ cursor: 'pointer' }} onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                Nivel {sortDir === 'asc' ? '↑' : '↓'}
              </Th>
              <Th>Disponibilidad</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {sortedPairs.map((p, i) => (
              <Tr key={p.id}>
                <Td>{i + 1}</Td>
                <Td>{p.player1.lastName}, {p.player1.name}</Td>
                <Td>{p.player2.lastName}, {p.player2.name}</Td>
                <Td>{categoryLabel[p.category]}</Td>
                <Td><Badge color={levelColor[p.level]}>{p.level}</Badge></Td>
                <Td>
                  <div style={s.scheduleList}>
                    {p.availableSchedules.map(sch => (
                      <span key={sch} style={s.scheduleTag}>{scheduleShortLabel[sch]}</span>
                    ))}
                  </div>
                </Td>
                <Td>
                  <div style={s.rowActions}>
                    <button
                      className="btn-secondary"
                      style={s.actionBtn}
                      onClick={() => navigate(`/tournaments/${id}/pairs/${p.id}/edit`)}
                      title="Editar pareja"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-danger"
                      style={s.actionBtn}
                      onClick={() => handleDeletePair(p)}
                      disabled={deletingPairId === p.id}
                      title="Eliminar pareja"
                    >
                      ✕
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Layout>
  );
}

const s: Record<string, CSSProperties> = {
  meta: { display: 'flex', gap: '10px', alignItems: 'center' },
  type: { color: theme.color.textFaint, fontSize: '13px' },
  scheduleList: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  scheduleTag: {
    background: theme.color.bgElevated, border: `1px solid ${theme.color.border}`, color: theme.color.textMuted,
    fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: theme.radius.sm,
  },
  rowActions: { display: 'flex', gap: '6px' },
  actionBtn: {
    background: 'transparent', border: `1px solid ${theme.color.border}`, color: theme.color.textFaint,
    width: '26px', height: '26px', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease', padding: 0,
  },
};
