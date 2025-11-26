import { useCallback, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type {
  ActiveGame,
  ActiveGamesUpdatedEvent,
  GameHistory,
  OnlineUsersUpdatedEvent,
} from "../types/game";

/**
 * Custom hook for managing game lobby state
 */
export function useGameLobby(socket: Socket, playerName: string) {
  const [games, setGames] = useState<Array<GameHistory>>([]);
  const [activeGames, setActiveGames] = useState<Array<ActiveGame>>([]);
  const [onlineUsers, setOnlineUsers] = useState<Array<string>>([]);

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/games/history");
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error("Failed to fetch game history:", error);
      }
    };

    fetchGameHistory();

    // Request initial data
    socket.emit("request_online_users");
    socket.emit("request_active_games");

    function onActiveGamesUpdated(data: ActiveGamesUpdatedEvent) {
      setActiveGames(data.games);
    }

    function onOnlineUsersUpdated(data: OnlineUsersUpdatedEvent) {
      setOnlineUsers(data.users);
    }

    socket.on("active_games_updated", onActiveGamesUpdated);
    socket.on("online_users_updated", onOnlineUsersUpdated);

    return () => {
      socket.off("active_games_updated", onActiveGamesUpdated);
      socket.off("online_users_updated", onOnlineUsersUpdated);
    };
  }, [socket]);

  const createGame = useCallback(() => {
    socket.emit("create_game", { playerName });
  }, [socket, playerName]);

  const joinGame = useCallback(
    (gameId: string) => {
      socket.emit("join_game", { gameId, playerName });
    },
    [socket, playerName]
  );

  return {
    games,
    activeGames,
    onlineUsers,
    createGame,
    joinGame,
  };
}
