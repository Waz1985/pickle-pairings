import type { Match, Player } from "../core/types";

export type PlayerStats = {
  playerId: string;
  name: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
  winPct: number;
};

export function calculateStats(
  players: Player[],
  matches: Match[],
): PlayerStats[] {
  const statsMap: Record<string, PlayerStats> = {};

  // Inicializar
  players.forEach((p) => {
    statsMap[p.id] = {
      playerId: p.id,
      name: p.name,
      played: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      diff: 0,
      winPct: 0,
    };
  });

  matches.forEach((match) => {
    if (match.scoreA === null || match.scoreB === null) return;

    const teamA = match.teamA.playerIds;
    const teamB = match.teamB.playerIds;

    const aWon = match.scoreA > match.scoreB;

    teamA.forEach((id) => {
      const s = statsMap[id];
      s.played++;
      s.pointsFor += match.scoreA!;
      s.pointsAgainst += match.scoreB!;
      if (aWon) s.wins++;
      else s.losses++;
    });

    teamB.forEach((id) => {
      const s = statsMap[id];
      s.played++;
      s.pointsFor += match.scoreB!;
      s.pointsAgainst += match.scoreA!;
      if (!aWon) s.wins++;
      else s.losses++;
    });
  });

  return Object.values(statsMap)
    .map((s) => ({
      ...s,
      diff: s.pointsFor - s.pointsAgainst,
      winPct: s.played ? Number((s.wins / s.played).toFixed(2)) : 0,
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.diff - a.diff;
    });
}
