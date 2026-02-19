import type { Match, Player, Round, Team } from "../core/types";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

// Parejas fijas automáticas: (0,1), (2,3), ...
export function buildFixedTeams(players: Player[]): Team[] {
  const usable = players.length - (players.length % 2);
  const teams: Team[] = [];

  for (let i = 0; i < usable; i += 2) {
    const p1 = players[i];
    const p2 = players[i + 1];

    teams.push({
      id: makeId("t"),
      player1Id: p1.id,
      player2Id: p2.id,
    });
  }

  return teams;
}

// Round robin para equipos (circle method) + respeta canchas (divide en sub-rondas)
export function generateFixedRoundRobinRounds(
  teams: Team[],
  courts: number,
): Round[] {
  const safeCourts = Math.max(1, Math.floor(courts || 1));

  const BYE: Team = { id: "BYE", player1Id: "BYE", player2Id: "BYE" };

  const list = [...teams];
  if (list.length % 2 === 1) list.push(BYE);

  const n = list.length;

  if (n < 2) {
    return [{ number: 1, matches: [], sitOut: [] }];
  }

  const baseRounds: Array<{ matches: Match[]; sitOut: string[] }> = [];
  let rot = [...list];

  const totalRounds = n - 1;

  for (let r = 0; r < totalRounds; r++) {
    const matches: Match[] = [];
    const sitOut: string[] = [];

    for (let i = 0; i < n / 2; i++) {
      const a = rot[i];
      const b = rot[n - 1 - i];

      if (a.id === "BYE" && b.id !== "BYE") {
        sitOut.push(b.player1Id, b.player2Id);
        continue;
      }
      if (b.id === "BYE" && a.id !== "BYE") {
        sitOut.push(a.player1Id, a.player2Id);
        continue;
      }
      if (a.id === "BYE" && b.id === "BYE") continue;

      matches.push({
        id: makeId("m"),
        round: r + 1,
        teamA: { playerIds: [a.player1Id, a.player2Id] },
        teamB: { playerIds: [b.player1Id, b.player2Id] },
        scoreA: null,
        scoreB: null,
      });
    }

    baseRounds.push({ matches, sitOut });

    // Rotación circle method
    const fixed = rot[0];
    const rest = rot.slice(1);
    rest.unshift(rest.pop()!);
    rot = [fixed, ...rest];
  }

  // Dividir por canchas (sub-rondas)
  const finalRounds: Round[] = [];
  let roundNumber = 1;

  for (const br of baseRounds) {
    const chunks: Match[][] = [];
    for (let i = 0; i < br.matches.length; i += safeCourts) {
      chunks.push(br.matches.slice(i, i + safeCourts));
    }

    if (chunks.length === 0) {
      finalRounds.push({
        number: roundNumber++,
        matches: [],
        sitOut: br.sitOut,
      });
      continue;
    }

    for (let c = 0; c < chunks.length; c++) {
      finalRounds.push({
        number: roundNumber++,
        matches: chunks[c].map((m) => ({ ...m, round: roundNumber })),
        sitOut: c === 0 ? br.sitOut : [],
      });
    }
  }

  return finalRounds;
}
