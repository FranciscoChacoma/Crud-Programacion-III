import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateFixture, getFixture } from '../api/fixture';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Badge, Button, Card, EmptyState, PageHeader, Spinner, Table, Td, Th, Tr } from '../components/ui';
import { categoryLabel, levelColor, scheduleLabel, theme } from '../theme';
import type { FixtureResult } from '../types';

export function FixturePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [fixture, setFixture] = useState<FixtureResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [token, id]);

  const load = () => {
    if (!token || !id) return;
    setLoading(true);
    getFixture(id, token).then(setFixture).catch(err => setError(err.message)).finally(() => setLoading(false));
  };

  const handleGenerate = async () => {
    if (!token || !id) return;
    setError('');
    setGenerating(true);
    try {
      const result = await generateFixture(id, token);
      setFixture(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el fixture');
    } finally {
      setGenerating(false);
    }
  };

  const hasFixture = !!fixture && fixture.groups.length > 0;

  return (
    <Layout>
      <PageHeader
        title="Fixture"
        onBack={() => navigate(`/tournaments/${id}`)}
        backLabel="Torneo"
        subtitle={<p style={s.sub}>Grupos, horarios y canchas asignados automáticamente.</p>}
        actions={
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generando...' : hasFixture ? '↻ Regenerar Fixture' : '⚡ Generar Fixture'}
          </Button>
        }
      />

      {error && <Card style={{ ...s.banner, borderColor: theme.color.danger, background: theme.color.dangerDim, marginBottom: '20px' }}>
        <p style={{ ...s.bannerText, color: theme.color.danger }}>{error}</p>
      </Card>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div>
      ) : (
        <>
          {fixture && fixture.warnings.length > 0 && (
            <Card style={{ ...s.banner, borderColor: theme.color.warning, background: theme.color.warningDim, marginBottom: '20px' }}>
              {fixture.warnings.map((w, i) => (
                <p key={i} style={{ ...s.bannerText, color: theme.color.warning }}>⚠ {w}</p>
              ))}
            </Card>
          )}

          {!hasFixture ? (
            <EmptyState
              title="Todavía no se generó el fixture de este torneo"
              description="Cargá canchas y parejas, y después generalo con un clic: se arman los grupos por nivel y se asignan horarios automáticamente."
            />
          ) : (
            <div style={s.groupsWrap}>
              {fixture!.groups.map(group => (
                <Card key={group.name} padding="0" style={{ overflow: 'hidden' }}>
                  <div style={s.groupHeader}>
                    <span style={s.groupTitle}>Grupo {group.name}</span>
                    <Badge variant="soft">{categoryLabel[group.category]}</Badge>
                    <span style={s.groupPairCount}>{group.pairs.length} parejas</span>
                  </div>
                  <div style={s.groupPairs}>
                    {group.pairs.map(p => (
                      <span key={p.id} style={s.pairChip}>
                        <span style={{ ...s.pairChipDot, background: levelColor[p.level] }} />
                        {p.player1} / {p.player2}
                      </span>
                    ))}
                  </div>
                  {group.matches.length > 0 && (
                    <div style={{ padding: '0 4px 4px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <Th>Partido</Th>
                            <Th>Cancha</Th>
                            <Th>Horario</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.matches.map(m => (
                            <Tr key={m.id}>
                              <Td>{m.pair1.player1}/{m.pair1.player2} <span style={{ color: theme.color.textFaint }}>vs</span> {m.pair2.player1}/{m.pair2.player2}</Td>
                              <Td>{m.courtName}</Td>
                              <Td>{scheduleLabel[m.timeSlot]}</Td>
                            </Tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {fixture && fixture.unassignedMatches.length > 0 && (
            <div style={{ marginTop: '28px' }}>
              <h2 style={s.unassignedTitle}>⚠ Partidos sin horario asignado</h2>
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
                      <Td>{u.groupName}</Td>
                      <Td>{u.pair1.player1}/{u.pair1.player2} <span style={{ color: theme.color.textFaint }}>vs</span> {u.pair2.player1}/{u.pair2.player2}</Td>
                      <Td style={{ color: theme.color.warning }}>{u.reason}</Td>
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

const s: Record<string, CSSProperties> = {
  sub: { color: theme.color.textFaint, fontSize: '14px', margin: 0 },
  banner: { border: '1px solid', padding: '14px 18px' },
  bannerText: { margin: '2px 0', fontSize: '13px', fontWeight: 500 },
  groupsWrap: { display: 'flex', flexDirection: 'column', gap: '18px' },
  groupHeader: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px',
    background: theme.color.bgElevated, borderBottom: `1px solid ${theme.color.border}`,
  },
  groupTitle: { color: theme.color.text, fontSize: '16px', fontWeight: 700 },
  groupPairCount: { color: theme.color.textFaint, fontSize: '12px', marginLeft: 'auto' },
  groupPairs: { display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px 20px' },
  pairChip: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', background: theme.color.bgInput,
    border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.pill, padding: '4px 12px',
    fontSize: '12px', color: theme.color.textMuted,
  },
  pairChipDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  unassignedTitle: { color: theme.color.warning, fontSize: '16px', fontWeight: 700, margin: '0 0 14px' },
};
