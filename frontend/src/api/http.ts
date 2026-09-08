export const API_BASE = 'http://localhost:8080/api';

export async function parseOrThrow<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? fallback);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
