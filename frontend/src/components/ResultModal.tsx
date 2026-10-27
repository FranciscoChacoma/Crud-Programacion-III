import { useState } from 'react';
import { clearResult, saveResult } from '../api/fixture';
import { useAuth } from '../context/AuthContext';
import { pairShort } from '../theme';
import { Alert, Button, Modal, useFeedback } from './ui';
import type { MatchView, SetScore } from '../types';

interface Props {
  tournamentId: string;
  match: MatchView;
  onClose: () => void;
  onSaved: () => void;
}

type Row = [string, string];

const SET_LABELS = ['1er set', '2do set', '3er set / super tie-break'];

export function ResultModal({ tournamentId, match, onClose, onSaved }: Props) {
  const { token } = useAuth();
  const { toast } = useFeedback();
  const [rows, setRows] = useState<Row[]>(() =>
    [0, 1, 2].map(i => match.sets[i] ? [String(match.sets[i].pair1), String(match.sets[i].pair2)] as Row : ['', ''] as Row));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const parsed = rows.map(([a, b]) => (a === '' || b === '' ? null : { pair1: Number(a), pair2: Number(b) }));
  const winnerOf = (s: SetScore | null) => (s && s.pair1 !== s.pair2 ? (s.pair1 > s.pair2 ? 1 : 2) : 0);
  const w1 = winnerOf(parsed[0]);
  const w2 = winnerOf(parsed[1]);
  const needsThird = w1 !== 0 && w2 !== 0 && w1 !== w2;
  const w3 = needsThird ? winnerOf(parsed[2]) : 0;
  const matchWinner = w1 && w1 === w2 ? w1 : w3;

  const name1 = match.pair1 ? pairShort(match.pair1) : 'Pareja 1';
  const name2 = match.pair2 ? pairShort(match.pair2) : 'Pareja 2';

  const set = (i: number, side: 0 | 1, value: string) => {
    if (!/^\d{0,2}$/.test(value)) return;
    setRows(prev => prev.map((r, j) => (j === i ? (side === 0 ? [value, r[1]] : [r[0], value]) : r)) as Row[]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const sets = parsed.slice(0, needsThird ? 3 : 2);
    if (sets.some(s => !s)) {
      setError(needsThird ? 'Quedaron 1 a 1: cargá el tercer set.' : 'Cargá los games de los dos primeros sets.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await saveResult(tournamentId, match.id, sets as SetScore[], token);
      toast('Resultado guardado');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el resultado');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await clearResult(tournamentId, match.id, token);
      toast('Resultado borrado');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al borrar el resultado');
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Resultado del partido"
      description={[match.groupName && `Grupo ${match.groupName}`, match.time, match.courtName].filter(Boolean).join(' · ')}
      onClose={onClose}
      footer={
        <>
          {match.winnerId && <Button variant="ghost" icon="trash" onClick={handleClear} disabled={saving}>Borrar</Button>}
          <span style={{ flex: 1 }} />
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="result-form" loading={saving}>Guardar resultado</Button>
        </>
      }
    >
      <form id="result-form" onSubmit={handleSave} className="score-form">
        <div className="score-grid">
          <span />
          <span className={`score-team${matchWinner === 1 ? ' winner' : ''}`} title={name1}>{name1}</span>
          <span className={`score-team${matchWinner === 2 ? ' winner' : ''}`} title={name2}>{name2}</span>
          {SET_LABELS.map((label, i) => {
            const disabled = i === 2 && !needsThird;
            return [
              <span key={`l${i}`} className={`score-label${disabled ? ' disabled' : ''}`}>{label}</span>,
              ...[0, 1].map(side => (
                <input key={`${i}-${side}`} className="input score-input" inputMode="numeric" disabled={disabled}
                  aria-label={`${label}, games de ${side === 0 ? name1 : name2}`}
                  value={disabled ? '' : rows[i][side]} autoFocus={i === 0 && side === 0}
                  onChange={e => set(i, side as 0 | 1, e.target.value)} />
              )),
            ];
          })}
        </div>
        <p className="muted score-help">
          {matchWinner ? `Gana ${matchWinner === 1 ? name1 : name2}.`
            : needsThird ? 'Quedaron 1 a 1 en sets: cargá el tercero (o el super tie-break a 10).'
            : 'Cargá los games de cada set. Si una pareja gana los dos primeros, no hay tercer set.'}
        </p>
        {error && <Alert>{error}</Alert>}
      </form>
    </Modal>
  );
}
