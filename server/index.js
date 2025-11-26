import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import prisma from "./database/client.js";
import { GameRepository } from "./game/game-repository.js";
import { UserManager } from "./game/user-manager.js";
import { GameStateManager } from "./game/game-state-manager.js";
import { SocketHandler } from "./game/socket-handler.js";

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

// Initialize services
const gameRepository = new GameRepository(prisma);
const userManager = new UserManager(io);
const gameStateManager = new GameStateManager(io, gameRepository);
const socketHandler = new SocketHandler(io, gameStateManager, userManager, gameRepository);

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
  const activeGames = gameStateManager.getActiveGames();
  res.json({ games: activeGames });
});

app.get("/api/users/online", (req, res) => {
  const users = userManager.getOnlineUsers();
  res.json({ users });
});

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);
  socketHandler.setupHandlers(socket);
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
