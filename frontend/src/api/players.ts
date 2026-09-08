import type { Player } from '../types';
import { API_BASE, parseOrThrow } from './http';

export async function searchPlayers(query: string) {
  const res = await fetch(`${API_BASE}/players/search?q=${encodeURIComponent(query)}`);
  return parseOrThrow<Player[]>(res, 'Error al buscar jugadores');
}
