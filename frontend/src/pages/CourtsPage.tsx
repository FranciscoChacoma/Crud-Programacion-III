import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCourt, deleteCourt, getCourts } from '../api/courts';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Button, Card, EmptyState, Input, PageHeader, Spinner } from '../components/ui';
import { theme } from '../theme';
import type { Court } from '../types';

export function CourtsPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courts, setCourts] = useState<Court[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadCourts(); }, [token, id]);

  const loadCourts = () => {
    if (!token || !id) return;
    setLoading(true);
    getCourts(id, token).then(setCourts).catch(console.error).finally(() => setLoading(false));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || !name.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await createCourt(id, name.trim(), token);
      setName('');
      loadCourts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cancha');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (courtId: string) => {
    if (!token || !id) return;
    setError('');
    try {
      await deleteCourt(id, courtId, token);
      loadCourts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la cancha');
    }
  };

  return (
    <Layout>
      <div style={s.wrap}>
        <PageHeader
          title="Canchas"
          onBack={() => navigate(`/tournaments/${id}`)}
          backLabel="Torneo"
          subtitle={<p style={s.sub}>Las canchas cargadas acá son la capacidad real que usa el algoritmo para armar el fixture.</p>}
        />

        <Card padding="20px" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleAdd} style={s.form}>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Cancha 1" required />
            <Button type="submit" disabled={submitting}>{submitting ? 'Agregando...' : '+ Agregar'}</Button>
          </form>
          {error && <p style={s.error}>{error}</p>}
        </Card>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
        ) : courts.length === 0 ? (
          <EmptyState title="No hay canchas cargadas" description="Agregá al menos una para poder generar el fixture." />
        ) : (
          <div style={s.grid}>
            {courts.map(c => (
              <Card key={c.id} padding="16px 20px" style={s.courtCard}>
                <span style={s.courtName}>🎾 {c.name}</span>
                <button onClick={() => handleDelete(c.id)} className="btn-danger" style={s.deleteBtn} title="Eliminar cancha">✕</button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const s: Record<string, CSSProperties> = {
  wrap: { maxWidth: '640px' },
  sub: { color: theme.color.textFaint, fontSize: '14px', margin: 0, maxWidth: '480px' },
  form: { display: 'flex', gap: '10px' },
  error: { color: theme.color.danger, fontSize: '13px', margin: '10px 0 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  courtCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  courtName: { color: theme.color.text, fontSize: '14px', fontWeight: 600 },
  deleteBtn: {
    background: 'transparent', border: `1px solid ${theme.color.border}`, color: theme.color.textFaint,
    width: '26px', height: '26px', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
  },
};
