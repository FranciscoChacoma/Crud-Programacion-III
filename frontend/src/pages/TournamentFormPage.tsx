import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTournament } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Button, Card, Input, PageHeader, Select } from '../components/ui';
import { categoryLabel, theme } from '../theme';

const CATEGORIES = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];

export function TournamentFormPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState('ESTANDAR');
  const [category, setCategory] = useState('A1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      await createTournament(name, type, category, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={s.wrap}>
        <PageHeader title="Nuevo Torneo" onBack={() => navigate('/dashboard')} backLabel="Torneos" />
        <Card>
          <form onSubmit={handleSubmit} style={s.form}>
            <Input label="Nombre del torneo" value={name} onChange={e => setName(e.target.value)}
              required placeholder="Ej: Torneo de Verano 2026" />
            <div style={s.row}>
              <Select label="Tipo" value={type} onChange={e => setType(e.target.value)}>
                <option value="ESTANDAR">Estándar</option>
                <option value="AMERICANO">Americano</option>
              </Select>
              <Select label="Categoría" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel[c]}</option>)}
              </Select>
            </div>
            {error && <p style={s.error}>{error}</p>}
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Creando...' : 'Crear Torneo'}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

const s: Record<string, CSSProperties> = {
  wrap: { maxWidth: '540px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  row: { display: 'flex', gap: '16px' },
  error: { color: theme.color.danger, fontSize: '13px', margin: 0 },
};
