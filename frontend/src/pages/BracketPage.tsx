import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clearBracket, downloadFixturePdf, generateBracket, getBracket } from '../api/fixture';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { Layout } from '../components/Layout';
import { TournamentHeader, TournamentPlaceholder } from '../components/TournamentHeader';
import { ResultModal } from '../components/ResultModal';
import { Alert, Button, Card, CardHeader, EmptyState, Icon, LoadingBlock, useFeedback } from '../components/ui';
import { pairShort } from '../theme';
import type { BracketView, MatchView, PairView } from '../types';

function Side({ pair, seed, sets, index, winner }: {
  pair: PairView | null; seed: string | null; sets: MatchView['sets']; index: 1 | 2; winner: boolean;
}) {
  return (
    <div className={`bk-side${winner ? ' winner' : ''}${pair ? '' : ' tbd'}`}>
      {seed && <span className="bk-seed">{seed}</span>}
      <span className="bk-name" title={pair ? `${pair.player1} / ${pair.player2}` : undefined}>
        {pair ? pairShort(pair) : 'A definir'}
      </span>
      <span className="bk-sets">
        {sets.map((s, i) => <span key={i} className={(index === 1 ? s.pair1 > s.pair2 : s.pair2 > s.pair1) ? 'won' : undefined}>
          {index === 1 ? s.pair1 : s.pair2}
        </span>)}
      </span>
    </div>
  );
}

export function BracketPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { confirm, toast } = useFeedback();
  const { tournament, notFound, reload } = useTournament(id);
  const [bracket, setBracket] = useState<BracketView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<MatchView | null>(null);

  const load = useCallback(() => {
    if (!token || !id) return;
    getBracket(id, token)
      .then(setBracket)
      .catch(err => toast(err instanceof Error ? err.message : 'Error al obtener las llaves', 'error'))
      .finally(() => setLoading(false));
  }, [token, id, toast]);

  useEffect(load, [load]);

  const handleGenerate = async () => {
    if (!token || !id) return;
    setBusy(true);
    try {
      setBracket(await generateBracket(id, token));
      reload();
      toast('Llaves armadas');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al armar las llaves', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    if (!token || !id) return;
    const ok = await confirm({
      title: 'Eliminar las llaves',
      message: 'Se borran los cruces y sus resultados. Después podés corregir la fase de grupos y volver a armarlas.',
      confirmLabel: 'Eliminar llaves',
    });
    if (!ok) return;
    try {
      await clearBracket(id, token);
      load();
      reload();
      toast('Llaves eliminadas');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al eliminar las llaves', 'error');
    }
  };

  if (!tournament) {
    return <Layout><TournamentPlaceholder notFound={notFound} /></Layout>;
  }

  const hasBracket = !!bracket && bracket.rounds.length > 0;

  return (
    <Layout>
      <TournamentHeader
        tournament={tournament}
        actions={hasBracket && (
          <>
            <Button variant="secondary" icon="download" onClick={() => token && id && downloadFixturePdf(id, tournament.name, token)
              .catch(err => toast(err instanceof Error ? err.message : 'Error al generar el PDF', 'error'))}>PDF</Button>
            <Button variant="secondary" icon="trash" onClick={handleClear}>Eliminar llaves</Button>
          </>
        )}
      />

      {loading || !bracket ? <LoadingBlock /> : !hasBracket ? (
        !bracket.groupsComplete ? (
          <Card>
            <EmptyState
              icon="bracket"
              title="Primero terminá la fase de grupos"
              description={tournament.groupMatches === 0
                ? 'Todavía no se generó la fase de grupos.'
                : `Faltan ${bracket.pendingGroupMatches} resultado(s). Cuando estén todos, pasan a las llaves los 2 primeros de cada grupo.`}
              action={<Button variant="secondary" onClick={() => navigate(`/tournaments/${id}/fixture`)}>Ir a la fase de grupos</Button>}
            />
          </Card>
        ) : (
          <Card>
            <CardHeader title="Clasificados" subtitle="1° de cada grupo contra el 2° del grupo vecino (1°A vs 2°B, 1°B vs 2°A…). Dos parejas del mismo grupo sólo se pueden volver a cruzar en la final." />
            <div className="qualifiers">
              {bracket.qualifiers.map(q => (
                <div key={q.pair.id} className="qualifier">
                  <span className="bk-seed">{q.seed}</span>
                  <span className="bk-name">{pairShort(q.pair)}</span>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <Button icon="bracket" onClick={handleGenerate} loading={busy}>Armar llaves</Button>
            </div>
          </Card>
        )
      ) : (
        <>
          {bracket.champion && (
            <div className="champion">
              <span className="champion-icon"><Icon name="crown" size={26} /></span>
              <div>
                <div className="champion-label">Campeones</div>
                <div className="champion-name">{bracket.champion.player1} / {bracket.champion.player2}</div>
              </div>
            </div>
          )}
          {bracket.date && <p className="muted" style={{ marginBottom: 12 }}><Icon name="calendar" size={14} /> {bracket.date}</p>}
          {!bracket.champion && (
            <Alert tone="info" style={{ marginBottom: 16 }}>
              Tocá un partido para cargar el resultado: el ganador pasa solo a la ronda siguiente.
            </Alert>
          )}
          <div className="bracket">
            {bracket.rounds.map(r => (
              <div key={r.size} className="bk-round">
                <div className="bk-round-title">{r.name}</div>
                <div className="bk-round-matches">
                  {r.matches.map(m => {
                    const ready = !!m.pair1 && !!m.pair2;
                    return (
                      <button key={m.id} type="button" className={`bk-match${ready ? '' : ' waiting'}`}
                        disabled={!ready} onClick={() => setEditing(m)}>
                        <Side pair={m.pair1} seed={m.pair1Seed} sets={m.sets} index={1} winner={!!m.winnerId && m.winnerId === m.pair1?.id} />
                        <Side pair={m.pair2} seed={m.pair2Seed} sets={m.sets} index={2} winner={!!m.winnerId && m.winnerId === m.pair2?.id} />
                        <div className="bk-meta">
                          <Icon name="clock" size={12} /> {m.time ?? 'A definir'}
                          {m.courtName && <> · {m.courtName}</>}
                          {ready && !m.winnerId && <span className="bk-cta">Cargar resultado</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {editing && id && (
        <ResultModal tournamentId={id} match={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); reload(); }} />
      )}
    </Layout>
  );
}
