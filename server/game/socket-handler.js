/**
 * SocketHandler - Routes Socket.io events to appropriate services
 * Handles all real-time communication between client and server
 */
export class SocketHandler {
  constructor(io, gameStateManager, userManager, gameRepository) {
    this.io = io;
    this.gameStateManager = gameStateManager;
    this.userManager = userManager;
    this.gameRepository = gameRepository;
  }

  /**
   * Sets up Socket.io event handlers for a client connection
   * @param {import('socket.io').Socket} socket 
   */
  setupHandlers(socket) {
    socket.on("register_user", (data) => this.handleRegisterUser(socket, data));
    socket.on("create_game", (data) => this.handleCreateGame(socket, data));
    socket.on("join_game", (data) => this.handleJoinGame(socket, data));
    socket.on("make_move", (data) => this.handleMakeMove(socket, data));
    socket.on("request_online_users", () => this.handleRequestOnlineUsers(socket));
    socket.on("request_active_games", () => this.handleRequestActiveGames(socket));
    socket.on("request_game_history", () => this.handleRequestGameHistory(socket));
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  /**
   * Handles user registration
   * @param {import('socket.io').Socket} socket 
   * @param {{ playerName: string }} data 
   */
  handleRegisterUser(socket, data) {
    const { playerName } = data;
    this.userManager.addUser(socket.id, playerName);
    console.log(`User registered: ${playerName} (${socket.id})`);
  }

  /**
   * Handles game creation
   * @param {import('socket.io').Socket} socket 
   * @param {{ playerName: string }} data 
   */
  handleCreateGame(socket, data) {
    const { playerName } = data;
    const game = this.gameStateManager.createGame(socket.id, playerName);
    
    // Host joins the game room
    socket.join(game.id);
    
    socket.emit("game_created", { gameId: game.id });
    this.io.emit("active_games_updated", { games: this.gameStateManager.getActiveGames() });
    console.log(`Game created: ${game.id} by ${playerName}`);
  }

  /**
   * Handles player joining a game
   * @param {import('socket.io').Socket} socket 
   * @param {{ gameId: string, playerName: string }} data 
   */
  handleJoinGame(socket, data) {
    const { gameId, playerName } = data;
    const result = this.gameStateManager.joinGame(gameId, socket.id, playerName);

    if (result.success) {
      const game = result.game;

      // Both players join the game room
      this.io.sockets.sockets.get(game.player1.id)?.join(gameId);
      socket.join(gameId);

      // Notify both players that game is starting
      this.io.to(gameId).emit("game_started", {
        gameId: game.id,
        currentTurn: game.currentTurn,
        board: game.board,
        player1: game.player1.name,
        player2: game.player2.name,
      });

      this.io.emit("active_games_updated", { games: this.gameStateManager.getActiveGames() });
      console.log(`Player ${playerName} joined game ${gameId}`);
    } else {
      socket.emit("error", { message: result.error });
    }
  }

  /**
   * Handles a move in a game
   * @param {import('socket.io').Socket} socket 
   * @param {{ gameId: string, position: number }} data 
   */
  async handleMakeMove(socket, data) {
    const { gameId, position } = data;
    const result = this.gameStateManager.makeMove(gameId, socket.id, position);

    if (result.error) {
      socket.emit("error", { message: result.error });
      return;
    }

    const game = this.gameStateManager.getGame(gameId);

    // Broadcast updated board to the game room
    this.io.to(gameId).emit("move_made", {
      position,
      symbol: result.symbol,
      board: game.board,
      currentTurn: game.currentTurn,
    });

    // Handle game end
    if (result.winner || result.draw) {
      const winnerName = await this.gameStateManager.endGame(gameId, result.winner);

      this.io.to(gameId).emit("game_ended", {
        winner: result.winner,
        winnerName: winnerName,
        draw: result.draw,
      });

      console.log(`Game ${gameId} ended - Winner: ${winnerName || "Draw"}`);
    }
  }

  /**
   * Handles request for online users
   * @param {import('socket.io').Socket} socket 
   */
  handleRequestOnlineUsers(socket) {
    const users = this.userManager.getOnlineUsers();
    socket.emit("online_users_updated", { users });
  }

  /**
   * Handles request for active games
   * @param {import('socket.io').Socket} socket 
   */
  handleRequestActiveGames(socket) {
    socket.emit("active_games_updated", { games: this.gameStateManager.getActiveGames() });
  }

  /**
   * Handles request for game history
   * @param {import('socket.io').Socket} socket 
   */
  async handleRequestGameHistory(socket) {
    try {
      const history = await this.gameRepository.getGameHistory(10);
      socket.emit("game_history", history);
    } catch (error) {
      console.error("Error fetching game history:", error);
      socket.emit("error", { message: "Failed to load game history" });
    }
  }

  /**
   * Handles client disconnect
   * @param {import('socket.io').Socket} socket 
   */
  async handleDisconnect(socket) {
    const forfeitResult = await this.gameStateManager.handleDisconnect(socket.id);

    if (forfeitResult.forfeit) {
      const game = this.gameStateManager.getGame(forfeitResult.gameId);
      if (game) {
        const remainingPlayer = game.player1.id !== socket.id ? game.player1 : game.player2;
        
        this.io.to(remainingPlayer.id).emit("opponent_disconnected", {
          message: `Your opponent disconnected. You win by forfeit!`,
          winner: forfeitResult.winner,
        });
      }
    }

    this.userManager.removeUser(socket.id);
    this.io.emit("active_games_updated", { games: this.gameStateManager.getActiveGames() });
    console.log(`User disconnected: ${socket.id}`);
  }
}
