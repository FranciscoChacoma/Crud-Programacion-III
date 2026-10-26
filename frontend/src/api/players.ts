import type { Player, PlayerFormData, PlayerProfile } from '../types';
import { API_BASE, parseOrThrow } from './http';

export async function searchPlayers(query: string) {
  const res = await fetch(`${API_BASE}/players/search?q=${encodeURIComponent(query)}`);
  return parseOrThrow<Player[]>(res, 'Error al buscar jugadores');
}

export async function getPlayers() {
  const res = await fetch(`${API_BASE}/players`);
  return parseOrThrow<PlayerProfile[]>(res, 'Error al obtener los jugadores');
}

export async function getPlayer(id: string) {
  const res = await fetch(`${API_BASE}/players/${id}`);
  return parseOrThrow<PlayerProfile>(res, 'Error al obtener el jugador');
}

export async function createPlayer(data: PlayerFormData) {
  const res = await fetch(`${API_BASE}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseOrThrow<Player>(res, 'Error al crear el jugador');
}

export async function updatePlayer(id: string, data: PlayerFormData) {
  const res = await fetch(`${API_BASE}/players/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseOrThrow<Player>(res, 'Error al modificar el jugador');
}

export async function deletePlayer(id: string) {
  const res = await fetch(`${API_BASE}/players/${id}`, { method: 'DELETE' });
  return parseOrThrow<void>(res, 'Error al eliminar el jugador');
}
