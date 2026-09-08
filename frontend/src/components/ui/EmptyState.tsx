import type { ReactNode } from 'react';
import { theme } from '../../theme';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = '🎾', title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px', color: theme.color.textFaint,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
    }}>
      <div style={{ fontSize: '40px', opacity: 0.6 }}>{icon}</div>
      <p style={{ color: theme.color.textMuted, fontSize: '15px', margin: 0 }}>{title}</p>
      {description && <p style={{ fontSize: '13px', margin: 0, maxWidth: '360px' }}>{description}</p>}
      {action}
    </div>
  );
}
