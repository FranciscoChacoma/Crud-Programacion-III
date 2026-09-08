import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { theme } from '../../theme';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export function Select({ label, style, className, id, children, ...rest }: SelectProps) {
  const autoId = useId();
  id = id ?? (label ? autoId : undefined);
  const selectEl = (
    <select
      id={id}
      className={`ui-field${className ? ` ${className}` : ''}`}
      style={{
        background: theme.color.bgInput,
        border: `1px solid ${theme.color.border}`,
        color: theme.color.text,
        padding: '11px 14px',
        borderRadius: theme.radius.sm,
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'all 0.15s ease',
        ...style,
      }}
      {...rest}
    >
      {children}
    </select>
  );
  if (!label) return selectEl;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ color: theme.color.textMuted, fontSize: '13px', fontWeight: 500 }}>{label}</label>
      {selectEl}
    </div>
  );
}
