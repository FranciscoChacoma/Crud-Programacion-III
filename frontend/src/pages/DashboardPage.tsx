import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteTournament, getTournaments } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import {
  Badge, Button, Card, EmptyState, Icon, IconButton, LoadingBlock, PageHeader, Stat, useFeedback,
} from '../components/ui';
import { categoryLabel, formatDate, stageLabel, stageTone } from '../theme';
import type { Tournament } from '../types';

export function DashboardPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { confirm, toast } = useFeedback();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getTournaments(token)
      .then(setTournaments)
      .catch(err => toast(err instanceof Error ? err.message : 'Error al obtener torneos', 'error'))
      .finally(() => setLoading(false));
  }, [token, toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tournaments.filter(t => t.name.toLowerCase().includes(q)) : tournaments;
  }, [tournaments, query]);

  const inProgress = tournaments.filter(t => t.stage === 'GRUPOS' || t.stage === 'LLAVES').length;
  const finished = tournaments.filter(t => t.stage === 'FINALIZADO').length;

  const handleDelete = async (e: React.MouseEvent, t: Tournament) => {
    e.stopPropagation();
    if (!token) return;
    const ok = await confirm({
      title: `Eliminar "${t.name}"`,
      message: 'Se eliminarán también sus canchas, parejas y fixture. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar torneo',
    });
    if (!ok) return;
    setDeletingId(t.id);
    try {
      await deleteTournament(t.id, token);
      setTournaments(prev => prev.filter(x => x.id !== t.id));
      toast('Torneo eliminado');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar el torneo', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Torneos"
        description="Gestioná tus torneos de pádel de punta a punta."
        actions={<Button icon="plus" onClick={() => navigate('/tournaments/new')}>Nuevo torneo</Button>}
      />

      {loading ? <LoadingBlock /> : tournaments.length === 0 ? (
        <Card>
          <EmptyState
            title="Todavía no creaste ningún torneo"
            description="Creá tu primer torneo para empezar a inscribir parejas y generar el fixture."
            action={<Button icon="plus" onClick={() => navigate('/tournaments/new')}>Crear torneo</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="stats">
            <Stat label="Torneos" value={tournaments.length} icon="trophy" />
            <Stat label="En juego" value={inProgress} icon="zap" />
            <Stat label="Finalizados" value={finished} icon="crown" />
          </div>

          <div className="toolbar">
            <div className="input-icon-wrap">
              <Icon name="search" size={16} />
              <input
                className="input"
                placeholder="Buscar torneo"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Buscar torneo"
              />
            </div>
            <span className="muted" style={{ fontSize: 13 }}>
              {filtered.length} de {tournaments.length} torneos
            </span>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState icon="search" title="Sin resultados" description={`Ningún torneo coincide con "${query}".`} />
            </Card>
          ) : (
            <div className="grid-cards">
              {filtered.map(t => (
                <Card
                  key={t.id}
                  interactive
                  className="tcard"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                  onKeyDown={e => { if (e.key === 'Enter') navigate(`/tournaments/${t.id}`); }}
                >
                  <div className="tcard-top">
                    <span className="tcard-icon"><Icon name="trophy" size={20} /></span>
                    <IconButton
                      icon="trash"
                      label="Eliminar torneo"
                      danger
                      disabled={deletingId === t.id}
                      onClick={e => handleDelete(e, t)}
                    />
                  </div>
                  <h3 className="tcard-name">{t.name}</h3>
                  <div className="tcard-meta">
                    <Badge tone={stageTone[t.stage]} dot>{stageLabel[t.stage]}</Badge>
                    <Badge>Categoría {categoryLabel[t.category]}</Badge>
                    <Badge>{t.pairCount} parejas</Badge>
                  </div>
                  {(t.startDate || t.champion) && (
                    <div className="tcard-info">
                      {t.champion
                        ? <><Icon name="crown" size={14} /> {t.champion}</>
                        : <><Icon name="calendar" size={14} /> {formatDate(t.startDate!)}</>}
                    </div>
                  )}
                  <div className="tcard-foot">
                    Gestionar torneo <Icon name="arrowRight" size={16} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
