import type { ReactNode } from 'react';
import { avatarIndex, type Tone } from '../../theme';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
}

export function Badge({ children, tone = 'neutral', dot }: BadgeProps) {
  return (
    <span className={`badge${tone !== 'neutral' ? ` badge-${tone}` : ''}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

export function Avatar({ name, lastName = '', size }: { name: string; lastName?: string; size?: 'lg' }) {
  const initials = `${name.trim()[0] ?? ''}${lastName.trim()[0] ?? ''}`.toUpperCase() || '?';
  const classes = ['avatar', `avatar-${avatarIndex(`${name} ${lastName}`)}`, size && `avatar-${size}`].filter(Boolean).join(' ');
  return <span className={classes}>{initials}</span>;
}
