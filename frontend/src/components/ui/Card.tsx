import type { HTMLAttributes, ReactNode } from 'react';
import { theme } from '../../theme';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  padding?: string;
}

export function Card({ children, hoverable, padding = '24px', style, className, ...rest }: CardProps) {
  return (
    <div
      className={`${hoverable ? 'ui-card-hover' : ''}${className ? ` ${className}` : ''}`}
      style={{
        background: theme.color.bgCard,
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.md,
        padding,
        transition: 'all 0.15s ease',
        cursor: hoverable ? 'pointer' : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
