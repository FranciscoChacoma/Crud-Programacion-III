import type { ReactNode } from 'react';
import { Sidebar, Topbar } from './Sidebar';

export function Layout({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <main className={`content${narrow ? ' content-narrow' : ''}`}>{children}</main>
      </div>
    </div>
  );
}
