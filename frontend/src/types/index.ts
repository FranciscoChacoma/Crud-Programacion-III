export interface Player {
  id: string;
  name: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
}

export interface PlayerFormData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Participation {
  pairId: string;
  tournamentId: string;
  tournamentName: string;
  partner: string;
  category: PairCategory;
  level: PairLevel;
}

export interface PlayerProfile extends Player {
  participations: Participation[];
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  category: PairCategory;
}

export interface Court {
  id: string;
  name: string;
}

export interface Pair {
  id: string;
  player1: Player;
  player2: Player;
  category: PairCategory;
  level: PairLevel;
  availableSchedules: PairSchedule[];
}

export interface PairFormData {
  player1Name: string;
  player1LastName: string;
  player2Name: string;
  player2LastName: string;
  tournamentId: string;
  category: string;
  level: string;
  availableSchedules: string[];
}

export type TournamentType = 'ESTANDAR' | 'AMERICANO';
export type PairCategory = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8';
export type PairLevel = 'ALTO' | 'MEDIO' | 'BAJO';
export type PairSchedule = 'H09_12' | 'H12_15' | 'H15_18' | 'H18_21';

export interface PairSummary {
  id: string;
  player1: string;
  player2: string;
  category: PairCategory;
  level: PairLevel;
}

export interface MatchResult {
  id: string;
  pair1: PairSummary;
  pair2: PairSummary;
  courtName: string;
  timeSlot: PairSchedule;
}

export interface UnassignedMatch {
  pair1: PairSummary;
  pair2: PairSummary;
  groupName: string;
  reason: string;
}

export interface GroupResult {
  name: string;
  category: PairCategory;
  pairs: PairSummary[];
  matches: MatchResult[];
}

export interface FixtureResult {
  groups: GroupResult[];
  unassignedMatches: UnassignedMatch[];
  warnings: string[];
}
