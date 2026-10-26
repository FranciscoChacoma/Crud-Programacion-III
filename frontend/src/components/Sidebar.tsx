import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Avatar, BrandMark, Icon, IconButton } from './ui';

export function Brand({ tagline = true }: { tagline?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <BrandMark />
      <div>
        <div className="brand-name">PadelPro</div>
        {tagline && <div className="brand-tag">Gestión de torneos</div>}
      </div>
    </div>
  );
}

export function ThemeToggle({ className = 'sidebar-logout' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <IconButton
      icon={theme === 'dark' ? 'sun' : 'moon'}
      label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      className={className}
      onClick={toggle}
    />
  );
}

const navClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`;

export function Sidebar() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><Brand /></div>
      <nav className="sidebar-section">
        <div className="sidebar-label">General</div>
        <NavLink to="/dashboard" className={navClass}>
          <Icon name="grid" size={18} /> Torneos
        </NavLink>
        <NavLink to="/players" className={navClass}>
          <Icon name="users" size={18} /> Jugadores
        </NavLink>
        <NavLink to="/tournaments/new" className={navClass}>
          <Icon name="plus" size={18} /> Nuevo torneo
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
          <Avatar name={email ?? '?'} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'var(--sidebar-text-strong)', fontSize: 13, fontWeight: 500 }}>Organizador</div>
            <div style={{ color: 'var(--sidebar-text)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </div>
          </div>
          <ThemeToggle />
          <IconButton icon="logout" label="Cerrar sesión" onClick={handleLogout} className="sidebar-logout" />
        </div>
      </div>
    </aside>
  );
}

export function Topbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="topbar">
      <NavLink to="/dashboard"><Brand tagline={false} /></NavLink>
      <div style={{ display: 'flex', gap: 4 }}>
        <NavLink to="/players" className="icon-btn sidebar-logout" aria-label="Jugadores" title="Jugadores">
          <Icon name="users" size={16} />
        </NavLink>
        <ThemeToggle />
        <IconButton icon="logout" label="Cerrar sesión" className="sidebar-logout" onClick={() => { logout(); navigate('/login'); }} />
      </div>
    </header>
  );
}
