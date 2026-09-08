import type { ReactNode } from 'react';
import { theme } from '../../theme';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  variant?: 'solid' | 'soft';
}

export function Badge({ children, color = theme.color.primary, variant = 'solid' }: BadgeProps) {
  const solid = variant === 'solid';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: theme.radius.pill,
        fontSize: '12px',
        fontWeight: 700,
        background: solid ? color : `${color}22`,
        color: solid ? theme.color.onPrimary : color,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
