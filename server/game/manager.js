import { v4 as uuidv4 } from "uuid";
import { checkWinner } from "./utils.js";

export class GameManager {
  constructor(io, prisma) {
    this.io = io;
    this.prisma = prisma;
    this.games = new Map();
    this.playerToGame = new Map();
    this.onlineUsers = new Map();
  }

  addOnlineUser(socketId, playerName) {
    this.onlineUsers.set(socketId, playerName);
    this.broadcastOnlineUsers();
  }

  removeOnlineUser(socketId) {
    this.onlineUsers.delete(socketId);
    this.broadcastOnlineUsers();
  }

  broadcastOnlineUsers() {
    const users = Array.from(this.onlineUsers.values());
    this.io.emit("online_users_updated", { users });
  }

  createGame(socket, playerName) {
    const gameId = uuidv4();
    const game = {
      id: gameId,
      player1: {
        id: socket.id,
        name: playerName,
        symbol: "X"
      },
      player2: null,
      board: Array(9).fill(null),
      currentTurn: "X",
      status: "waiting"
    };

    this.games.set(gameId, game);
    this.playerToGame.set(socket.id, gameId);
    socket.join(gameId);

    socket.emit("game_created", {
      gameId,
      symbol: "X"
    });

    socket.emit("game_started", {
      gameId,
      player1: game.player1.name,
      player2: "Waiting...",
      board: game.board,
      currentTurn: game.currentTurn
    });

    this.broadcastActiveGames();
  }

  joinGame(socket, gameId, playerName) {
    const game = this.games.get(gameId);

    if (!game) {
      socket.emit("error", { message: "Game not found" });
      return;
    }

    if (game.status !== "waiting") {
      socket.emit("error", { message: "Game already in progress" });
      return;
    }

    if (game.player2) {
      socket.emit("error", { message: "Game is full" });
      return;
    }

    game.player2 = {
      id: socket.id,
      name: playerName,
      symbol: "O"
    };
    game.status = "playing";

    this.playerToGame.set(socket.id, gameId);
    socket.join(gameId);

    console.log(`Player2 ${playerName} joined game ${gameId}. Emitting game_started to room.`);
    console.log(`Room members:`, Array.from(this.io.sockets.adapter.rooms.get(gameId) || []));

    this.io.to(gameId).emit("game_started", {
      gameId,
      player1: game.player1.name,
      player2: game.player2.name,
      board: game.board,
      currentTurn: game.currentTurn
    });

    this.broadcastActiveGames();
  }

  makeMove(socket, gameId, position) {
    const game = this.games.get(gameId);

    if (!game) {
      socket.emit("error", { message: "Game not found" });
      return;
    }

    if (game.status !== "playing") {
      socket.emit("error", { message: "Game is not active" });
      return;
    }

    const player = game.player1.id === socket.id ? game.player1 : game.player2;

    if (!player) {
      socket.emit("error", { message: "You are not in this game" });
      return;
    }

    if (game.currentTurn !== player.symbol) {
      socket.emit("error", { message: "Not your turn" });
      return;
    }

    if (game.board[position] !== null) {
      socket.emit("error", { message: "Position already taken" });
      return;
    }

    game.board[position] = player.symbol;
    game.currentTurn = player.symbol === "X" ? "O" : "X";

    this.io.to(gameId).emit("move_made", {
      position,
      symbol: player.symbol,
      board: game.board,
      currentTurn: game.currentTurn
    });

    const winner = checkWinner(game.board);

    if (winner) {
      this.endGame(game, winner);
    }
  }

  async endGame(game, winner) {
    game.status = "finished";

    let winnerName;
    if (winner === "Draw") {
      winnerName = "Draw";
    } else if (winner === "X") {
      winnerName = game.player1.name;
    } else {
      winnerName = game.player2.name;
    }

    this.io.to(game.id).emit("game_ended", {
      winner: winnerName,
      board: game.board
    });

    try {
      await this.prisma.game.create({
        data: {
          id: game.id,
          player1: game.player1.name,
          player2: game.player2.name,
          winner: winnerName
        }
      });
    } catch (error) {
      console.error("Failed to save game result:", error);
    }

    setTimeout(() => {
      this.games.delete(game.id);
      this.playerToGame.delete(game.player1.id);
      this.playerToGame.delete(game.player2.id);
      this.broadcastActiveGames();
    }, 5000);
  }

  handleDisconnect(socket) {
    this.removeOnlineUser(socket.id);
    
    const gameId = this.playerToGame.get(socket.id);

    if (!gameId) {
      return;
    }

    const game = this.games.get(gameId);

    if (!game) {
      this.playerToGame.delete(socket.id);
      return;
    }

    const disconnectedPlayer = game.player1.id === socket.id ? game.player1 : game.player2;
    const remainingPlayer = game.player1.id === socket.id ? game.player2 : game.player1;

    if (game.status === "waiting") {
      this.games.delete(gameId);
      this.playerToGame.delete(socket.id);
      this.broadcastActiveGames();
      return;
    }

    if (game.status === "playing" && remainingPlayer) {
      game.status = "finished";

      this.io.to(gameId).emit("player_disconnected", {
        winner: remainingPlayer.name,
        message: "Opponent disconnected. You win!"
      });

      this.prisma.game.create({
        data: {
          id: game.id,
          player1: game.player1.name,
          player2: game.player2.name,
          winner: remainingPlayer.name
        }
      }).catch(error => {
        console.error("Failed to save forfeit game:", error);
      });

      setTimeout(() => {
        this.games.delete(gameId);
        this.playerToGame.delete(game.player1.id);
        if (game.player2) {
          this.playerToGame.delete(game.player2.id);
        }
        this.broadcastActiveGames();
      }, 5000);
    }

    this.playerToGame.delete(socket.id);
  }

  getActiveGames() {
    const activeGames = [];

    for (const [gameId, game] of this.games) {
      if (game.status === "waiting") {
        activeGames.push({
          id: gameId,
          player1: game.player1.name,
          playerCount: 1,
          status: game.status
        });
      }
    }

    return activeGames;
  }

  broadcastActiveGames() {
    const activeGames = this.getActiveGames();
    this.io.emit("active_games_updated", { games: activeGames });
  }
}
