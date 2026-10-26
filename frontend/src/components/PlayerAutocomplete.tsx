import { useEffect, useId, useState } from 'react';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { Avatar, Spinner } from './ui';

interface Props {
  label: string;
  value: string;
  onChange: (name: string) => void;
  onSelect?: (name: string, lastName: string) => void;
}

export function PlayerAutocomplete({ label, value, onChange, onSelect }: Props) {
  const id = useId();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const { results, loading } = usePlayerSearch(query);

  // Sync when `value` changes externally (e.g. async prefill in edit mode).
  useEffect(() => { setQuery(value); }, [value]);

  return (
    <div className="field">
      <label htmlFor={id} className="field-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          className="input"
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar o escribir nombre"
          autoComplete="off"
          required
        />
        {loading && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
            <Spinner size={14} />
          </span>
        )}
        {open && results.length > 0 && (
          <ul className="dropdown" role="listbox">
            {results.map(p => (
              <li
                key={p.id}
                role="option"
                aria-selected={false}
                className="dropdown-item"
                onMouseDown={() => {
                  setQuery(p.name);
                  onChange(p.name);
                  onSelect?.(p.name, p.lastName);
                  setOpen(false);
                }}
              >
                <Avatar name={p.name} lastName={p.lastName} />
                <span className="person-name">{p.name} {p.lastName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
