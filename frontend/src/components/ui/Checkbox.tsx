import type { InputHTMLAttributes } from 'react';
import { theme } from '../../theme';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, checked, style, ...rest }: CheckboxProps) {
  return (
    <label
      className="ui-checkbox-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: theme.radius.sm,
        border: `1px solid ${checked ? theme.color.primary : theme.color.border}`,
        background: checked ? theme.color.primaryDim : theme.color.bgInput,
        color: checked ? theme.color.primaryStrong : theme.color.textMuted,
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.15s ease',
        userSelect: 'none',
        ...style,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        style={{ accentColor: theme.color.primary, width: '15px', height: '15px', cursor: 'pointer' }}
        {...rest}
      />
      {label}
    </label>
  );
}
