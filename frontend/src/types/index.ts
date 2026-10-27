export interface Player {
  id: string;
  name: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  category?: PairCategory | null;
}

export interface PlayerFormData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  category: string;
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

export type TournamentStage = 'INSCRIPCION' | 'GRUPOS' | 'LLAVES' | 'FINALIZADO';

export interface Court {
  id: string;
  name: string;
}

export interface Venue {
  id: string;
  name: string;
  address?: string | null;
  courts: Court[];
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  category: PairCategory;
  startDate: string | null;
  stage: TournamentStage;
  venues: Venue[];
  pairCount: number;
  courtCount: number;
  groupCount: number;
  groupMatches: number;
  unscheduledMatches: number;
  playedGroupMatches: number;
  bracketMatches: number;
  playedBracketMatches: number;
  champion: string | null;
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
  player1Email: string;
  player1Category: string;
  player2Name: string;
  player2LastName: string;
  player2Email: string;
  player2Category: string;
  tournamentId: string;
  category: string;
  level: string;
  availableSchedules: string[];
}

export type TournamentType = 'ESTANDAR' | 'AMERICANO';
export type PairCategory = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8';
export type PairLevel = 'ALTO' | 'MEDIO' | 'BAJO';
export type PairSchedule = 'H09_12' | 'H12_15' | 'H15_18' | 'H18_21';

export interface PairView {
  id: string;
  player1: string;
  player2: string;
  level: PairLevel;
  availability: PairSchedule[];
}

export interface SetScore {
  pair1: number;
  pair2: number;
}

export interface MatchView {
  id: string;
  groupName: string | null;
  pair1: PairView | null;
  pair2: PairView | null;
  turn: number | null;
  time: string | null;
  courtId: string | null;
  courtName: string | null;
  venueName: string | null;
  sets: SetScore[];
  winnerId: string | null;
  issues: string[];
  bracketRound: number | null;
  bracketPosition: number | null;
  pair1Seed: string | null;
  pair2Seed: string | null;
}

export interface StandingRow {
  pair: PairView;
  position: number;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  qualified: boolean;
}

export interface GroupView {
  id: string;
  name: string;
  category: PairCategory;
  pairs: PairView[];
  standings: StandingRow[];
  matches: MatchView[];
  complete: boolean;
}

export interface CourtColumn {
  id: string;
  name: string;
  venueName: string;
}

export interface FixtureView {
  date: string | null;
  turns: string[];
  courts: CourtColumn[];
  groups: GroupView[];
  unscheduled: MatchView[];
  warnings: string[];
  totalMatches: number;
  playedMatches: number;
  complete: boolean;
}

export interface BracketRound {
  size: number;
  name: string;
  matches: MatchView[];
}

export interface BracketView {
  date: string | null;
  groupsComplete: boolean;
  pendingGroupMatches: number;
  qualifiers: { seed: string; pair: PairView }[];
  rounds: BracketRound[];
  champion: PairView | null;
}

export interface EmailReport {
  sent: number;
  withoutEmail: string[];
  failed: string[];
}
