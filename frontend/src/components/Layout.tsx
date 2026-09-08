import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { theme } from '../theme';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: theme.color.bg }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '36px 40px', overflow: 'auto', animation: 'ui-fade-in 0.2s ease' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
