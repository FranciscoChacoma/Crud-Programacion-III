import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { downloadFixturePdf, emailFixture, generateFixture, getFixture, moveMatch } from '../api/fixture';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { Layout } from '../components/Layout';
import { NextStep, TournamentHeader, TournamentPlaceholder } from '../components/TournamentHeader';
import { ResultModal } from '../components/ResultModal';
import { ScheduleGrid } from '../components/ScheduleGrid';
import {
  Alert, Badge, Button, Card, CardHeader, EmptyState, Icon, LoadingBlock, Segmented, Stat, useFeedback,
} from '../components/ui';
import { levelTone, pairShort, scoreText } from '../theme';
import type { FixtureView, GroupView, MatchView } from '../types';

type ViewMode = 'groups' | 'grid';

function MatchRow({ m, onOpen }: { m: MatchView; onOpen: (m: MatchView) => void }) {
  const issue = m.issues.length > 0;
  return (
    <button type="button" className={`result-row${issue ? ' has-issue' : ''}`} onClick={() => onOpen(m)}
      title={issue ? m.issues.join('\n') : undefined}>
      <span className="result-when">
        <span className="result-time">{m.time ?? '—'}</span>
        <span className="result-court">{m.courtName ?? 'Sin horario'}</span>
      </span>
      <span className="result-pairs">
        <span className={m.winnerId && m.winnerId === m.pair1?.id ? 'winner' : undefined}>{m.pair1 && pairShort(m.pair1)}</span>
        <span className={m.winnerId && m.winnerId === m.pair2?.id ? 'winner' : undefined}>{m.pair2 && pairShort(m.pair2)}</span>
      </span>
      {m.winnerId
        ? <span className="result-score">{scoreText(m.sets)}</span>
        : <span className="result-cta"><Icon name="pencil" size={13} /> Cargar</span>}
      {issue && <span className="result-issue"><Icon name="alertTriangle" size={14} /></span>}
    </button>
  );
}

function GroupCard({ group, onOpen }: { group: GroupView; onOpen: (m: MatchView) => void }) {
  const played = group.matches.filter(m => m.winnerId).length;
  return (
    <Card className="group-card">
      <CardHeader
        leading={<span className="group-letter">{group.name}</span>}
        title={`Grupo ${group.name}`}
        subtitle={`${played}/${group.matches.length} partidos jugados`}
        actions={group.complete ? <Badge tone="success" dot>Terminado</Badge> : undefined}
      />
      <table className="standings">
        <thead>
          <tr><th>#</th><th>Pareja</th><th title="Partidos ganados">PG</th><th title="Sets a favor-en contra">Sets</th><th title="Games a favor-en contra">Games</th></tr>
        </thead>
        <tbody>
          {group.standings.map(r => (
            <tr key={r.pair.id} className={r.position <= 2 ? (group.complete ? 'qualified' : 'top') : undefined}>
              <td className="mono">{r.position}</td>
              <td>
                <span className="standings-pair">
                  <Badge tone={levelTone[r.pair.level]} dot>{pairShort(r.pair)}</Badge>
                </span>
              </td>
              <td className="mono strong">{r.won}</td>
              <td className="mono">{r.setsWon}-{r.setsLost}</td>
              <td className="mono">{r.gamesWon}-{r.gamesLost}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="result-list">
        {group.matches.map(m => <MatchRow key={m.id} m={m} onOpen={onOpen} />)}
      </div>
    </Card>
  );
}

export function FixturePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { confirm, toast } = useFeedback();
  const { tournament, notFound, reload } = useTournament(id);
  const [fixture, setFixture] = useState<FixtureView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'' | 'generate' | 'pdf' | 'email'>('');
  const [error, setError] = useState('');
  const [view, setView] = useState<ViewMode>('groups');
  const [editing, setEditing] = useState<MatchView | null>(null);

  const load = useCallback(() => {
    if (!token || !id) return;
    getFixture(id, token)
      .then(setFixture)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al obtener el fixture'))
      .finally(() => setLoading(false));
  }, [token, id]);

  useEffect(load, [load]);

  const refresh = () => { load(); reload(); };
  const hasFixture = !!fixture && fixture.groups.length > 0;

  const handleGenerate = async () => {
    if (!token || !id) return;
    if (hasFixture) {
      const ok = await confirm({
        title: 'Volver a generar la fase de grupos',
        message: 'Se arman de nuevo los grupos y horarios. Se pierden los cambios manuales, los resultados cargados y las llaves.',
        confirmLabel: 'Generar de nuevo',
        tone: 'primary',
        icon: 'refresh',
      });
      if (!ok) return;
    }
    setError('');
    setBusy('generate');
    try {
      const f = await generateFixture(id, token);
      setFixture(f);
      reload();
      toast(f.unscheduled.length ? `Fixture generado: ${f.unscheduled.length} partido(s) quedaron sin horario` : 'Fixture generado: todos los partidos tienen horario');
      if (f.unscheduled.length) setView('grid');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el fixture');
    } finally {
      setBusy('');
    }
  };

  const handleMove = async (m: MatchView, courtId: string | null, turn: number | null) => {
    if (!token || !id) return;
    try {
      await moveMatch(id, m.id, courtId, turn, token);
      load();
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al mover el partido', 'error');
    }
  };

  const handlePdf = async () => {
    if (!token || !id || !tournament) return;
    setBusy('pdf');
    try {
      await downloadFixturePdf(id, tournament.name, token);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al generar el PDF', 'error');
    } finally {
      setBusy('');
    }
  };

  const handleEmail = async () => {
    if (!token || !id || !tournament) return;
    const ok = await confirm({
      title: 'Mandar la planilla por mail',
      message: 'Cada jugador recibe sus partidos (día, hora, cancha y rival) y la planilla completa en PDF.',
      confirmLabel: 'Enviar mails',
      tone: 'primary',
      icon: 'send',
    });
    if (!ok) return;
    setBusy('email');
    try {
      const r = await emailFixture(id, token);
      const extra = [
        r.withoutEmail.length && `${r.withoutEmail.length} sin email (${r.withoutEmail.join(', ')})`,
        r.failed.length && `${r.failed.length} con error`,
      ].filter(Boolean).join(' · ');
      toast(`Se enviaron ${r.sent} mail(s)${extra ? `. ${extra}` : ''}`, r.failed.length ? 'error' : 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al enviar los mails', 'error');
    } finally {
      setBusy('');
    }
  };

  if (!tournament) {
    return <Layout><TournamentPlaceholder notFound={notFound} /></Layout>;
  }

  const issues = fixture ? fixture.groups.flatMap(g => g.matches).filter(m => m.turn !== null && m.issues.length) : [];
  const canGenerate = tournament.pairCount >= 2 && tournament.courtCount > 0;

  return (
    <Layout>
      <TournamentHeader
        tournament={tournament}
        actions={hasFixture && (
          <>
            <Button variant="secondary" icon="download" onClick={handlePdf} loading={busy === 'pdf'}>PDF</Button>
            <Button variant="secondary" icon="send" onClick={handleEmail} loading={busy === 'email'}>Enviar por mail</Button>
            <Button variant="secondary" icon="refresh" onClick={handleGenerate} loading={busy === 'generate'}>Regenerar</Button>
          </>
        )}
      />

      {error && <Alert style={{ marginBottom: 16 }}>{error}</Alert>}

      {loading ? <LoadingBlock /> : !hasFixture ? (
        <Card>
          <EmptyState
            icon="calendar"
            title="Armá la fase de grupos"
            description={canGenerate
              ? `Se arman grupos de 4 con las ${tournament.pairCount} parejas y se asigna cancha y horario a cada partido respetando las franjas que eligió cada pareja. Después podés mover los partidos a mano.`
              : 'Antes necesitás al menos 2 parejas inscriptas y una sede con canchas.'}
            action={canGenerate
              ? <Button icon="zap" onClick={handleGenerate} loading={busy === 'generate'}>Generar grupos y horarios</Button>
              : <Button variant="secondary" onClick={() => navigate(tournament.pairCount < 2 ? `/tournaments/${id}` : `/tournaments/${id}/venues`)}>
                  {tournament.pairCount < 2 ? 'Inscribir parejas' : 'Cargar sedes y canchas'}
                </Button>}
          />
        </Card>
      ) : (
        <>
          <div className="stats">
            <Stat label="Grupos" value={fixture!.groups.length} icon="layers" hint={fixture!.date ?? undefined} />
            <Stat label="Resultados" value={`${fixture!.playedMatches}/${fixture!.totalMatches}`} icon="checkCircle"
              hint={fixture!.complete ? 'Fase de grupos terminada' : 'Tocá un partido para cargarlo'} />
            <Stat label="Sin horario" value={fixture!.unscheduled.length} icon="alertTriangle"
              hint={fixture!.unscheduled.length ? 'Ubicalos en la grilla' : 'Todos tienen cancha y hora'} />
            <Stat label="Con avisos" value={issues.length} icon="clock"
              hint={issues.length ? 'Fuera de franja, superpuestos o 3 seguidos' : 'Franjas respetadas, sin 3 seguidos'} />
          </div>

          {fixture!.warnings.map(w => <Alert key={w} tone="warning" style={{ marginBottom: 12 }}>{w}</Alert>)}

          {fixture!.unscheduled.length > 0 && (
            <Alert tone="warning" title={`${fixture!.unscheduled.length} partido(s) sin horario`} style={{ marginBottom: 16 }}>
              Con las franjas elegidas no hubo forma de ubicarlos. Podés moverlos a mano en la grilla (si los ponés fuera de la
              franja de una pareja, queda marcado para que lo hables con ellos) o pedirle a una pareja que sume una franja y regenerar.
              <ul>
                {fixture!.unscheduled.map(m => (
                  <li key={m.id}>Grupo {m.groupName}: {m.pair1 && pairShort(m.pair1)} vs {m.pair2 && pairShort(m.pair2)} — {m.issues[0]}</li>
                ))}
              </ul>
            </Alert>
          )}

          <div className="view-switch">
            <Segmented<ViewMode>
              value={view}
              onChange={setView}
              options={[{ value: 'groups', label: 'Grupos y resultados' }, { value: 'grid', label: 'Grilla horaria' }]}
            />
            <span className="muted">
              {view === 'grid' ? 'Arrastrá un partido para moverlo; si soltás sobre otro, se intercambian. Doble clic para cargar el resultado.'
                : 'Pasan a las llaves los 2 primeros de cada grupo.'}
            </span>
          </div>

          {view === 'groups' ? (
            <div className="group-grid">
              {fixture!.groups.map(g => <GroupCard key={g.id} group={g} onOpen={setEditing} />)}
            </div>
          ) : (
            <ScheduleGrid fixture={fixture!} onMove={handleMove} onOpen={setEditing} />
          )}

          <NextStep tournament={tournament} current="groups"
            hint={fixture!.complete ? 'Ya están los clasificados: armá las llaves.' : `Faltan ${fixture!.totalMatches - fixture!.playedMatches} resultado(s) para armar las llaves.`} />
        </>
      )}

      {editing && id && (
        <ResultModal tournamentId={id} match={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }} />
      )}
    </Layout>
  );
}
