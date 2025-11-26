import { v4 as uuidv4 } from "uuid";
import { checkWinner } from "./utils.js";

/**
 * GameService - Pure business logic for tic-tac-toe game
 * No side effects, no I/O, just game rules and state transformations
 */
export class GameService {
  /**
   * Creates a new game instance
   * @param {string} socketId 
   * @param {string} playerName 
   * @returns {import('./types.js').Game}
   */
  static createGame(socketId, playerName) {
    return {
      id: uuidv4(),
      player1: {
        id: socketId,
        name: playerName,
        symbol: "X"
      },
      player2: null,
      board: Array(9).fill(null),
      currentTurn: "X",
      status: "waiting"
    };
  }

  /**
   * Attempts to add player2 to a game
   * @param {import('./types.js').Game} game 
   * @param {string} socketId 
   * @param {string} playerName 
   * @returns {{ success: boolean, error?: string, game?: import('./types.js').Game }}
   */
  static joinGame(game, socketId, playerName) {
    if (!game) {
      return { success: false, error: "Game not found" };
    }

    if (game.status !== "waiting") {
      return { success: false, error: "Game already in progress" };
    }

    if (game.player2) {
      return { success: false, error: "Game is full" };
    }

    game.player2 = {
      id: socketId,
      name: playerName,
      symbol: "O"
    };
    game.status = "playing";

    return { success: true, game };
  }

  /**
   * Validates and executes a move
   * @param {import('./types.js').Game} game 
   * @param {string} socketId 
   * @param {number} position 
   * @returns {import('./types.js').MoveResult & { error?: string }}
   */
  static makeMove(game, socketId, position) {
    if (!game) {
      return { success: false, error: "Game not found", winner: null, board: [], currentTurn: "X" };
    }

    if (game.status !== "playing") {
      return { success: false, error: "Game is not active", winner: null, board: game.board, currentTurn: game.currentTurn };
    }

    const player = game.player1.id === socketId ? game.player1 : game.player2;

    if (!player) {
      return { success: false, error: "You are not in this game", winner: null, board: game.board, currentTurn: game.currentTurn };
    }

    if (game.currentTurn !== player.symbol) {
      return { success: false, error: "Not your turn", winner: null, board: game.board, currentTurn: game.currentTurn };
    }

    if (game.board[position] !== null) {
      return { success: false, error: "Position already taken", winner: null, board: game.board, currentTurn: game.currentTurn };
    }

    // Execute move
    game.board[position] = player.symbol;
    game.currentTurn = player.symbol === "X" ? "O" : "X";

    const winner = checkWinner(game.board);

    return {
      success: true,
      symbol: player.symbol,
      winner,
      board: game.board,
      currentTurn: game.currentTurn
    };
  }

  /**
   * Determines the winner's name from a game
   * @param {import('./types.js').Game} game 
   * @param {string} winnerSymbol - "X", "O", or "Draw"
   * @returns {string}
   */
  static getWinnerName(game, winnerSymbol) {
    if (winnerSymbol === "Draw") {
      return "Draw";
    }
    if (winnerSymbol === "X") {
      return game.player1.name;
    }
    return game.player2.name;
  }

  /**
   * Converts a game to active game list format
   * @param {import('./types.js').Game} game 
   * @returns {{ id: string, player1: string, playerCount: number, status: string } | null}
   */
  static toActiveGameDTO(game) {
    if (game.status !== "waiting") {
      return null;
    }

    return {
      id: game.id,
      player1: game.player1.name,
      playerCount: 1,
      status: game.status
    };
  }
}
