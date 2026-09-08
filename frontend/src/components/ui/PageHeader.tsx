import type { ReactNode } from 'react';
import { theme } from '../../theme';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, onBack, backLabel = 'Volver', actions }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: '28px', gap: '16px', flexWrap: 'wrap',
    }}>
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="btn-ghost"
            style={{
              background: 'none', border: 'none', color: theme.color.primary, cursor: 'pointer',
              fontSize: '13px', padding: '0 0 10px', fontWeight: 600,
            }}
          >
            ← {backLabel}
          </button>
        )}
        <h1 style={{ color: theme.color.text, margin: 0, fontSize: '26px', fontWeight: 700 }}>{title}</h1>
        {subtitle && <div style={{ marginTop: '8px' }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}
