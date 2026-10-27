import type { BracketView, EmailReport, FixtureView, SetScore } from '../types';
import { API_BASE, authHeaders, parseOrThrow } from './http';

const base = (tournamentId: string) => `${API_BASE}/tournaments/${tournamentId}`;

export async function generateFixture(tournamentId: string, token: string) {
  const res = await fetch(`${base(tournamentId)}/fixture/generate`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return parseOrThrow<FixtureView>(res, 'Error al generar el fixture');
}

export async function getFixture(tournamentId: string, token: string) {
  const res = await fetch(`${base(tournamentId)}/fixture`, { headers: authHeaders(token) });
  return parseOrThrow<FixtureView>(res, 'Error al obtener el fixture');
}

/** courtId/turn en null deja el partido sin horario. Si el lugar está ocupado, los partidos se intercambian. */
export async function moveMatch(tournamentId: string, matchId: string, courtId: string | null, turn: number | null, token: string) {
  const res = await fetch(`${base(tournamentId)}/matches/${matchId}/slot`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ courtId, turn }),
  });
  return parseOrThrow<void>(res, 'Error al mover el partido');
}

export async function saveResult(tournamentId: string, matchId: string, sets: SetScore[], token: string) {
  const res = await fetch(`${base(tournamentId)}/matches/${matchId}/result`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ sets }),
  });
  return parseOrThrow<void>(res, 'Error al guardar el resultado');
}

export async function clearResult(tournamentId: string, matchId: string, token: string) {
  const res = await fetch(`${base(tournamentId)}/matches/${matchId}/result`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseOrThrow<void>(res, 'Error al borrar el resultado');
}

export async function downloadFixturePdf(tournamentId: string, fileName: string, token: string) {
  const res = await fetch(`${base(tournamentId)}/fixture/pdf`, { headers: authHeaders(token) });
  if (!res.ok) await parseOrThrow<void>(res, 'Error al generar el PDF');
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function emailFixture(tournamentId: string, token: string) {
  const res = await fetch(`${base(tournamentId)}/fixture/email`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return parseOrThrow<EmailReport>(res, 'Error al enviar los mails');
}

export async function getBracket(tournamentId: string, token: string) {
  const res = await fetch(`${base(tournamentId)}/bracket`, { headers: authHeaders(token) });
  return parseOrThrow<BracketView>(res, 'Error al obtener las llaves');
}

export async function generateBracket(tournamentId: string, token: string) {
  const res = await fetch(`${base(tournamentId)}/bracket/generate`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return parseOrThrow<BracketView>(res, 'Error al armar las llaves');
}

export async function clearBracket(tournamentId: string, token: string) {
  const res = await fetch(`${base(tournamentId)}/bracket`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseOrThrow<void>(res, 'Error al eliminar las llaves');
}
