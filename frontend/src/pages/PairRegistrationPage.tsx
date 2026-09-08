import { useState, useEffect, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPair, getPair, updatePair } from '../api/pairs';
import { getTournaments } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { PlayerAutocomplete } from '../components/PlayerAutocomplete';
import { Button, Card, Checkbox, Input, PageHeader, Select } from '../components/ui';
import { categoryLabel, scheduleLabel, theme } from '../theme';
import type { PairLevel, PairSchedule, Tournament } from '../types';

const CATEGORIES = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];
const SCHEDULES: PairSchedule[] = ['H09_12', 'H12_15', 'H15_18', 'H18_21'];

export function PairRegistrationPage() {
  const { id, pairId } = useParams<{ id: string; pairId?: string }>();
  const isEdit = !!pairId;
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [player1Name, setPlayer1Name] = useState('');
  const [player1LastName, setPlayer1LastName] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player2LastName, setPlayer2LastName] = useState('');
  const [category, setCategory] = useState('A1');
  const [level, setLevel] = useState<PairLevel>('MEDIO');
  const [availableSchedules, setAvailableSchedules] = useState<PairSchedule[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPair, setLoadingPair] = useState(isEdit);

  useEffect(() => {
    if (!token || !id) return;
    getTournaments(token).then(list => {
      const t = list.find((t: Tournament) => t.id === id);
      if (t) { setTournament(t); if (!isEdit) setCategory(t.category); }
    });
  }, [token, id]);

  useEffect(() => {
    if (!token || !pairId) return;
    getPair(pairId, token).then(p => {
      setPlayer1Name(p.player1.name);
      setPlayer1LastName(p.player1.lastName);
      setPlayer2Name(p.player2.name);
      setPlayer2LastName(p.player2.lastName);
      setCategory(p.category);
      setLevel(p.level);
      setAvailableSchedules(p.availableSchedules);
    }).catch(err => setError(err instanceof Error ? err.message : 'Error al cargar la pareja'))
      .finally(() => setLoadingPair(false));
  }, [token, pairId]);

  const toggleSchedule = (slot: PairSchedule) => {
    setAvailableSchedules(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    if (availableSchedules.length < 2) {
      setError('Seleccioná al menos 2 horarios disponibles: con uno solo (3 horas) no alcanza para jugar los 3 partidos mínimos de 1:30 c/u');
      return;
    }
    setError('');
    setLoading(true);
    const data = { player1Name, player1LastName, player2Name, player2LastName,
      tournamentId: id, category, level, availableSchedules };
    try {
      if (isEdit && pairId) {
        await updatePair(pairId, data, token);
      } else {
        await createPair(data, token);
      }
      navigate(`/tournaments/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la pareja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={s.wrap}>
        <PageHeader
          title={isEdit ? 'Editar Pareja' : 'Inscribir Pareja'}
          onBack={() => navigate(`/tournaments/${id}`)}
          backLabel="Torneo"
          subtitle={tournament && <p style={s.sub}>Torneo: <strong style={{ color: theme.color.primary }}>{tournament.name}</strong></p>}
        />
        <Card>
          {loadingPair ? (
            <p style={{ color: theme.color.textFaint, margin: 0 }}>Cargando...</p>
          ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.section}>
              <p style={s.sectionTitle}>Jugador 1</p>
              <div style={s.row}>
                <PlayerAutocomplete label="Nombre" value={player1Name} onChange={setPlayer1Name} />
                <Input label="Apellido" value={player1LastName}
                  onChange={e => setPlayer1LastName(e.target.value)} required placeholder="Apellido" />
              </div>
            </div>

            <div style={s.section}>
              <p style={s.sectionTitle}>Jugador 2</p>
              <div style={s.row}>
                <PlayerAutocomplete label="Nombre" value={player2Name} onChange={setPlayer2Name} />
                <Input label="Apellido" value={player2LastName}
                  onChange={e => setPlayer2LastName(e.target.value)} required placeholder="Apellido" />
              </div>
            </div>

            <div style={s.row}>
              <Select label="Categoría" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel[c]}</option>)}
              </Select>
              <Select label="Nivel" value={level} onChange={e => setLevel(e.target.value as PairLevel)}>
                <option value="ALTO">Alto</option>
                <option value="MEDIO">Medio</option>
                <option value="BAJO">Bajo</option>
              </Select>
            </div>

            <div style={s.section}>
              <p style={s.sectionTitle}>Horarios disponibles</p>
              <p style={s.hint}>Elegí al menos 2 horarios: con uno solo (3 horas) no alcanza para jugar los 3 partidos mínimos de 1:30 c/u.</p>
              <div style={s.scheduleGrid}>
                {SCHEDULES.map(slot => (
                  <Checkbox
                    key={slot}
                    label={scheduleLabel[slot]}
                    checked={availableSchedules.includes(slot)}
                    onChange={() => toggleSchedule(slot)}
                  />
                ))}
              </div>
            </div>

            {error && <p style={s.error}>{error}</p>}
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Inscribir Pareja'}
            </Button>
          </form>
          )}
        </Card>
      </div>
    </Layout>
  );
}

const s: Record<string, CSSProperties> = {
  wrap: { maxWidth: '620px' },
  sub: { color: theme.color.textFaint, fontSize: '14px', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '22px' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sectionTitle: {
    color: theme.color.primary, fontSize: '12px', fontWeight: 700, margin: 0,
    textTransform: 'uppercase', letterSpacing: '0.6px',
  },
  row: { display: 'flex', gap: '16px' },
  hint: { color: theme.color.textFaint, fontSize: '12px', margin: 0 },
  scheduleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' },
  error: { color: theme.color.danger, fontSize: '13px', margin: 0 },
};
