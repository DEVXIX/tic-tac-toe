import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import prisma from "./database/client.js";
import { GameManager } from "./game/manager.js";

console.log("Environment variables loaded:");
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("PORT:", process.env.PORT);
console.log("CLIENT_URL(S):", process.env.CLIENT_URLS || process.env.CLIENT_URL);

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  credentials: true
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const gameManager = new GameManager(io, prisma);

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/games/history", async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });
    res.json({ games });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game history" });
  }
});

app.get("/api/games/active", (req, res) => {
  const activeGames = gameManager.getActiveGames();
  res.json({ games: activeGames });
});

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on("register_user", (data) => {
    gameManager.addOnlineUser(socket.id, data.playerName);
  });

  socket.on("request_online_users", () => {
    const users = Array.from(gameManager.onlineUsers.values());
    socket.emit("online_users_updated", { users });
  });

  socket.on("request_active_games", () => {
    const activeGames = gameManager.getActiveGames();
    socket.emit("active_games_updated", { games: activeGames });
  });

  socket.on("create_game", (data) => {
    gameManager.createGame(socket, data.playerName);
  });

  socket.on("join_game", (data) => {
    gameManager.joinGame(socket, data.gameId, data.playerName);
  });

  socket.on("make_move", (data) => {
    gameManager.makeMove(socket, data.gameId, data.position);
  });

  socket.on("disconnect", () => {
    gameManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
