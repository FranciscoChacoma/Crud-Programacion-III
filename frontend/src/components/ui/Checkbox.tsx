import type { InputHTMLAttributes } from 'react';
import { Icon } from './Icon';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, checked, ...rest }: CheckboxProps) {
  return (
    <label className={`choice${checked ? ' checked' : ''}`}>
      <input type="checkbox" checked={checked} {...rest} />
      <span className="choice-box">{checked && <Icon name="check" size={12} strokeWidth={3} />}</span>
      {label}
    </label>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label?: string;
}

export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div className="field">
      {label && <span className="field-label">{label}</span>}
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            className={`segment${o.value === value ? ' active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
