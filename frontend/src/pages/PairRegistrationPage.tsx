import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPair, getPair, updatePair } from '../api/pairs';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { Layout } from '../components/Layout';
import { PlayerAutocomplete } from '../components/PlayerAutocomplete';
import {
  Alert, Button, Card, Checkbox, Input, LoadingBlock, PageHeader, Segmented, Select, useFeedback,
} from '../components/ui';
import { CATEGORIES, LEVELS, SCHEDULES, categoryLabel, levelLabel, scheduleLabel } from '../theme';
import type { PairLevel, PairSchedule } from '../types';

export function PairRegistrationPage() {
  const { id, pairId } = useParams<{ id: string; pairId?: string }>();
  const isEdit = !!pairId;
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const { tournament } = useTournament(id);
  const [player1Name, setPlayer1Name] = useState('');
  const [player1LastName, setPlayer1LastName] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player2LastName, setPlayer2LastName] = useState('');
  // Empty until the user picks one (or edit mode loads it); new pairs default to the tournament's category.
  const [pickedCategory, setCategory] = useState('');
  const category = pickedCategory || tournament?.category || 'A1';
  const [level, setLevel] = useState<PairLevel>('MEDIO');
  const [availableSchedules, setAvailableSchedules] = useState<PairSchedule[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPair, setLoadingPair] = useState(isEdit);

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
      setError('Seleccioná al menos 2 horarios disponibles: con uno solo (3 horas) no alcanza para jugar los 3 partidos mínimos de 1:30 c/u.');
      return;
    }
    setError('');
    setLoading(true);
    const data = { player1Name, player1LastName, player2Name, player2LastName,
      tournamentId: id, category, level, availableSchedules };
    try {
      if (isEdit && pairId) {
        await updatePair(pairId, data, token);
        toast('Pareja actualizada');
      } else {
        await createPair(data, token);
        toast('Pareja inscripta');
      }
      navigate(`/tournaments/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la pareja');
    } finally {
      setLoading(false);
    }
  };

  const title = isEdit ? 'Editar pareja' : 'Inscribir pareja';

  return (
    <Layout narrow>
      <PageHeader
        breadcrumbs={[
          { label: 'Torneos', to: '/dashboard' },
          { label: tournament?.name ?? 'Torneo', to: `/tournaments/${id}` },
          { label: title },
        ]}
        title={title}
        description="Cargá los jugadores, el nivel de la pareja y los horarios en los que pueden jugar."
      />
      <Card>
        {loadingPair ? <LoadingBlock /> : (
          <form onSubmit={handleSubmit}>
            <div className="card-body form">
              <section className="form-section">
                <div className="form-section-head">
                  <h2 className="form-section-title">Jugador 1</h2>
                </div>
                <div className="form-row">
                  <PlayerAutocomplete label="Nombre" value={player1Name} onChange={setPlayer1Name}
                    onSelect={(_, lastName) => setPlayer1LastName(lastName)} />
                  <Input label="Apellido" value={player1LastName}
                    onChange={e => setPlayer1LastName(e.target.value)} required placeholder="Apellido" />
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-head">
                  <h2 className="form-section-title">Jugador 2</h2>
                </div>
                <div className="form-row">
                  <PlayerAutocomplete label="Nombre" value={player2Name} onChange={setPlayer2Name}
                    onSelect={(_, lastName) => setPlayer2LastName(lastName)} />
                  <Input label="Apellido" value={player2LastName}
                    onChange={e => setPlayer2LastName(e.target.value)} required placeholder="Apellido" />
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-head">
                  <h2 className="form-section-title">Clasificación</h2>
                  <p className="form-section-desc">El nivel se usa para armar grupos parejos.</p>
                </div>
                <div className="form-row">
                  <Select label="Categoría" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel[c]} categoría</option>)}
                  </Select>
                  <Segmented<PairLevel>
                    label="Nivel"
                    value={level}
                    onChange={setLevel}
                    options={LEVELS.map(l => ({ value: l, label: levelLabel[l] }))}
                  />
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-head">
                  <h2 className="form-section-title">Horarios disponibles</h2>
                  <p className="form-section-desc">
                    Elegí al menos 2 franjas: con una sola (3 horas) no alcanza para los 3 partidos mínimos de 1:30 c/u.
                  </p>
                </div>
                <div className="choices">
                  {SCHEDULES.map(slot => (
                    <Checkbox
                      key={slot}
                      label={scheduleLabel[slot]}
                      checked={availableSchedules.includes(slot)}
                      onChange={() => toggleSchedule(slot)}
                    />
                  ))}
                </div>
              </section>

              {error && <Alert>{error}</Alert>}
            </div>
            <div className="card-footer">
              <Button variant="secondary" onClick={() => navigate(`/tournaments/${id}`)}>Cancelar</Button>
              <Button type="submit" loading={loading}>{isEdit ? 'Guardar cambios' : 'Inscribir pareja'}</Button>
            </div>
          </form>
        )}
      </Card>
    </Layout>
  );
}
