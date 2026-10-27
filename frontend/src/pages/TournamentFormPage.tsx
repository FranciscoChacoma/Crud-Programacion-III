import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTournament } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Alert, Button, Card, Input, PageHeader, Segmented, Select, useFeedback } from '../components/ui';
import { CATEGORIES, categoryLabel } from '../theme';
import type { TournamentType } from '../types';

export function TournamentFormPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const [name, setName] = useState('');
  const [type, setType] = useState<TournamentType>('ESTANDAR');
  const [category, setCategory] = useState('A1');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      const created = await createTournament({ name, type, category, startDate: startDate || null }, token);
      toast('Torneo creado');
      navigate(created?.id ? `/tournaments/${created.id}` : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout narrow>
      <PageHeader
        breadcrumbs={[{ label: 'Torneos', to: '/dashboard' }, { label: 'Nuevo torneo' }]}
        title="Nuevo torneo"
        description="Definí los datos básicos. Después seguís paso a paso: parejas, sedes, fase de grupos y llaves."
      />
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="card-body form">
            <Input label="Nombre del torneo" value={name} onChange={e => setName(e.target.value)}
              required placeholder="Ej: Torneo de Verano 2026" autoFocus />
            <div className="form-row">
              <Segmented<TournamentType>
                label="Formato"
                value={type}
                onChange={setType}
                options={[{ value: 'ESTANDAR', label: 'Estándar' }, { value: 'AMERICANO', label: 'Americano' }]}
              />
              <Select label="Categoría" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel[c]} categoría</option>)}
              </Select>
            </div>
            <Input label="Fecha (día de la fase de grupos)" type="date" value={startDate}
              onChange={e => setStartDate(e.target.value)}
              hint="Los grupos se juegan ese día (ej. sábado) y las llaves al día siguiente. Podés dejarla vacía." />
            {error && <Alert>{error}</Alert>}
          </div>
          <div className="card-footer">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancelar</Button>
            <Button type="submit" loading={loading}>Crear torneo</Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}
