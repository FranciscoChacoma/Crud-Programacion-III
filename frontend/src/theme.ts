import type { PairCategory, PairLevel, PairSchedule, TournamentStage, TournamentType } from './types';

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export const CATEGORIES: PairCategory[] = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];
export const SCHEDULES: PairSchedule[] = ['H09_12', 'H12_15', 'H15_18', 'H18_21'];
export const LEVELS: PairLevel[] = ['ALTO', 'MEDIO', 'BAJO'];

export const levelTone: Record<PairLevel, Tone> = {
  ALTO: 'success',
  MEDIO: 'warning',
  BAJO: 'danger',
};

export const levelLabel: Record<PairLevel, string> = {
  ALTO: 'Alto',
  MEDIO: 'Medio',
  BAJO: 'Bajo',
};

export const typeLabel: Record<TournamentType, string> = {
  ESTANDAR: 'Estándar',
  AMERICANO: 'Americano',
};

export const categoryLabel: Record<string, string> = {
  A1: '1ra', A2: '2da', A3: '3ra', A4: '4ta',
  A5: '5ta', A6: '6ta', A7: '7ma', A8: '8va',
};

export const scheduleLabel: Record<string, string> = {
  H09_12: '09:00 – 12:00',
  H12_15: '12:00 – 15:00',
  H15_18: '15:00 – 18:00',
  H18_21: '18:00 – 21:00',
};

export const scheduleShortLabel: Record<string, string> = {
  H09_12: '09–12',
  H12_15: '12–15',
  H15_18: '15–18',
  H18_21: '18–21',
};

export const stageLabel: Record<TournamentStage, string> = {
  INSCRIPCION: 'Inscripción',
  GRUPOS: 'Fase de grupos',
  LLAVES: 'Llaves',
  FINALIZADO: 'Finalizado',
};

export const stageTone: Record<TournamentStage, Tone> = {
  INSCRIPCION: 'neutral',
  GRUPOS: 'primary',
  LLAVES: 'warning',
  FINALIZADO: 'success',
};

/** "2026-11-14" → "sáb 14 nov 2026" (sin desfasaje por zona horaria). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** Sets como "6-4 3-6 10-7". */
export function scoreText(sets: { pair1: number; pair2: number }[]): string {
  return sets.map(s => `${s.pair1}-${s.pair2}`).join('  ');
}

/** Nombre corto de una pareja: apellidos. */
export function pairShort(p: { player1: string; player2: string }): string {
  const last = (full: string) => full.split(' ').slice(1).join(' ') || full;
  return `${last(p.player1)} / ${last(p.player2)}`;
}

// Deterministic swatch (0-7, styled by .avatar-N in index.css) so the same player always gets the same color.
export function avatarIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash) % 8;
}
