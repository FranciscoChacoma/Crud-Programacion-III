import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

interface StatProps {
  label: string;
  value: ReactNode;
  icon?: IconName;
  hint?: ReactNode;
}

export function Stat({ label, value, icon, hint }: StatProps) {
  return (
    <div className="card stat">
      <div className="stat-label">{icon && <Icon name={icon} size={16} />}{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
