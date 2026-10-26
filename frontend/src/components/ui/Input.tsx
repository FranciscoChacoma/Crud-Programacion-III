import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface FieldProps {
  label?: string;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, hint, htmlFor, children }: FieldProps) {
  return (
    <div className="field">
      {label && <label htmlFor={htmlFor} className="field-label">{label}</label>}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
}

export function Input({ label, hint, className, id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const input = <input id={inputId} className={['input', className].filter(Boolean).join(' ')} {...rest} />;
  if (!label && !hint) return input;
  return <Field label={label} hint={hint} htmlFor={inputId}>{input}</Field>;
}
