import type { Match, Round, Team } from "../core/types";
import { shuffle } from "./shuffle";

type TeamHistory = {
  sitOutTotal: Record<string, number>;
  sitOutStreak: Record<string, number>;
};

type Options = {
  courts: number; // canchas
  maxSitOutStreak: number; // 1 = evitar 2 seguidas fuera (si se puede)
};

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

function buildTeamHistory(previousRounds: Round[], teams: Team[]): TeamHistory {
  const sitOutTotal: Record<string, number> = {};
  const sitOutStreak: Record<string, number> = {};

  // Map playerId -> teamId (para convertir sitOut players -> sitOut teams)
  const playerToTeam: Record<string, string> = {};
  for (const t of teams) {
    playerToTeam[t.player1Id] = t.id;
    playerToTeam[t.player2Id] = t.id;
  }

  for (const r of previousRounds) {
    // sitOut viene como playerIds (2 por team). Lo convertimos a teamIds.
    const sitTeams = new Set<string>();
    for (const pid of r.sitOut ?? []) {
      const tid = playerToTeam[pid];
      if (tid) sitTeams.add(tid);
    }

    // total count
    for (const tid of sitTeams) {
      sitOutTotal[tid] = (sitOutTotal[tid] ?? 0) + 1;
    }

    // streak
    const allTeams = new Set<string>([
      ...Object.keys(sitOutStreak),
      ...sitTeams,
    ]);
    for (const tid of allTeams) {
      sitOutStreak[tid] = sitTeams.has(tid) ? (sitOutStreak[tid] ?? 0) + 1 : 0;
    }
  }

  // ensure all teams exist in maps
  for (const t of teams) {
    sitOutTotal[t.id] = sitOutTotal[t.id] ?? 0;
    sitOutStreak[t.id] = sitOutStreak[t.id] ?? 0;
  }

  return { sitOutTotal, sitOutStreak };
}

function pickSitOutTeams(
  teams: Team[],
  activeTeamCount: number,
  hist: TeamHistory,
  opts: Options,
) {
  if (teams.length <= activeTeamCount)
    return { activeTeams: teams, sitOutTeams: [] as Team[] };

  const sitOutCount = teams.length - activeTeamCount;

  // Equidad: primero los que menos veces han estado fuera.
  // Evitar seguidas: penalizar teams con streak >= maxSitOutStreak.
  // Aleatorio en empates: shuffle primero.
  const randomized = shuffle(teams);

  const ranked = randomized.sort((t1, t2) => {
    const total1 = hist.sitOutTotal[t1.id] ?? 0;
    const total2 = hist.sitOutTotal[t2.id] ?? 0;

    const streak1 = hist.sitOutStreak[t1.id] ?? 0;
    const streak2 = hist.sitOutStreak[t2.id] ?? 0;

    const pen1 = streak1 >= opts.maxSitOutStreak ? 1000 : 0;
    const pen2 = streak2 >= opts.maxSitOutStreak ? 1000 : 0;

    const score1 = pen1 + total1;
    const score2 = pen2 + total2;

    if (score1 !== score2) return score1 - score2;
    if (streak1 !== streak2) return streak1 - streak2;
    return 0;
  });

  const sitOutTeams = ranked.slice(0, sitOutCount);
  const activeTeams = ranked.slice(sitOutCount);

  return { activeTeams, sitOutTeams };
}

export function generateFixedInfiniteRound(
  teams: Team[],
  round: number,
  previousRounds: Round[],
  options: Options,
): Round {
  const safeCourts = Math.max(1, Math.floor(options.courts || 1));

  // Cada partido usa 2 teams. En una ronda caben courts partidos => 2*courts teams activos.
  const maxActiveTeams = Math.min(teams.length, safeCourts * 2);

  const hist = buildTeamHistory(previousRounds, teams);
  const { activeTeams, sitOutTeams } = pickSitOutTeams(
    teams,
    maxActiveTeams,
    hist,
    options,
  );

  // Aleatorizar enfrentamientos (permitimos repeats)
  const shuffled = shuffle(activeTeams);

  const matches: Match[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    const a = shuffled[i];
    const b = shuffled[i + 1];
    if (!a || !b) break;

    matches.push({
      id: makeId("m"),
      round,
      teamA: { playerIds: [a.player1Id, a.player2Id] },
      teamB: { playerIds: [b.player1Id, b.player2Id] },
      scoreA: null,
      scoreB: null,
    });
  }

  // sitOut guardado como playerIds (2 por team) para que tu UI actual funcione
  const sitOut: string[] = [];
  for (const t of sitOutTeams) {
    sitOut.push(t.player1Id, t.player2Id);
  }

  return { number: round, matches, sitOut };
}
