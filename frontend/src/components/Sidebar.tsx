import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>
        <span style={s.logoIcon}>🎾</span>
        <span style={s.logoText}>Pádel</span>
      </div>
      <nav style={s.nav}>
        <button
          onClick={() => navigate('/dashboard')}
          className={`ui-nav-item${isActive('/dashboard') ? ' ui-nav-item-active' : ''}`}
          style={{ ...s.navItem, ...(isActive('/dashboard') ? s.active : {}) }}
        >
          <span style={s.icon}>🏆</span> Torneos
        </button>
      </nav>
      <button onClick={handleLogout} className="btn-ghost" style={s.logout}>
        <span style={s.icon}>🚪</span> Cerrar Sesión
      </button>
    </aside>
  );
}

const s: Record<string, CSSProperties> = {
  sidebar: {
    width: '232px', minHeight: '100vh', background: theme.color.bgElevated,
    display: 'flex', flexDirection: 'column', padding: '0',
    borderRight: `1px solid ${theme.color.border}`, flexShrink: 0,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '26px 22px 22px', borderBottom: `1px solid ${theme.color.border}`,
  },
  logoIcon: { fontSize: '24px' },
  logoText: { color: theme.color.primary, fontWeight: 800, fontSize: '19px', letterSpacing: '0.5px' },
  nav: { flex: 1, padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'none', border: 'none', color: theme.color.textMuted,
    padding: '11px 14px', borderRadius: theme.radius.sm, cursor: 'pointer',
    fontSize: '14px', fontWeight: 500, textAlign: 'left', width: '100%',
    transition: 'all 0.15s ease',
  },
  active: { background: theme.color.primaryDim, color: theme.color.primary },
  icon: { fontSize: '15px' },
  logout: {
    display: 'flex', alignItems: 'center', gap: '10px',
    margin: '14px', background: 'none', border: `1px solid ${theme.color.border}`,
    color: theme.color.textFaint, padding: '11px 14px', borderRadius: theme.radius.sm,
    cursor: 'pointer', fontSize: '13px', fontWeight: 500,
  },
};
