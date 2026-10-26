import type { PairCategory, PairLevel, PairSchedule, TournamentType } from './types';

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

// Deterministic swatch (0-7, styled by .avatar-N in index.css) so the same player always gets the same color.
export function avatarIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash) % 8;
}
