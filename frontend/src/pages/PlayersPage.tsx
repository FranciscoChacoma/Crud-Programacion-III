import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePlayer, getPlayers } from '../api/players';
import { Layout } from '../components/Layout';
import { PlayerFormModal } from '../components/PlayerFormModal';
import {
  Avatar, Badge, Button, Card, EmptyState, Icon, IconButton, LoadingBlock, PageHeader, Stat, Table, Td, Th, Tr, useFeedback,
} from '../components/ui';
import { categoryLabel } from '../theme';
import type { PlayerProfile } from '../types';

export function PlayersPage() {
  const navigate = useNavigate();
  const { confirm, toast } = useFeedback();
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<PlayerProfile | 'new' | null>(null);

  const load = useCallback(() => {
    getPlayers()
      .then(setPlayers)
      .catch(err => toast(err instanceof Error ? err.message : 'Error al obtener los jugadores', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(p => [p.name, p.lastName, p.email ?? '', p.phone ?? ''].some(s => s.toLowerCase().includes(q)));
  }, [players, query]);

  const handleDelete = async (p: PlayerProfile) => {
    const ok = await confirm({
      title: `Eliminar a ${p.name} ${p.lastName}`,
      message: 'Se borrará su perfil. Solo se puede eliminar si no está inscripto en ningún torneo.',
      confirmLabel: 'Eliminar jugador',
    });
    if (!ok) return;
    try {
      await deletePlayer(p.id);
      setPlayers(prev => prev.filter(x => x.id !== p.id));
      toast('Jugador eliminado');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar el jugador', 'error');
    }
  };

  const withContact = players.filter(p => p.email || p.phone).length;
  const active = players.filter(p => p.participations.length > 0).length;

  return (
    <Layout>
      <PageHeader
        title="Jugadores"
        description="Perfiles guardados. Se reutilizan al inscribir parejas en cualquier torneo."
        actions={<Button icon="plus" onClick={() => setEditing('new')}>Nuevo jugador</Button>}
      />

      {loading ? <LoadingBlock /> : players.length === 0 ? (
        <Card>
          <EmptyState
            icon="users"
            title="Todavía no hay jugadores"
            description="Los jugadores se guardan automáticamente al inscribir parejas, o podés crearlos acá."
            action={<Button icon="plus" onClick={() => setEditing('new')}>Nuevo jugador</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="stats">
            <Stat label="Jugadores" value={players.length} icon="users" />
            <Stat label="Con datos de contacto" value={withContact} icon="mail"
              hint={`${players.length - withContact} sin email ni teléfono`} />
            <Stat label="Inscriptos en torneos" value={active} icon="trophy" />
          </div>

          <Table
            toolbar={
              <>
                <div className="input-icon-wrap" style={{ flex: '1 1 240px', maxWidth: 320 }}>
                  <Icon name="search" size={16} />
                  <input className="input" placeholder="Buscar por nombre, email o teléfono" value={query}
                    onChange={e => setQuery(e.target.value)} aria-label="Buscar jugador" />
                </div>
                <span className="muted" style={{ fontSize: 13 }}>{filtered.length} de {players.length}</span>
              </>
            }
          >
            <thead>
              <tr>
                <Th>Jugador</Th>
                <Th>Email</Th>
                <Th>Teléfono</Th>
                <Th>Categoría</Th>
                <Th>Inscripciones</Th>
                <Th><span className="sr-only">Acciones</span></Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }} className="muted">
                  Ningún jugador coincide con la búsqueda.
                </td></tr>
              ) : filtered.map(p => (
                <Tr key={p.id} className="clickable" onClick={() => navigate(`/players/${p.id}`)}>
                  <Td>
                    <div className="person">
                      <Avatar name={p.name} lastName={p.lastName} />
                      <span className="person-name">{p.name} {p.lastName}</span>
                    </div>
                  </Td>
                  <Td>{p.email ?? <span className="muted">—</span>}</Td>
                  <Td>{p.phone ?? <span className="muted">—</span>}</Td>
                  <Td>{p.category ? categoryLabel[p.category] : <span className="muted">—</span>}</Td>
                  <Td>
                    {p.participations.length > 0
                      ? <Badge tone="primary">{p.participations.length}</Badge>
                      : <span className="muted">—</span>}
                  </Td>
                  <Td className="cell-actions" onClick={e => e.stopPropagation()}>
                    <IconButton icon="pencil" label="Editar jugador" onClick={() => setEditing(p)} />
                    <IconButton icon="trash" label="Eliminar jugador" danger onClick={() => handleDelete(p)} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {editing && (
        <PlayerFormModal
          player={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </Layout>
  );
}
