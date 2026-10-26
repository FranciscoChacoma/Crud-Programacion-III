import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCourts } from '../api/courts';
import { getPairsByTournament } from '../api/pairs';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, EmptyState, Icon, LoadingBlock, PageHeader, type IconName } from './ui';
import { categoryLabel, typeLabel } from '../theme';
import type { Tournament } from '../types';

interface Counts {
  pairs?: number;
  courts?: number;
}

interface Props {
  tournament: Tournament;
  actions?: ReactNode;
  // Counts the current page already knows (and keeps up to date); they take precedence over the fetched ones.
  counts?: Counts;
}

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

export function TournamentHeader({ tournament, actions, counts = {} }: Props) {
  const { token } = useAuth();
  const [fetched, setFetched] = useState<Counts>({});

  useEffect(() => {
    if (!token) return;
    getPairsByTournament(tournament.id, token).then(p => setFetched(c => ({ ...c, pairs: p.length }))).catch(() => {});
    getCourts(tournament.id, token).then(p => setFetched(c => ({ ...c, courts: p.length }))).catch(() => {});
  }, [token, tournament.id]);

  const base = `/tournaments/${tournament.id}`;
  const tabs: { to: string; label: string; icon: IconName; count?: number; end?: boolean }[] = [
    { to: base, label: 'Parejas', icon: 'users', count: counts.pairs ?? fetched.pairs, end: true },
    { to: `${base}/courts`, label: 'Canchas', icon: 'court', count: counts.courts ?? fetched.courts },
    { to: `${base}/fixture`, label: 'Fixture', icon: 'calendar' },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Torneos', to: '/dashboard' }, { label: tournament.name }]}
        title={tournament.name}
        meta={
          <>
            <Badge tone="primary">Categoría {categoryLabel[tournament.category]}</Badge>
            <Badge>{typeLabel[tournament.type]}</Badge>
          </>
        }
        actions={actions}
      />
      <nav className="tabs">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            <Icon name={t.icon} size={16} />
            {t.label}
            {t.count !== undefined && <span className="tab-count">{t.count}</span>}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
