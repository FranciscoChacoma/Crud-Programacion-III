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
import type { PairLevel, PairSchedule, Player } from '../types';

interface PlayerFields {
  name: string;
  lastName: string;
  email: string;
  category: string;
}

const EMPTY: PlayerFields = { name: '', lastName: '', email: '', category: '' };
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function PlayerSection({ title, value, onChange, allowed }: {
  title: string; value: PlayerFields; onChange: (v: PlayerFields) => void; allowed: string;
}) {
  const pick = (p: Player) => onChange({ name: p.name, lastName: p.lastName, email: p.email ?? value.email, category: p.category ?? value.category });
  return (
    <section className="form-section">
      <div className="form-section-head">
        <h2 className="form-section-title">{title}</h2>
        <p className="form-section-desc">Buscalo entre los jugadores guardados o cargalo nuevo.</p>
      </div>
      <div className="form-row">
        <PlayerAutocomplete label="Nombre" value={value.name} onChange={name => onChange({ ...value, name })} onSelect={pick} />
        <Input label="Apellido" value={value.lastName} required placeholder="Apellido"
          onChange={e => onChange({ ...value, lastName: e.target.value })} />
      </div>
      <div className="form-row">
        <Input label="Email" type="email" value={value.email} required placeholder="jugador@mail.com"
          hint="Se usa para mandarle sus partidos y la planilla del torneo."
          onChange={e => onChange({ ...value, email: e.target.value })} />
        <Select label="Categoría del jugador" value={value.category} required hint={allowed}
          onChange={e => onChange({ ...value, category: e.target.value })}>
          <option value="">Elegí la categoría</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel[c]} categoría</option>)}
        </Select>
      </div>
    </section>
  );
}

export function PairRegistrationPage() {
  const { id, pairId } = useParams<{ id: string; pairId?: string }>();
  const isEdit = !!pairId;
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const { tournament } = useTournament(id);
  const [player1, setPlayer1] = useState<PlayerFields>(EMPTY);
  const [player2, setPlayer2] = useState<PlayerFields>(EMPTY);
  const [level, setLevel] = useState<PairLevel>('MEDIO');
  const [availableSchedules, setAvailableSchedules] = useState<PairSchedule[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPair, setLoadingPair] = useState(isEdit);

  useEffect(() => {
    if (!token || !pairId) return;
    getPair(pairId, token).then(p => {
      setPlayer1({ name: p.player1.name, lastName: p.player1.lastName, email: p.player1.email ?? '', category: p.player1.category ?? '' });
      setPlayer2({ name: p.player2.name, lastName: p.player2.lastName, email: p.player2.email ?? '', category: p.player2.category ?? '' });
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
      setError('Elegí al menos 2 franjas horarias: los 3 partidos de grupo (1:30 c/u) no entran en una sola franja de 3 horas.');
      return;
    }
    const badEmail = [player1, player2].find(p => !EMAIL_RE.test(p.email.trim()));
    if (badEmail) {
      setError(`Revisá el email de ${badEmail.name || 'cada jugador'}.`);
      return;
    }
    setError('');
    setLoading(true);
    const data = {
      player1Name: player1.name, player1LastName: player1.lastName, player1Email: player1.email, player1Category: player1.category,
      player2Name: player2.name, player2LastName: player2.lastName, player2Email: player2.email, player2Category: player2.category,
      tournamentId: id, category: '', level, availableSchedules,
    };
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
  const franjas = availableSchedules.length;
  // En un torneo de 6ta juegan los de 6ta y los de 7ma (vale igual para todas las categorías).
  const tIdx = tournament ? CATEGORIES.indexOf(tournament.category) : -1;
  const allowed = tIdx < 0 ? '' : `En este torneo: ${categoryLabel[CATEGORIES[tIdx]]}${CATEGORIES[tIdx + 1] ? ` o ${categoryLabel[CATEGORIES[tIdx + 1]]}` : ''}.`;

  return (
    <Layout narrow>
      <PageHeader
        breadcrumbs={[
          { label: 'Torneos', to: '/dashboard' },
          { label: tournament?.name ?? 'Torneo', to: `/tournaments/${id}` },
          { label: title },
        ]}
        title={title}
        description="Cargá los jugadores con su email, el nivel de la pareja y las franjas en las que pueden jugar el día de grupos."
      />
      <Card>
        {loadingPair ? <LoadingBlock /> : (
          <form onSubmit={handleSubmit}>
            <div className="card-body form">
              <PlayerSection title="Jugador 1" value={player1} onChange={setPlayer1} allowed={allowed} />
              <PlayerSection title="Jugador 2" value={player2} onChange={setPlayer2} allowed={allowed} />

              <section className="form-section">
                <div className="form-section-head">
                  <h2 className="form-section-title">Nivel</h2>
                  <p className="form-section-desc">Se usa para que los grupos queden parejos.</p>
                </div>
                <Segmented<PairLevel>
                  value={level}
                  onChange={setLevel}
                  options={LEVELS.map(l => ({ value: l, label: levelLabel[l] }))}
                />
              </section>

              <section className="form-section">
                <div className="form-section-head">
                  <h2 className="form-section-title">Franjas horarias disponibles</h2>
                  <p className="form-section-desc">
                    Cada partido dura 1:30, así que en una franja de 3 horas entran 2 partidos. Con 2 franjas se juegan
                    los 3 partidos de grupo (dos seguidos); con 3 o más hay lugar para descansar entre partidos.
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
                {franjas > 0 && (
                  <div className={`schedule-hint${franjas < 2 ? ' warn' : ''}`}>
                    {franjas < 2 ? 'Elegí al menos una franja más.'
                      : franjas === 2 ? 'Mínimo cumplido: van a jugar dos partidos seguidos.'
                      : 'Buena disponibilidad: más fácil armar el fixture y con descanso entre partidos.'}
                  </div>
                )}
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
