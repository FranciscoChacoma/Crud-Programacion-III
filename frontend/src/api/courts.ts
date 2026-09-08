import type { Court } from '../types';
import { API_BASE, authHeaders, parseOrThrow } from './http';

export async function getCourts(tournamentId: string, token: string) {
  const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/courts`, {
    headers: authHeaders(token),
  });
  return parseOrThrow<Court[]>(res, 'Error al obtener las canchas');
}

export async function createCourt(tournamentId: string, name: string, token: string) {
  const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/courts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name }),
  });
  return parseOrThrow<Court>(res, 'Error al crear la cancha');
}

export async function deleteCourt(tournamentId: string, courtId: string, token: string) {
  const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/courts/${courtId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseOrThrow<void>(res, 'Error al eliminar la cancha');
}
