import { useEffect, useId, useState, type CSSProperties } from 'react';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { theme } from '../theme';

interface Props {
  label: string;
  value: string;
  onChange: (name: string) => void;
}

export function PlayerAutocomplete({ label, value, onChange }: Props) {
  const id = useId();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const { results, loading } = usePlayerSearch(query);

  // Sync when `value` changes externally (e.g. async prefill in edit mode).
  useEffect(() => { setQuery(value); }, [value]);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
      <label htmlFor={id} style={s.label}>{label}</label>
      <input
        id={id}
        className="ui-field"
        style={s.input}
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Nombre del jugador..."
        autoComplete="off"
      />
      {loading && <span style={s.hint}>Buscando...</span>}
      {open && results.length > 0 && (
        <ul style={s.dropdown}>
          {results.map(p => (
            <li
              key={p.id}
              style={s.option}
              className="ui-row-hover"
              onMouseDown={() => { setQuery(p.name); onChange(p.name); setOpen(false); }}
            >
              {p.name} <span style={{ color: theme.color.textFaint }}>{p.lastName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  label: { color: theme.color.textMuted, fontSize: '13px', fontWeight: 500 },
  input: {
    background: theme.color.bgInput, border: `1px solid ${theme.color.border}`, color: theme.color.text,
    padding: '11px 14px', borderRadius: theme.radius.sm, fontSize: '14px', outline: 'none',
    width: '100%', boxSizing: 'border-box', transition: 'all 0.15s ease',
  },
  hint: { position: 'absolute', right: '12px', top: '38px', fontSize: '12px', color: theme.color.textFaint },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
    background: theme.color.bgElevated, border: `1px solid ${theme.color.border}`,
    borderRadius: theme.radius.sm, listStyle: 'none', margin: '4px 0 0', padding: '4px',
    zIndex: 100, boxShadow: theme.shadow.pop, maxHeight: '220px', overflowY: 'auto',
  },
  option: {
    padding: '9px 12px', cursor: 'pointer', fontSize: '14px', color: theme.color.text,
    borderRadius: theme.radius.sm, display: 'flex', gap: '6px',
  },
};
