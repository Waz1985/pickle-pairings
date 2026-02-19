import type { Match, Player } from "../core/types";
import { shuffle } from "./shuffle";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

export function generateRandomRound(players: Player[], round: number): Match[] {
  const shuffled = shuffle(players);

  const pairs: Array<[Player, Player]> = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    pairs.push([shuffled[i], shuffled[i + 1]]);
  }

  const matches: Match[] = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const [a1, a2] = pairs[i];
    const [b1, b2] = pairs[i + 1];

    matches.push({
      id: makeId("m"),
      round,
      teamA: { playerIds: [a1.id, a2.id] },
      teamB: { playerIds: [b1.id, b2.id] },
      scoreA: null,
      scoreB: null,
    });
  }

  return matches;
}
