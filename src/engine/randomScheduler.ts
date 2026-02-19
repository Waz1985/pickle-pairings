import type { Match, Player, Round } from "../core/types";
import { shuffle } from "./shuffle";

type History = {
  partnerCount: Record<string, number>;
  opponentCount: Record<string, number>;
  sitOutStreak: Record<string, number>;
  sitOutTotal: Record<string, number>; // ✅ NUEVO
};

type Options = {
  courts: number; // canchas disponibles
  maxSitOutStreak: number; // 1 = no 2 rondas seguidas fuera
};

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

function key2(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`; // orden no importa
}

export function buildHistory(rounds: Round[]): History {
  const partnerCount: Record<string, number> = {};
  const opponentCount: Record<string, number> = {};
  const sitOutStreak: Record<string, number> = {};
  const sitOutTotal: Record<string, number> = {};

  for (const r of rounds) {
    const sit = new Set(r.sitOut ?? []);

    // total
    for (const pid of sit) {
      sitOutTotal[pid] = (sitOutTotal[pid] ?? 0) + 1;
    }

    // streak (seguidas)
    const all = new Set<string>([...Object.keys(sitOutStreak), ...sit]);
    for (const pid of all) {
      sitOutStreak[pid] = sit.has(pid) ? (sitOutStreak[pid] ?? 0) + 1 : 0;
    }

    // partner/opponent counts
    for (const m of r.matches) {
      const [a1, a2] = m.teamA.playerIds;
      const [b1, b2] = m.teamB.playerIds;

      partnerCount[key2(a1, a2)] = (partnerCount[key2(a1, a2)] ?? 0) + 1;
      partnerCount[key2(b1, b2)] = (partnerCount[key2(b1, b2)] ?? 0) + 1;

      const oppPairs: Array<[string, string]> = [
        [a1, b1],
        [a1, b2],
        [a2, b1],
        [a2, b2],
      ];
      for (const [x, y] of oppPairs) {
        opponentCount[key2(x, y)] = (opponentCount[key2(x, y)] ?? 0) + 1;
      }
    }
  }

  return { partnerCount, opponentCount, sitOutStreak, sitOutTotal };
}

function pickSitOut(
  players: Player[],
  activeCount: number,
  hist: History,
  opts: Options,
) {
  if (players.length <= activeCount)
    return { active: players, sitOut: [] as Player[] };

  const sitOutCount = players.length - activeCount;

  // 1) Agrupar/ordenar por "total veces fuera" (más bajo primero)
  // 2) Penalizar fuertemente si ya viene con streak >= max (para evitar seguidas)
  // 3) En empates, desempatar aleatorio
  const randomized = shuffle(players);

  const ranked = randomized.sort((p1, p2) => {
    const total1 = hist.sitOutTotal[p1.id] ?? 0;
    const total2 = hist.sitOutTotal[p2.id] ?? 0;

    const streak1 = hist.sitOutStreak[p1.id] ?? 0;
    const streak2 = hist.sitOutStreak[p2.id] ?? 0;

    const pen1 = streak1 >= opts.maxSitOutStreak ? 1000 : 0;
    const pen2 = streak2 >= opts.maxSitOutStreak ? 1000 : 0;

    // orden: menor (penalidad + total) primero
    const score1 = pen1 + total1;
    const score2 = pen2 + total2;

    if (score1 !== score2) return score1 - score2;

    // desempate secundario: menor streak
    if (streak1 !== streak2) return streak1 - streak2;

    // si sigue empate, ya está mezclado por shuffle => aleatorio
    return 0;
  });

  const sitOut = ranked.slice(0, sitOutCount);
  const active = ranked.slice(sitOutCount);

  return { active, sitOut };
}

function makePairs(active: Player[], hist: History): Array<[Player, Player]> {
  // Greedy: para cada jugador, buscar el partner con menor partnerCount
  const pool = shuffle(active);
  const used = new Set<string>();
  const pairs: Array<[Player, Player]> = [];

  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (used.has(p.id)) continue;

    let best: Player | null = null;
    let bestScore = Infinity;

    for (let j = i + 1; j < pool.length; j++) {
      const q = pool[j];
      if (used.has(q.id)) continue;

      const score = hist.partnerCount[key2(p.id, q.id)] ?? 0;
      if (score < bestScore) {
        bestScore = score;
        best = q;
      }
    }

    if (!best) continue;
    used.add(p.id);
    used.add(best.id);
    pairs.push([p, best]);
  }

  return pairs;
}

function pairVsPairCost(
  a: [Player, Player],
  b: [Player, Player],
  hist: History,
) {
  const [a1, a2] = a;
  const [b1, b2] = b;
  // costo = suma de rivales repetidos
  return (
    (hist.opponentCount[key2(a1.id, b1.id)] ?? 0) +
    (hist.opponentCount[key2(a1.id, b2.id)] ?? 0) +
    (hist.opponentCount[key2(a2.id, b1.id)] ?? 0) +
    (hist.opponentCount[key2(a2.id, b2.id)] ?? 0)
  );
}

function makeMatches(
  pairs: Array<[Player, Player]>,
  round: number,
  hist: History,
): Match[] {
  // Greedy matching de parejas para minimizar repeticiones de rivales
  const remaining = [...pairs];
  const matches: Match[] = [];

  while (remaining.length >= 2) {
    const a = remaining.shift()!;
    let bestIdx = 0;
    let bestCost = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const cost = pairVsPairCost(a, remaining[i], hist);
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = i;
      }
    }

    const b = remaining.splice(bestIdx, 1)[0];

    matches.push({
      id: makeId("m"),
      round,
      teamA: { playerIds: [a[0].id, a[1].id] },
      teamB: { playerIds: [b[0].id, b[1].id] },
      scoreA: null,
      scoreB: null,
    });
  }

  return matches;
}

export function generateSmartRandomRound(
  players: Player[],
  round: number,
  previousRounds: Round[],
  options: Options,
): Round {
  const hist = buildHistory(previousRounds);

  const activeCount = Math.min(players.length, options.courts * 4);
  const { active, sitOut } = pickSitOut(players, activeCount, hist, options);

  // Si por algún motivo active no es múltiplo de 4, recortamos un poco (caso borde)
  const usableActiveCount = active.length - (active.length % 4);
  const usableActive = active.slice(0, usableActiveCount);
  const extraSit = active.slice(usableActiveCount);
  const finalSitOut = [...sitOut, ...extraSit];

  const pairs = makePairs(usableActive, hist);
  const matches = makeMatches(pairs, round, hist);

  return {
    number: round,
    matches,
    sitOut: finalSitOut.map((p) => p.id),
  };
}
