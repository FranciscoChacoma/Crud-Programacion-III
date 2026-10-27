import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Icon, LoadingBlock, PageHeader } from './ui';
import { categoryLabel, formatDate, stageLabel, stageTone, typeLabel } from '../theme';
import type { Tournament } from '../types';

// Placeholder while the tournament loads, or when it doesn't exist / isn't the organizer's.
export function TournamentPlaceholder({ notFound }: { notFound: boolean }) {
  const navigate = useNavigate();
  if (!notFound) return <LoadingBlock />;
  return (
    <Card>
      <EmptyState
        icon="alertCircle"
        title="Torneo no encontrado"
        description="El torneo no existe o fue eliminado."
        action={<Button variant="secondary" onClick={() => navigate('/dashboard')}>Volver a torneos</Button>}
      />
    </Card>
  );
}

export type StepKey = 'pairs' | 'venues' | 'groups' | 'bracket';

interface Step {
  key: StepKey;
  to: string;
  title: string;
  detail: string;
  done: boolean;
  end?: boolean;
}

function tournamentSteps(t: Tournament): Step[] {
  const base = `/tournaments/${t.id}`;
  const groupsDone = t.groupMatches > 0 && t.playedGroupMatches === t.groupMatches;
  return [
    {
      key: 'pairs', to: base, end: true, title: 'Parejas',
      detail: t.pairCount === 1 ? '1 pareja' : `${t.pairCount} parejas`,
      done: t.pairCount >= 2,
    },
    {
      key: 'venues', to: `${base}/venues`, title: 'Sedes y canchas',
      detail: t.courtCount ? `${t.venues.length} sede${t.venues.length === 1 ? '' : 's'} · ${t.courtCount} canchas` : 'Sin canchas',
      done: t.courtCount > 0,
    },
    {
      key: 'groups', to: `${base}/fixture`, title: 'Fase de grupos',
      detail: t.groupMatches ? `${t.playedGroupMatches}/${t.groupMatches} resultados` : 'Sin generar',
      done: groupsDone,
    },
    {
      key: 'bracket', to: `${base}/bracket`, title: 'Llaves',
      detail: t.champion ? `Campeón: ${t.champion}` : t.bracketMatches ? `${t.playedBracketMatches}/${t.bracketMatches} resultados` : 'Pendiente',
      done: !!t.champion,
    },
  ];
}

export function TournamentHeader({ tournament, actions }: { tournament: Tournament; actions?: ReactNode }) {
  const steps = tournamentSteps(tournament);
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Torneos', to: '/dashboard' }, { label: tournament.name }]}
        title={tournament.name}
        meta={
          <>
            <Badge tone={stageTone[tournament.stage]} dot>{stageLabel[tournament.stage]}</Badge>
            <Badge tone="primary">Categoría {categoryLabel[tournament.category]}</Badge>
            <Badge>{typeLabel[tournament.type]}</Badge>
            {tournament.startDate && (
              <span className="page-meta-item"><Icon name="calendar" size={14} />{formatDate(tournament.startDate)}</span>
            )}
          </>
        }
        actions={actions}
      />
      <nav className="stepper" aria-label="Pasos del torneo">
        {steps.map((s, i) => (
          <NavLink key={s.key} to={s.to} end={s.end}
            className={({ isActive }) => ['step', s.done && 'done', isActive && 'active'].filter(Boolean).join(' ')}>
            <span className="step-num">{s.done ? <Icon name="check" size={14} strokeWidth={3} /> : i + 1}</span>
            <span className="step-text">
              <span className="step-title">{s.title}</span>
              <span className="step-detail">{s.detail}</span>
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

/** Pie de página que lleva al paso siguiente, para que el flujo tenga un orden claro. */
export function NextStep({ tournament, current, hint }: { tournament: Tournament; current: StepKey; hint?: string }) {
  const navigate = useNavigate();
  const steps = tournamentSteps(tournament);
  const idx = steps.findIndex(s => s.key === current);
  const next = steps[idx + 1];
  if (!next) return null;
  const ready = steps[idx].done;
  return (
    <div className={`next-step${ready ? ' ready' : ''}`}>
      <div>
        <div className="next-step-label">{ready ? 'Paso completo' : 'Siguiente paso'}</div>
        <div className="next-step-title">{idx + 2}. {next.title}</div>
        {hint && <div className="next-step-hint">{hint}</div>}
      </div>
      <Button variant={ready ? 'primary' : 'secondary'} onClick={() => navigate(next.to)}>
        Continuar <Icon name="arrowRight" size={16} />
      </Button>
    </div>
  );
}
