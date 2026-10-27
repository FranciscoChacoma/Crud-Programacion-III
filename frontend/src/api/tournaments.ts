import type { Tournament } from '../types';
import { API_BASE, authHeaders, parseOrThrow } from './http';

export interface TournamentInput {
  name: string;
  type: string;
  category: string;
  startDate: string | null;
}

export async function createTournament(data: TournamentInput, token: string) {
  const res = await fetch(`${API_BASE}/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return parseOrThrow<Tournament>(res, 'Error al crear el torneo');
}

export async function getTournaments(token: string) {
  const res = await fetch(`${API_BASE}/tournaments`, {
    headers: authHeaders(token),
  });
  return parseOrThrow<Tournament[]>(res, 'Error al obtener torneos');
}

export async function getTournament(id: string, token: string) {
  const res = await fetch(`${API_BASE}/tournaments/${id}`, {
    headers: authHeaders(token),
  });
  return parseOrThrow<Tournament>(res, 'Error al obtener el torneo');
}

export async function setTournamentVenues(id: string, venueIds: string[], token: string) {
  const res = await fetch(`${API_BASE}/tournaments/${id}/venues`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ venueIds }),
  });
  return parseOrThrow<Tournament>(res, 'Error al actualizar las sedes del torneo');
}

export async function deleteTournament(id: string, token: string) {
  const res = await fetch(`${API_BASE}/tournaments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseOrThrow<void>(res, 'Error al eliminar el torneo');
}
