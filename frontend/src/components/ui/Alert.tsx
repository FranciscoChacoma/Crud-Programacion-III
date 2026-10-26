import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

interface AlertProps {
  tone?: 'danger' | 'warning' | 'info';
  title?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

const icons = { danger: 'alertCircle', warning: 'alertTriangle', info: 'alertCircle' } as const;

export function Alert({ tone = 'danger', title, children, style }: AlertProps) {
  return (
    <div className={`alert alert-${tone}`} role={tone === 'danger' ? 'alert' : 'status'} style={style}>
      <Icon name={icons[tone]} size={18} />
      <div>
        {title && <div className="alert-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}
