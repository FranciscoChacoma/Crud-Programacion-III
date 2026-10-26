import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Input } from '../components/ui';

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
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Ingresá con tu cuenta de organizador."
      footer={<>¿No tenés cuenta? <Link to="/register" className="link">Registrate</Link></>}
    >
      <form onSubmit={handleSubmit} className="form">
        <Input label="Email" type="email" value={email} placeholder="nombre@club.com"
          onChange={e => setEmail(e.target.value)} required autoComplete="email" autoFocus />
        <Input label="Contraseña" type="password" value={password} placeholder="••••••••"
          onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" loading={loading} fullWidth>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
