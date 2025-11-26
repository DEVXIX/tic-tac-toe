/**
 * @typedef {Object} Player
 * @property {string} id - Socket ID
 * @property {string} name - Player name
 * @property {"X" | "O"} symbol - Player symbol
 */

/**
 * @typedef {Object} Game
 * @property {string} id - Game ID
 * @property {Player} player1 - First player (X)
 * @property {Player | null} player2 - Second player (O)
 * @property {Array<string | null>} board - Game board state
 * @property {"X" | "O"} currentTurn - Current turn symbol
 * @property {"waiting" | "playing" | "finished"} status - Game status
 */

/**
 * @typedef {Object} GameState
 * @property {Map<string, Game>} games - Active games map (gameId -> Game)
 * @property {Map<string, string>} playerToGame - Player to game mapping (socketId -> gameId)
 */

/**
 * @typedef {Object} MoveResult
 * @property {boolean} success - Whether move was successful
 * @property {string | null} winner - Winner symbol or "Draw" or null
 * @property {Array<string | null>} board - Updated board state
 * @property {"X" | "O"} currentTurn - Next turn symbol
 * @property {"X" | "O"} [symbol] - The symbol that was just played
 * @property {string} [error] - Error message if move failed
 */

export {};
