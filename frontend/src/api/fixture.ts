import type { FixtureResult } from '../types';
import { API_BASE, authHeaders, parseOrThrow } from './http';

export async function generateFixture(tournamentId: string, token: string) {
  const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/fixture/generate`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return parseOrThrow<FixtureResult>(res, 'Error al generar el fixture');
}

export async function getFixture(tournamentId: string, token: string) {
  const res = await fetch(`${API_BASE}/tournaments/${tournamentId}/fixture`, {
    headers: authHeaders(token),
  });
  return parseOrThrow<FixtureResult>(res, 'Error al obtener el fixture');
}
