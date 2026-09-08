import { API_BASE, parseOrThrow } from './http';

export async function register(name: string, email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await parseOrThrow<{ token: string }>(res, 'No se pudo completar el registro');
  return data.token;
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseOrThrow<{ token: string }>(res, 'Credenciales incorrectas');
  return data.token;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
}
