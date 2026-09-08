import type { Pair, PairFormData } from '../types';
import { API_BASE, authHeaders, parseOrThrow } from './http';

export async function createPair(data: PairFormData, token: string) {
  const res = await fetch(`${API_BASE}/pairs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return parseOrThrow<Pair>(res, 'Error al inscribir la pareja');
}

export async function getPairsByTournament(tournamentId: string, token: string) {
  const res = await fetch(`${API_BASE}/pairs/tournament/${tournamentId}`, {
    headers: authHeaders(token),
  });
  return parseOrThrow<Pair[]>(res, 'Error al obtener las parejas');
}

export async function getPair(pairId: string, token: string) {
  const res = await fetch(`${API_BASE}/pairs/${pairId}`, {
    headers: authHeaders(token),
  });
  return parseOrThrow<Pair>(res, 'Error al obtener la pareja');
}

export async function updatePair(pairId: string, data: PairFormData, token: string) {
  const res = await fetch(`${API_BASE}/pairs/${pairId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return parseOrThrow<Pair>(res, 'Error al modificar la pareja');
}

export async function deletePair(pairId: string, token: string) {
  const res = await fetch(`${API_BASE}/pairs/${pairId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseOrThrow<void>(res, 'Error al eliminar la pareja');
}
