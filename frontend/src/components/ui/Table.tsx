import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { theme } from '../../theme';

export function Table({ children, style, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div style={{
      background: theme.color.bgCard, borderRadius: theme.radius.md,
      border: `1px solid ${theme.color.border}`, overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...style }} {...rest}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function Th({ children, style, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th style={{
      padding: '13px 18px', textAlign: 'left', color: theme.color.primary, fontSize: '12px',
      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
      background: theme.color.bgElevated, borderBottom: `1px solid ${theme.color.border}`,
      ...style,
    }} {...rest}>
      {children}
    </th>
  );
}

export function Td({ children, style, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td style={{
      padding: '13px 18px', color: theme.color.text, fontSize: '14px',
      borderBottom: `1px solid ${theme.color.border}`, ...style,
    }} {...rest}>
      {children}
    </td>
  );
}

export function Tr({ children, hoverable = true, style, ...rest }: HTMLAttributes<HTMLTableRowElement> & { hoverable?: boolean }) {
  return (
    <tr className={hoverable ? 'ui-row-hover' : ''} style={{ transition: 'background 0.15s ease', ...style }} {...rest}>
      {children}
    </tr>
  );
}
