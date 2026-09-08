import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteTournament, getTournaments } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Badge, Button, Card, EmptyState, PageHeader, Spinner } from '../components/ui';
import { categoryLabel, theme } from '../theme';
import type { Tournament } from '../types';

export function DashboardPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { load(); }, [token]);

  const load = () => {
    if (!token) return;
    getTournaments(token).then(setTournaments).catch(console.error).finally(() => setLoading(false));
  };

  const handleDelete = async (e: React.MouseEvent, t: Tournament) => {
    e.stopPropagation();
    if (!token) return;
    if (!window.confirm(`¿Eliminar "${t.name}"? Se van a borrar también sus canchas, parejas y fixture.`)) return;
    setDeletingId(t.id);
    try {
      await deleteTournament(t.id, token);
      setTournaments(prev => prev.filter(x => x.id !== t.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el torneo');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Torneos"
        subtitle={<p style={s.subtitle}>Gestioná tus torneos de pádel de punta a punta</p>}
        actions={<Button onClick={() => navigate('/tournaments/new')}>+ Nuevo Torneo</Button>}
      />
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : tournaments.length === 0 ? (
        <EmptyState
          title="No hay torneos creados aún."
          description="Creá tu primer torneo para empezar a inscribir parejas y generar el fixture."
          action={<Button onClick={() => navigate('/tournaments/new')}>Crear primer torneo</Button>}
        />
      ) : (
        <div style={s.grid}>
          {tournaments.map(t => (
            <Card key={t.id} hoverable onClick={() => navigate(`/tournaments/${t.id}`)}>
              <div style={s.cardTop}>
                <Badge>{categoryLabel[t.category]}</Badge>
                <div style={s.cardTopRight}>
                  <span style={s.cardType}>{t.type === 'ESTANDAR' ? 'Estándar' : 'Americano'}</span>
                  <button
                    onClick={e => handleDelete(e, t)}
                    className="btn-danger"
                    disabled={deletingId === t.id}
                    title="Eliminar torneo"
                    style={s.deleteBtn}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <h3 style={s.cardName}>{t.name}</h3>
              <p style={s.cardHint}>Ver detalles →</p>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

const s: Record<string, CSSProperties> = {
  subtitle: { color: theme.color.textFaint, fontSize: '14px', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '18px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  cardTopRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  cardType: { color: theme.color.textFaint, fontSize: '12px', fontWeight: 500 },
  deleteBtn: {
    background: 'transparent', border: `1px solid ${theme.color.border}`, color: theme.color.textFaint,
    width: '22px', height: '22px', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '11px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease', padding: 0,
  },
  cardName: { color: theme.color.text, margin: '0 0 8px', fontSize: '18px', fontWeight: 700 },
  cardHint: { color: theme.color.primary, fontSize: '12px', margin: 0, fontWeight: 600 },
};
