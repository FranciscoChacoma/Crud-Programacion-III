import type { Venue } from '../types';
import { API_BASE, authHeaders, parseOrThrow } from './http';

export async function getVenues(token: string) {
  const res = await fetch(`${API_BASE}/venues`, { headers: authHeaders(token) });
  return parseOrThrow<Venue[]>(res, 'Error al obtener las sedes');
}

export async function createVenue(name: string, address: string, token: string) {
  const res = await fetch(`${API_BASE}/venues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name, address }),
  });
  return parseOrThrow<Venue>(res, 'Error al crear la sede');
}

export async function updateVenue(id: string, name: string, address: string, token: string) {
  const res = await fetch(`${API_BASE}/venues/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name, address }),
  });
  return parseOrThrow<Venue>(res, 'Error al modificar la sede');
}

export async function deleteVenue(id: string, token: string) {
  const res = await fetch(`${API_BASE}/venues/${id}`, { method: 'DELETE', headers: authHeaders(token) });
  return parseOrThrow<void>(res, 'Error al eliminar la sede');
}

export async function addCourt(venueId: string, name: string, token: string) {
  const res = await fetch(`${API_BASE}/venues/${venueId}/courts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name }),
  });
  return parseOrThrow<Venue>(res, 'Error al agregar la cancha');
}

export async function deleteCourt(venueId: string, courtId: string, token: string) {
  const res = await fetch(`${API_BASE}/venues/${venueId}/courts/${courtId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return parseOrThrow<Venue>(res, 'Error al eliminar la cancha');
}
