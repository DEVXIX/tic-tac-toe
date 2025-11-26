/**
 * GameRepository - Database operations for games
 * Handles all Prisma interactions
 */
export class GameRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Saves a completed game to the database
   * @param {string} gameId 
   * @param {string} player1Name 
   * @param {string} player2Name 
   * @param {string} winnerName 
   * @returns {Promise<void>}
   */
  async saveGame(gameId, player1Name, player2Name, winnerName) {
    try {
      await this.prisma.game.create({
        data: {
          id: gameId,
          player1: player1Name,
          player2: player2Name,
          winner: winnerName
        }
      });
    } catch (error) {
      console.error("Failed to save game result:", error);
      throw error;
    }
  }

  /**
   * Fetches game history
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getGameHistory(limit = 50) {
    return this.prisma.game.findMany({
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }
}
