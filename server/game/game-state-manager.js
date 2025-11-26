import { GameService } from "./game-service.js";
import { GameRepository } from "./game-repository.js";

/**
 * GameStateManager - Manages in-memory game state
 * Coordinates between GameService (logic) and state storage
 */
export class GameStateManager {
  constructor(io, gameRepository) {
    this.io = io;
    this.gameRepository = gameRepository;
    /** @type {Map<string, import('./types.js').Game>} */
    this.games = new Map();
    /** @type {Map<string, string>} */
    this.playerToGame = new Map();
  }

  /**
   * Creates a new game
   * @param {string} socketId 
   * @param {string} playerName 
   * @returns {import('./types.js').Game}
   */
  createGame(socketId, playerName) {
    const game = GameService.createGame(socketId, playerName);
    this.games.set(game.id, game);
    this.playerToGame.set(socketId, game.id);
    return game;
  }

  /**
   * Adds player2 to a game
   * @param {string} gameId 
   * @param {string} socketId 
   * @param {string} playerName 
   * @returns {{ success: boolean, error?: string, game?: import('./types.js').Game }}
   */
  joinGame(gameId, socketId, playerName) {
    const game = this.games.get(gameId);
    const result = GameService.joinGame(game, socketId, playerName);
    
    if (result.success) {
      this.playerToGame.set(socketId, gameId);
    }

    return result;
  }

  /**
   * Executes a move in a game
   * @param {string} gameId 
   * @param {string} socketId 
   * @param {number} position 
   * @returns {import('./types.js').MoveResult & { error?: string }}
   */
  makeMove(gameId, socketId, position) {
    const game = this.games.get(gameId);
    return GameService.makeMove(game, socketId, position);
  }

  /**
   * Marks game as finished and saves to database
   * @param {string} gameId 
   * @param {string} winner 
   * @returns {Promise<void>}
   */
  async endGame(gameId, winner) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.status = "finished";
    const winnerName = GameService.getWinnerName(game, winner);

    await this.gameRepository.saveGame(
      game.id,
      game.player1.name,
      game.player2.name,
      winnerName
    );

    // Schedule cleanup
    setTimeout(() => {
      this.cleanupGame(gameId);
    }, 5000);

    return winnerName;
  }

  /**
   * Cleans up game from memory
   * @param {string} gameId 
   */
  cleanupGame(gameId) {
    const game = this.games.get(gameId);
    if (game) {
      this.playerToGame.delete(game.player1.id);
      if (game.player2) {
        this.playerToGame.delete(game.player2.id);
      }
      this.games.delete(gameId);
    }
  }

  /**
   * Gets game by ID
   * @param {string} gameId 
   * @returns {import('./types.js').Game | undefined}
   */
  getGame(gameId) {
    return this.games.get(gameId);
  }

  /**
   * Gets game ID for a player
   * @param {string} socketId 
   * @returns {string | undefined}
   */
  getPlayerGameId(socketId) {
    return this.playerToGame.get(socketId);
  }

  /**
   * Gets all active (waiting) games
   * @returns {Array<{ id: string, player1: string, playerCount: number, status: string }>}
   */
  getActiveGames() {
    const activeGames = [];
    
    for (const game of this.games.values()) {
      const dto = GameService.toActiveGameDTO(game);
      if (dto) {
        activeGames.push(dto);
      }
    }

    return activeGames;
  }

  /**
   * Handles player disconnect
   * @param {string} socketId 
   * @returns {Promise<{ forfeit: boolean, winner?: string, gameId?: string }>}
   */
  async handleDisconnect(socketId) {
    const gameId = this.playerToGame.get(socketId);

    if (!gameId) {
      return { forfeit: false };
    }

    const game = this.games.get(gameId);

    if (!game) {
      this.playerToGame.delete(socketId);
      return { forfeit: false };
    }

    const disconnectedPlayer = game.player1.id === socketId ? game.player1 : game.player2;
    const remainingPlayer = game.player1.id === socketId ? game.player2 : game.player1;

    // If game hasn't started, just clean up
    if (game.status === "waiting") {
      this.cleanupGame(gameId);
      return { forfeit: false };
    }

    // If game is playing, remaining player wins by forfeit
    if (game.status === "playing" && remainingPlayer) {
      game.status = "finished";

      await this.gameRepository.saveGame(
        game.id,
        game.player1.name,
        game.player2.name,
        remainingPlayer.name
      ).catch(error => {
        console.error("Failed to save forfeit game:", error);
      });

      setTimeout(() => {
        this.cleanupGame(gameId);
      }, 5000);

      return {
        forfeit: true,
        winner: remainingPlayer.name,
        gameId: game.id
      };
    }

    this.playerToGame.delete(socketId);
    return { forfeit: false };
  }
}
