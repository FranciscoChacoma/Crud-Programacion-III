import { useState, type CSSProperties } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import { theme } from '../theme';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await apiLogin(email, password);
      login(token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🎾</div>
        <h1 style={s.title}>Gestión de Pádel</h1>
        <p style={s.sub}>Iniciá sesión para continuar</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <Input label="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Contraseña" type="password" value={password}
            onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p style={s.error}>{error}</p>}
          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
        <p style={s.footer}>
          ¿No tenés cuenta? <Link to="/register" style={s.link}>Registrate</Link>
        </p>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `radial-gradient(circle at top, ${theme.color.bgElevated}, ${theme.color.bg})`,
    padding: '16px', boxSizing: 'border-box',
  },
  card: {
    background: theme.color.bgCard, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg,
    padding: '44px 36px', width: '100%', maxWidth: '400px', boxSizing: 'border-box', boxShadow: theme.shadow.card,
  },
  logo: { fontSize: '42px', textAlign: 'center', marginBottom: '12px' },
  title: { color: theme.color.primary, textAlign: 'center', margin: '0 0 4px', fontSize: '23px', fontWeight: 800 },
  sub: { color: theme.color.textFaint, textAlign: 'center', margin: '0 0 28px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  error: { color: theme.color.danger, fontSize: '13px', margin: 0 },
  footer: { textAlign: 'center', color: theme.color.textFaint, fontSize: '13px', margin: '24px 0 0' },
  link: { color: theme.color.primary, fontWeight: 600 },
};
