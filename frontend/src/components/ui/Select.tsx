import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Field } from './Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: ReactNode;
  children: ReactNode;
}

export function Select({ label, hint, className, id, children, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const select = (
    <select id={selectId} className={['input', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </select>
  );
  if (!label && !hint) return select;
  return <Field label={label} hint={hint} htmlFor={selectId}>{select}</Field>;
}
