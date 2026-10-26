import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deletePlayer, getPlayer } from '../api/players';
import { Layout } from '../components/Layout';
import { PlayerFormModal } from '../components/PlayerFormModal';
import {
  Avatar, Badge, Button, Card, CardHeader, EmptyState, Icon, LoadingBlock, PageHeader, Table, Td, Th, Tr, useFeedback,
  type IconName,
} from '../components/ui';
import { categoryLabel, levelLabel, levelTone } from '../theme';
import type { PlayerProfile } from '../types';

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, toast } = useFeedback();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    getPlayer(id).then(setPlayer).catch(() => setNotFound(true));
  }, [id]);

  useEffect(load, [load]);

  const handleDelete = async () => {
    if (!player) return;
    const ok = await confirm({
      title: `Eliminar a ${player.name} ${player.lastName}`,
      message: 'Se borrará su perfil. Solo se puede eliminar si no está inscripto en ningún torneo.',
      confirmLabel: 'Eliminar jugador',
    });
    if (!ok) return;
    try {
      await deletePlayer(player.id);
      toast('Jugador eliminado');
      navigate('/players');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar el jugador', 'error');
    }
  };

  if (!player) {
    return (
      <Layout>
        {notFound ? (
          <Card>
            <EmptyState icon="alertCircle" title="Jugador no encontrado"
              action={<Button variant="secondary" onClick={() => navigate('/players')}>Volver a jugadores</Button>} />
          </Card>
        ) : <LoadingBlock />}
      </Layout>
    );
  }

  const contact: { icon: IconName; label: string; value?: string | null }[] = [
    { icon: 'mail', label: 'Email', value: player.email },
    { icon: 'phone', label: 'Teléfono', value: player.phone },
  ];

  return (
    <Layout>
      <PageHeader
        breadcrumbs={[{ label: 'Jugadores', to: '/players' }, { label: `${player.name} ${player.lastName}` }]}
        title={
          <span className="profile">
            <Avatar name={player.name} lastName={player.lastName} size="lg" />
            {player.name} {player.lastName}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" icon="trash" onClick={handleDelete}>Eliminar</Button>
            <Button icon="pencil" onClick={() => setEditing(true)}>Editar</Button>
          </>
        }
      />

      <div className="layout-2col">
        <Card>
          <CardHeader title="Contacto" />
          <div className="contact-list">
            {contact.map(c => (
              <div key={c.label} className="contact-item">
                <Icon name={c.icon} size={18} />
                <div style={{ minWidth: 0 }}>
                  <div className="contact-label">{c.label}</div>
                  <div className="contact-value">{c.value || <span className="muted">Sin cargar</span>}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <h2 className="card-title" style={{ marginBottom: 12 }}>
            Inscripciones <span className="muted" style={{ fontWeight: 400 }}>({player.participations.length})</span>
          </h2>
          {player.participations.length === 0 ? (
            <Card>
              <EmptyState icon="trophy" title="Sin inscripciones" description="Este jugador todavía no participó de ningún torneo." />
            </Card>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Torneo</Th>
                  <Th>Compañero/a</Th>
                  <Th>Categoría</Th>
                  <Th>Nivel</Th>
                </tr>
              </thead>
              <tbody>
                {player.participations.map(p => (
                  <Tr key={p.pairId} className="clickable" onClick={() => navigate(`/tournaments/${p.tournamentId}`)}>
                    <Td className="cell-strong">{p.tournamentName}</Td>
                    <Td>{p.partner}</Td>
                    <Td>{categoryLabel[p.category]}</Td>
                    <Td><Badge tone={levelTone[p.level]} dot>{levelLabel[p.level]}</Badge></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {editing && (
        <PlayerFormModal player={player} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />
      )}
    </Layout>
  );
}
