import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generateFixture, getFixture } from '../api/fixture';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { Layout } from '../components/Layout';
import { TournamentHeader, TournamentPlaceholder } from '../components/TournamentHeader';
import {
  Alert, Badge, Button, Card, CardHeader, EmptyState, Icon, LoadingBlock, Stat, Table, Td, Th, Tr, useFeedback,
} from '../components/ui';
import { categoryLabel, levelTone, scheduleLabel } from '../theme';
import type { FixtureResult, PairSummary } from '../types';

const pairName = (p: PairSummary) => `${p.player1} / ${p.player2}`;

export function FixturePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { confirm, toast } = useFeedback();
  const { tournament, notFound } = useTournament(id);
  const [fixture, setFixture] = useState<FixtureResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !id) return;
    getFixture(id, token)
      .then(setFixture)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al obtener el fixture'))
      .finally(() => setLoading(false));
  }, [token, id]);

  const hasFixture = !!fixture && fixture.groups.length > 0;

  const handleGenerate = async () => {
    if (!token || !id) return;
    if (hasFixture) {
      const ok = await confirm({
        title: 'Regenerar fixture',
        message: 'Se reemplazarán los grupos, partidos y horarios actuales por una nueva asignación.',
        confirmLabel: 'Regenerar',
        tone: 'primary',
        icon: 'refresh',
      });
      if (!ok) return;
    }
    setError('');
    setGenerating(true);
    try {
      setFixture(await generateFixture(id, token));
      toast('Fixture generado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el fixture');
    } finally {
      setGenerating(false);
    }
  };

  if (!tournament) {
    return <Layout><TournamentPlaceholder notFound={notFound} /></Layout>;
  }

  const totalMatches = fixture?.groups.reduce((n, g) => n + g.matches.length, 0) ?? 0;

  return (
    <Layout>
      <TournamentHeader
        tournament={tournament}
        actions={
          <Button icon={hasFixture ? 'refresh' : 'zap'} onClick={handleGenerate} loading={generating}>
            {hasFixture ? 'Regenerar fixture' : 'Generar fixture'}
          </Button>
        }
      />

      {error && <Alert style={{ marginBottom: 16 }}>{error}</Alert>}

      {loading ? <LoadingBlock /> : (
        <>
          {fixture && fixture.warnings.length > 0 && (
            <Alert tone="warning" title="Advertencias" style={{ marginBottom: 16 }}>
              <ul>{fixture.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </Alert>
          )}

          {!hasFixture ? (
            <Card>
              <EmptyState
                icon="calendar"
                title="Todavía no se generó el fixture"
                description="Cargá canchas e inscribí parejas. Después, con un clic se arman los grupos por nivel y se asignan canchas y horarios."
                action={<Button icon="zap" onClick={handleGenerate} loading={generating}>Generar fixture</Button>}
              />
            </Card>
          ) : (
            <>
              <div className="stats">
                <Stat label="Grupos" value={fixture!.groups.length} icon="layers" />
                <Stat label="Partidos programados" value={totalMatches} icon="calendar" />
                <Stat label="Sin horario" value={fixture!.unassignedMatches.length} icon="alertTriangle"
                  hint={fixture!.unassignedMatches.length === 0 ? 'Todos los partidos tienen horario' : 'Revisá la disponibilidad'} />
              </div>

              <div className="groups">
                {fixture!.groups.map(group => (
                  <Card key={group.name} style={{ overflow: 'hidden' }}>
                    <CardHeader
                      leading={<span className="group-letter">{group.name}</span>}
                      title={`Grupo ${group.name}`}
                      subtitle={`${group.pairs.length} parejas · ${group.matches.length} partidos`}
                      actions={<Badge>Cat. {categoryLabel[group.category]}</Badge>}
                    />
                    <div className="group-pairs">
                      {group.pairs.map(p => (
                        <Badge key={p.id} tone={levelTone[p.level]} dot>{pairName(p)}</Badge>
                      ))}
                    </div>
                    {group.matches.map(m => (
                      <div key={m.id} className="match-row">
                        <div className="match">
                          <span className="match-side" title={pairName(m.pair1)}>{pairName(m.pair1)}</span>
                          <span className="match-vs">vs</span>
                          <span className="match-side" title={pairName(m.pair2)}>{pairName(m.pair2)}</span>
                        </div>
                        <div className="match-info">
                          <span className="chip"><Icon name="court" size={12} />&nbsp;{m.courtName}</span>
                          <span className="chip"><Icon name="clock" size={12} />&nbsp;{scheduleLabel[m.timeSlot]}</span>
                        </div>
                      </div>
                    ))}
                  </Card>
                ))}
              </div>
            </>
          )}

          {fixture && fixture.unassignedMatches.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h2 className="card-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--warning)' }}><Icon name="alertTriangle" size={18} /></span>
                Partidos sin horario asignado
              </h2>
              <Table>
                <thead>
                  <tr>
                    <Th>Grupo</Th>
                    <Th>Partido</Th>
                    <Th>Motivo</Th>
                  </tr>
                </thead>
                <tbody>
                  {fixture.unassignedMatches.map((u, i) => (
                    <Tr key={i} hoverable={false}>
                      <Td className="cell-strong">{u.groupName}</Td>
                      <Td>
                        <span className="cell-strong">{pairName(u.pair1)}</span>
                        <span className="match-vs"> vs </span>
                        <span className="cell-strong">{pairName(u.pair2)}</span>
                      </Td>
                      <Td style={{ color: 'var(--warning-text)' }}>{u.reason}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
