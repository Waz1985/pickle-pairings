import { create } from "zustand";
import { generateRandomRound } from "../engine/randomPairs";
import type { Match, Mode, Player, Round } from "./types";

type SessionState = {
  mode: Mode;
  players: Player[];

  rounds: Round[]; // ✅ todas las rondas congeladas
  currentRound: number; // ✅ ronda que estoy viendo
  isFinished: boolean; // ✅ juego finalizado

  startSession: (mode: Mode, players: Player[]) => void;

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
};

export const useSessionStore = create<SessionState>((set, get) => ({
  mode: "random",
  players: [],
  rounds: [],
  currentRound: 1,
  isFinished: false,

  startSession: (mode, players) => {
    const firstRound: Round = {
      number: 1,
      matches: mode === "random" ? generateRandomRound(players, 1) : [],
    };

    set({
      mode,
      players,
      rounds: [firstRound],
      currentRound: 1,
      isFinished: false,
    });
  },

  goToRound: (roundNumber) => {
    const { rounds } = get();
    if (roundNumber < 1) return;
    if (roundNumber > rounds.length) return;
    set({ currentRound: roundNumber });
  },

  nextRound: () => {
    const { mode, players, rounds, currentRound, isFinished } = get();
    if (isFinished) return;

    const next = currentRound + 1;

    // Si ya existe esa ronda, solo navegamos
    if (next <= rounds.length) {
      set({ currentRound: next });
      return;
    }

    // Si no existe, la creamos UNA SOLA VEZ y queda congelada
    const newRound: Round = {
      number: next,
      matches: mode === "random" ? generateRandomRound(players, next) : [],
    };

    set({
      rounds: [...rounds, newRound],
      currentRound: next,
    });
  },

  prevRound: () => {
    const { currentRound } = get();
    if (currentRound <= 1) return;
    set({ currentRound: currentRound - 1 });
  },

  updateScore: (roundNumber, matchId, scoreA, scoreB) => {
    const { rounds } = get();

    const updatedRounds = rounds.map((r) => {
      if (r.number !== roundNumber) return r;

      const updatedMatches: Match[] = r.matches.map((m) =>
        m.id === matchId ? { ...m, scoreA, scoreB } : m,
      );

      return { ...r, matches: updatedMatches };
    });

    set({ rounds: updatedRounds });
  },

  finishGame: () => {
    set({ isFinished: true });
  },
}));
