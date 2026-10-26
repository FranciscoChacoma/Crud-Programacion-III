import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteTournament } from '../api/tournaments';
import { deletePair, getPairsByTournament } from '../api/pairs';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { Layout } from '../components/Layout';
import { TournamentHeader, TournamentPlaceholder } from '../components/TournamentHeader';
import {
  Avatar, Badge, Button, Card, EmptyState, Icon, IconButton, LoadingBlock, Stat, Table, Td, Th, Tr, useFeedback,
} from '../components/ui';
import { LEVELS, categoryLabel, levelLabel, levelTone, scheduleShortLabel } from '../theme';
import type { Pair, PairLevel } from '../types';

const LEVEL_ORDER: Record<PairLevel, number> = { ALTO: 0, MEDIO: 1, BAJO: 2 };

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { confirm, toast } = useFeedback();
  const { tournament, notFound } = useTournament(id);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<PairLevel | ''>('');
  const [loading, setLoading] = useState(true);
  const [deletingPairId, setDeletingPairId] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    getPairsByTournament(id, token)
      .then(setPairs)
      .catch(err => toast(err instanceof Error ? err.message : 'Error al obtener las parejas', 'error'))
      .finally(() => setLoading(false));
  }, [token, id, toast]);

  const visiblePairs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pairs
      .filter(p => !levelFilter || p.level === levelFilter)
      .filter(p => !q || [p.player1.name, p.player1.lastName, p.player2.name, p.player2.lastName]
        .some(s => s.toLowerCase().includes(q)))
      .sort((a, b) => {
        const diff = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
        return sortDir === 'asc' ? diff : -diff;
      });
  }, [pairs, sortDir, query, levelFilter]);

  const countByLevel = (level: PairLevel) => pairs.filter(p => p.level === level).length;

  const handleDeleteTournament = async () => {
    if (!token || !id || !tournament) return;
    const ok = await confirm({
      title: `Eliminar "${tournament.name}"`,
      message: 'Se eliminarán también sus canchas, parejas y fixture. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar torneo',
    });
    if (!ok) return;
    try {
      await deleteTournament(id, token);
      toast('Torneo eliminado');
      navigate('/dashboard');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar el torneo', 'error');
    }
  };

  const handleDeletePair = async (pair: Pair) => {
    if (!token) return;
    const ok = await confirm({
      title: 'Eliminar pareja',
      message: `${pair.player1.name} ${pair.player1.lastName} / ${pair.player2.name} ${pair.player2.lastName} dejará de estar inscripta en el torneo.`,
      confirmLabel: 'Eliminar pareja',
    });
    if (!ok) return;
    setDeletingPairId(pair.id);
    try {
      await deletePair(pair.id, token);
      setPairs(prev => prev.filter(p => p.id !== pair.id));
      toast('Pareja eliminada');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar la pareja', 'error');
    } finally {
      setDeletingPairId(null);
    }
  };

  if (!tournament) {
    return <Layout><TournamentPlaceholder notFound={notFound} /></Layout>;
  }

  const newPair = () => navigate(`/tournaments/${id}/pairs/new`);

  return (
    <Layout>
      <TournamentHeader
        tournament={tournament}
        counts={loading ? {} : { pairs: pairs.length }}
        actions={
          <>
            <Button variant="secondary" icon="trash" onClick={handleDeleteTournament}>Eliminar</Button>
            <Button icon="userPlus" onClick={newPair}>Inscribir pareja</Button>
          </>
        }
      />

      {loading ? <LoadingBlock /> : pairs.length === 0 ? (
        <Card>
          <EmptyState
            icon="users"
            title="No hay parejas inscriptas"
            description="Inscribí la primera pareja para poder generar el fixture del torneo."
            action={<Button icon="userPlus" onClick={newPair}>Inscribir pareja</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="stats">
            <Stat label="Parejas inscriptas" value={pairs.length} icon="users" />
            {LEVELS.map(l => (
              <Stat key={l} label={`Nivel ${levelLabel[l].toLowerCase()}`} value={countByLevel(l)}
                hint={`${Math.round((countByLevel(l) / pairs.length) * 100)}% del total`} />
            ))}
          </div>

          <Table
            toolbar={
              <>
                <div className="input-icon-wrap" style={{ flex: '1 1 240px', maxWidth: 320 }}>
                  <Icon name="search" size={16} />
                  <input className="input" placeholder="Buscar jugador" value={query}
                    onChange={e => setQuery(e.target.value)} aria-label="Buscar jugador" />
                </div>
                <select className="input" style={{ width: 180 }} value={levelFilter}
                  onChange={e => setLevelFilter(e.target.value as PairLevel | '')} aria-label="Filtrar por nivel">
                  <option value="">Todos los niveles</option>
                  {LEVELS.map(l => <option key={l} value={l}>Nivel {levelLabel[l].toLowerCase()}</option>)}
                </select>
              </>
            }
          >
            <thead>
              <tr>
                <Th style={{ width: 48 }}>#</Th>
                <Th>Pareja</Th>
                <Th>Categoría</Th>
                <Th className="sortable" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                  aria-sort={sortDir === 'asc' ? 'ascending' : 'descending'}>
                  Nivel <Icon name="arrowUpDown" size={13} />
                </Th>
                <Th>Disponibilidad</Th>
                <Th><span className="sr-only">Acciones</span></Th>
              </tr>
            </thead>
            <tbody>
              {visiblePairs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }} className="muted">
                  Ninguna pareja coincide con los filtros.
                </td></tr>
              ) : visiblePairs.map((p, i) => (
                <Tr key={p.id}>
                  <Td className="mono muted">{i + 1}</Td>
                  <Td>
                    <div className="person">
                      <span className="avatar-stack">
                        <Avatar name={p.player1.name} lastName={p.player1.lastName} />
                        <Avatar name={p.player2.name} lastName={p.player2.lastName} />
                      </span>
                      <div>
                        <div className="person-name">{p.player1.name} {p.player1.lastName}</div>
                        <div className="person-name">{p.player2.name} {p.player2.lastName}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>{categoryLabel[p.category]}</Td>
                  <Td><Badge tone={levelTone[p.level]} dot>{levelLabel[p.level]}</Badge></Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.availableSchedules.map(sch => <span key={sch} className="chip">{scheduleShortLabel[sch]}</span>)}
                    </div>
                  </Td>
                  <Td className="cell-actions">
                    <IconButton icon="pencil" label="Editar pareja"
                      onClick={() => navigate(`/tournaments/${id}/pairs/${p.id}/edit`)} />
                    <IconButton icon="trash" label="Eliminar pareja" danger
                      disabled={deletingPairId === p.id} onClick={() => handleDeletePair(p)} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Layout>
  );
}
