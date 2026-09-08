import type { Tournament } from '../types';
import { API_BASE, authHeaders, parseOrThrow } from './http';

export async function createTournament(name: string, type: string, category: string, token: string) {
  const res = await fetch(`${API_BASE}/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name, type, category }),
  });
  return parseOrThrow<Tournament>(res, 'Error al crear el torneo');
}

export async function getTournaments(token: string) {
  const res = await fetch(`${API_BASE}/tournaments`, {
    headers: authHeaders(token),
  });
  return parseOrThrow<Tournament[]>(res, 'Error al obtener torneos');
}

export async function deleteTournament(id: string, token: string) {
  const res = await fetch(`${API_BASE}/tournaments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseOrThrow<void>(res, 'Error al eliminar el torneo');
}
