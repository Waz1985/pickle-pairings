import { create } from "zustand";
import { generateFixedInfiniteRound } from "../engine/fixedInfinite";
import { buildFixedTeams } from "../engine/fixedRoundRobin";
import { generateSmartRandomRound } from "../engine/randomScheduler";
import { loadFromStorage, saveToStorage } from "./storage";
import type { Mode, Player, Round, SavedGame, Team } from "./types";

type SessionState = {
  mode: Mode;
  players: Player[];

  courts: number;
  maxSitOutStreak: number;

  rounds: Round[];
  currentRound: number;
  isFinished: boolean;

  savedGames: SavedGame[];
  isReadOnly: boolean;

  loadSavedGames: () => Promise<void>;
  saveFinishedGame: () => Promise<void>;
  openSavedGame: (id: string) => Promise<void>;

  fixedTeams: Team[]; // ✅ AQUI

  startSession: (mode: Mode, players: Player[], courts: number) => void;

  goToRound: (roundNumber: number) => void;
  nextRound: () => void;
  prevRound: () => void;

  updateScore: (
    roundNumber: number,
    matchId: string,
    scoreA: number,
    scoreB: number,
  ) => void;

  finishGame: () => void;
  resetSession: () => void;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  mode: "random",
  players: [],

  courts: 1,
  maxSitOutStreak: 1,

  rounds: [],
  savedGames: [],
  isReadOnly: false,
  currentRound: 1,
  isFinished: false,

  fixedTeams: [], // ✅ AQUI

  startSession: (mode, players, courts) => {
    const safeCourts = Math.max(1, Math.floor(courts || 1));

    if (mode === "random") {
      const firstRound = generateSmartRandomRound(players, 1, [], {
        courts: safeCourts,
        maxSitOutStreak: get().maxSitOutStreak,
      });

      set({
        mode,
        players,
        courts: safeCourts,
        fixedTeams: [],
        rounds: [firstRound],
        currentRound: 1,
        isFinished: false,
      });
      return;
    }

    // ✅ FIXED infinito: construir parejas fijas + ronda 1
    const teams = buildFixedTeams(players);

    const firstRound = generateFixedInfiniteRound(teams, 1, [], {
      courts: safeCourts,
      maxSitOutStreak: get().maxSitOutStreak,
    });

    set({
      mode,
      players,
      courts: safeCourts,
      fixedTeams: teams,
      rounds: [firstRound],
      currentRound: 1,
      isFinished: false,
    });
  },

  goToRound: (roundNumber) => {
    const { rounds } = get();
    if (!Number.isFinite(roundNumber)) return;
    if (roundNumber < 1) return;
    if (roundNumber > (rounds ?? []).length) return;
    set({ currentRound: roundNumber });
  },

  nextRound: () => {
    const {
      mode,
      players,
      courts,
      rounds,
      currentRound,
      isFinished,
      maxSitOutStreak,
      fixedTeams,
      isReadOnly,
    } = get();

    if (isFinished || isReadOnly) return;

    const next = currentRound + 1;

    // Si ya existe la ronda, solo navegar
    if (next <= (rounds ?? []).length) {
      set({ currentRound: next });
      return;
    }

    // FIXED infinito
    if (mode === "fixed") {
      const newRound = generateFixedInfiniteRound(fixedTeams, next, rounds, {
        courts,
        maxSitOutStreak,
      });

      set({ rounds: [...rounds, newRound], currentRound: next });
      return;
    }

    // RANDOM infinito
    const newRound = generateSmartRandomRound(players, next, rounds, {
      courts,
      maxSitOutStreak,
    });

    set({ rounds: [...rounds, newRound], currentRound: next });
  },

  prevRound: () => {
    const { currentRound } = get();
    if (currentRound <= 1) return;
    set({ currentRound: currentRound - 1 });
  },

  updateScore: (roundNumber, matchId, scoreA, scoreB) => {
    const { rounds, isReadOnly } = get();
    if (isReadOnly) return;

    const a = Number(scoreA);
    const b = Number(scoreB);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;

    const updatedRounds = rounds.map((r) => {
      if (r.number !== roundNumber) return r;

      return {
        ...r,
        matches: r.matches.map((m) =>
          m.id === matchId ? { ...m, scoreA: a, scoreB: b } : m,
        ),
      };
    });

    set({ rounds: updatedRounds });
  },

  finishGame: () => {
    set({ isFinished: true, isReadOnly: false }); // el juego actual finalizado, pero no es “abierto”
    // guardar snapshot
    get().saveFinishedGame();
  },

  resetSession: () => {
    set({
      mode: "random",
      players: [],
      courts: 1,
      maxSitOutStreak: 1,
      rounds: [],
      currentRound: 1,
      isFinished: false,
      fixedTeams: [],
    });
  },

  loadSavedGames: async () => {
    const games = await loadFromStorage<SavedGame[]>([]);
    set({ savedGames: games });
  },

  saveFinishedGame: async () => {
    const { mode, players, courts, rounds, fixedTeams, savedGames } = get();

    const now = new Date().toISOString();
    const id = `g_${Math.random().toString(16).slice(2)}`;

    const game: SavedGame = {
      id,
      title: `Juego ${new Date().toLocaleString()}`,
      createdAt: now,
      finishedAt: now,
      mode,
      players,
      courts,
      rounds,
      fixedTeams,
    };

    const updated = [game, ...savedGames];
    set({ savedGames: updated });

    await saveToStorage(updated);
  },

  openSavedGame: async (id: string) => {
    const games = await loadFromStorage<SavedGame[]>([]);
    const game = games.find((g) => g.id === id);
    if (!game) return;

    // Cargar el juego como sesión actual, pero SOLO LECTURA
    set({
      mode: game.mode,
      players: game.players,
      courts: game.courts,
      rounds: game.rounds,
      fixedTeams: game.fixedTeams,
      currentRound: 1,
      isFinished: true, // ✅ congelado
      isReadOnly: true, // ✅ extra seguridad
      savedGames: games,
    });
  },
}));
