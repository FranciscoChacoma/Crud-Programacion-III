import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Input } from '../components/ui';

export function RegisterPage() {
  const [name, setName] = useState('');
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
      const token = await apiRegister(name, email, password);
      login(token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Registrate como organizador de torneos."
      footer={<>¿Ya tenés cuenta? <Link to="/login" className="link">Iniciá sesión</Link></>}
    >
      <form onSubmit={handleSubmit} className="form">
        <Input label="Nombre" value={name} placeholder="Tu nombre o el del club"
          onChange={e => setName(e.target.value)} required autoComplete="name" autoFocus />
        <Input label="Email" type="email" value={email} placeholder="nombre@club.com"
          onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Contraseña" type="password" value={password} hint="Mínimo 6 caracteres."
          onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" loading={loading} fullWidth>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
