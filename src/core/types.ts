export type Mode = "fixed" | "random";

export type Player = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  player1Id: string;
  player2Id: string;
};

export type Match = {
  id: string;
  round: number;
  teamA: { playerIds: [string, string] };
  teamB: { playerIds: [string, string] };
  scoreA: number | null;
  scoreB: number | null;
};

export type Session = {
  id: string;
  createdAt: string; // ISO
  mode: Mode;
  players: Player[];
  fixedTeams?: Team[];
  matches: Match[];
};

export type Round = {
  number: number;
  matches: Match[];
  sitOut: string[]; // playerIds
};

export type SavedGame = {
  id: string;
  title: string; // ejemplo: "Juego 2026-02-18 13:25"
  createdAt: string; // ISO
  finishedAt: string; // ISO
  mode: Mode;
  players: Player[];
  courts: number;
  rounds: Round[];
  fixedTeams: Team[];
};
