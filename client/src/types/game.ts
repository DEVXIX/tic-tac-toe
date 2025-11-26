/**
 * Type definitions for game-related data structures
 */

export type PlayerSymbol = "X" | "O";

export type GameStatus = "waiting" | "playing" | "finished";

export interface Player {
  id: string;
  name: string;
  symbol: PlayerSymbol;
}

export interface GameHistory {
  id: string;
  player1: string;
  player2: string;
  winner: string;
  createdAt: string;
}

export interface ActiveGame {
  id: string;
  player1: string;
  playerCount: number;
  status: string;
}

export interface GameState {
  gameId: string | null;
  state: "lobby" | "waiting" | "playing";
  player1Name: string;
  player2Name: string;
}

export interface Board {
  cells: Array<string | null>;
  currentTurn: PlayerSymbol;
  winner: string | null;
}

// Socket event payloads
export interface GameStartedEvent {
  gameId: string;
  player1: string;
  player2: string;
  board: Array<string | null>;
  currentTurn: PlayerSymbol;
}

export interface MoveMadeEvent {
  position: number;
  symbol: PlayerSymbol;
  board: Array<string | null>;
  currentTurn: PlayerSymbol;
}

export interface GameEndedEvent {
  winner: string;
  winnerName?: string;
  draw?: boolean;
}

export interface PlayerDisconnectedEvent {
  message: string;
  winner: string;
}

export interface OnlineUsersUpdatedEvent {
  users: Array<string>;
}

export interface ActiveGamesUpdatedEvent {
  games: Array<ActiveGame>;
}
