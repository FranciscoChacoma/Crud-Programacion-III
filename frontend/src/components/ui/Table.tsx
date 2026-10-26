import type { HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  toolbar?: ReactNode;
}

export function Table({ toolbar, className, ...rest }: TableProps) {
  return (
    <div className="table-wrap">
      {toolbar && <div className="table-toolbar">{toolbar}</div>}
      <div className="table-scroll">
        <table className={['table', className].filter(Boolean).join(' ')} {...rest} />
      </div>
    </div>
  );
}

export function Th({ children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...rest}><span className="th-inner">{children}</span></th>;
}

export function Td(props: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} />;
}

export function Tr({ hoverable = true, className, ...rest }: HTMLAttributes<HTMLTableRowElement> & { hoverable?: boolean }) {
  return <tr className={[hoverable && 'hoverable', className].filter(Boolean).join(' ') || undefined} {...rest} />;
}
