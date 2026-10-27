import { useState } from 'react';
import { Icon } from './ui';
import { SCHEDULES, pairShort, scoreText, scheduleShortLabel } from '../theme';
import type { FixtureView, MatchView } from '../types';

interface Props {
  fixture: FixtureView;
  onMove: (match: MatchView, courtId: string | null, turn: number | null) => void;
  onOpen: (match: MatchView) => void;
}

// Una franja de 3 h = 2 turnos de 1:30: turno t pertenece a la franja floor(t / 2).
const franjaOf = (turn: number) => SCHEDULES[Math.floor(turn / 2)];

function availableTurns(m: MatchView): Set<number> {
  const ok = new Set<number>();
  for (let t = 0; t < 8; t++) {
    if (m.pair1?.availability.includes(franjaOf(t)) && m.pair2?.availability.includes(franjaOf(t))) ok.add(t);
  }
  return ok;
}

/**
 * Grilla turnos × canchas. Los partidos se arrastran (o se tocan y después se
 * toca el destino) para moverlos; si el lugar está ocupado se intercambian.
 */
export function ScheduleGrid({ fixture, onMove, onOpen }: Props) {
  const [dragging, setDragging] = useState<MatchView | null>(null);
  const [selected, setSelected] = useState<MatchView | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const all = fixture.groups.flatMap(g => g.matches);
  const groupIndex = new Map(fixture.groups.map((g, i) => [g.name, i]));
  const at = new Map(all.filter(m => m.turn !== null && m.courtId).map(m => [`${m.courtId}|${m.turn}`, m]));
  const active = dragging ?? selected;
  const okTurns = active ? availableTurns(active) : null;

  const drop = (courtId: string | null, turn: number | null) => {
    const m = active;
    setDragging(null);
    setSelected(null);
    setOver(null);
    if (!m || (m.courtId === courtId && m.turn === turn)) return;
    onMove(m, courtId, turn);
  };

  const card = (m: MatchView) => (
    <div
      key={m.id}
      className={['sched-card', `group-tone-${(groupIndex.get(m.groupName ?? '') ?? 0) % 8}`,
        m.issues.length > 0 && m.turn !== null && 'has-issue', selected?.id === m.id && 'selected', m.winnerId && 'played']
        .filter(Boolean).join(' ')}
      draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', m.id); e.dataTransfer.effectAllowed = 'move'; setDragging(m); }}
      onDragEnd={() => { setDragging(null); setOver(null); }}
      onClick={e => {
        e.stopPropagation();
        if (selected && selected.id !== m.id) { drop(m.courtId, m.turn); return; }
        setSelected(selected?.id === m.id ? null : m);
      }}
      onDoubleClick={() => onOpen(m)}
      title={m.issues.length ? m.issues.join('\n') : 'Arrastrá para mover · doble clic para cargar el resultado'}
    >
      <div className="sched-card-top">
        <span className="sched-group">Grupo {m.groupName}</span>
        {m.issues.length > 0 && m.turn !== null && <Icon name="alertTriangle" size={13} />}
        {m.winnerId && <span className="sched-score">{scoreText(m.sets)}</span>}
      </div>
      <div className="sched-pair">{m.pair1 && pairShort(m.pair1)}</div>
      <div className="sched-pair">{m.pair2 && pairShort(m.pair2)}</div>
    </div>
  );

  const unscheduled = all.filter(m => m.turn === null || !m.courtId);

  return (
    <div className="sched" onClick={() => setSelected(null)}>
      <div
        className={`sched-tray${over === 'tray' ? ' over' : ''}`}
        onDragOver={e => { e.preventDefault(); setOver('tray'); }}
        onDragLeave={() => setOver(null)}
        onDrop={e => { e.preventDefault(); drop(null, null); }}
        onClick={e => { if (selected) { e.stopPropagation(); drop(null, null); } }}
      >
        <div className="sched-tray-title">
          <Icon name="alertTriangle" size={15} />
          Sin horario ({unscheduled.length})
          <span className="muted">· {unscheduled.length ? 'arrastralos a un lugar libre de la grilla' : 'soltá acá un partido para sacarlo de la grilla'}</span>
        </div>
        {unscheduled.length > 0 && (
          <div className="sched-tray-items">
            {unscheduled.map(m => (
              <div key={m.id} className="sched-tray-item">
                {card(m)}
                <div className="sched-reason">{m.issues[0]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="sched-hint">
          <Icon name="arrowRight" size={14} /> Tocá el lugar de destino (un partido ocupado se intercambia). Las filas en verde les sirven a las dos parejas.
        </div>
      )}

      <div className="sched-scroll">
        <table className="sched-table">
          <thead>
            <tr>
              <th className="sched-corner">Hora</th>
              {fixture.courts.map(c => (
                <th key={c.id}>
                  <div className="sched-court">{c.name}</div>
                  <div className="sched-venue">{c.venueName}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fixture.turns.map((label, turn) => (
              <tr key={turn} className={turn % 2 === 0 ? 'franja-start' : undefined}>
                <th className="sched-time">
                  <div>{label}</div>
                  {turn % 2 === 0 && <div className="sched-franja">{scheduleShortLabel[franjaOf(turn)]}</div>}
                </th>
                {fixture.courts.map(c => {
                  const key = `${c.id}|${turn}`;
                  const m = at.get(key);
                  const fit = okTurns ? (okTurns.has(turn) ? ' fit' : ' nofit') : '';
                  return (
                    <td
                      key={key}
                      className={`sched-cell${fit}${over === key ? ' over' : ''}`}
                      onDragOver={e => { e.preventDefault(); setOver(key); }}
                      onDragLeave={() => setOver(o => (o === key ? null : o))}
                      onDrop={e => { e.preventDefault(); drop(c.id, turn); }}
                      onClick={e => { if (selected && !m) { e.stopPropagation(); drop(c.id, turn); } }}
                    >
                      {m && card(m)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
