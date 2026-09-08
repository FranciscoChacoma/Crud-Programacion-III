import { useId, type InputHTMLAttributes } from 'react';
import { theme } from '../../theme';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, style, className, id, ...rest }: InputProps) {
  const autoId = useId();
  id = id ?? (label ? autoId : undefined);
  const inputEl = (
    <input
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
    />
  );
  if (!label) return inputEl;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ color: theme.color.textMuted, fontSize: '13px', fontWeight: 500 }}>{label}</label>
      {inputEl}
    </div>
  );
}
