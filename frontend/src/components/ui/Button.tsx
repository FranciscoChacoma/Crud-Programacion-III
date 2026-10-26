import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', icon, loading, fullWidth, className, children, disabled, type = 'button', ...rest
}: ButtonProps) {
  const classes = ['btn', `btn-${variant}`, size === 'sm' && 'btn-sm', fullWidth && 'btn-block', className]
    .filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <Spinner size={14} /> : icon && <Icon name={icon} size={size === 'sm' ? 15 : 16} />}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  danger?: boolean;
}

export function IconButton({ icon, label, danger, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={['icon-btn', danger && 'danger', className].filter(Boolean).join(' ')}
      title={label}
      aria-label={label}
      {...rest}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}
