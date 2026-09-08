import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { theme } from '../../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: '1px solid transparent',
  borderRadius: theme.radius.sm,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
};

const sizes: Record<Size, CSSProperties> = {
  md: { padding: '11px 20px', fontSize: '14px' },
  sm: { padding: '7px 14px', fontSize: '13px' },
};

const variants: Record<Variant, CSSProperties> = {
  primary: { background: theme.color.primary, color: theme.color.onPrimary },
  secondary: { background: 'transparent', color: theme.color.textMuted, borderColor: theme.color.borderStrong },
  danger: { background: theme.color.danger, color: '#1a0505' },
  ghost: { background: 'transparent', color: theme.color.textMuted },
};

const classNames: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

export function Button({
  variant = 'primary', size = 'md', icon, fullWidth, style, className, children, ...rest
}: ButtonProps) {
  return (
    <button
      className={`${classNames[variant]}${className ? ` ${className}` : ''}`}
      style={{ ...base, ...sizes[size], ...variants[variant], width: fullWidth ? '100%' : undefined, ...style }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
