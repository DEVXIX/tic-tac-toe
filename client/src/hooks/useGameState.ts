import { useCallback, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type { GameStartedEvent } from "../types/game";

type GameStateType = "lobby" | "waiting" | "playing";

/**
 * Custom hook for managing overall game state transitions
 */
export function useGameState(socket: Socket) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameStateType>("lobby");
  const [player1Name, setPlayer1Name] = useState<string>("");
  const [player2Name, setPlayer2Name] = useState<string>("");

  useEffect(() => {
    function handleGameStartedEvent(data: GameStartedEvent) {
      setPlayer1Name(data.player1);
      setPlayer2Name(data.player2);

      // Only transition to playing when both players are ready
      if (data.player2 && data.player2 !== "Waiting...") {
        setGameState("playing");
      }
    }

    socket.on("game_started", handleGameStartedEvent);

    return () => {
      socket.off("game_started", handleGameStartedEvent);
    };
  }, [socket]);

  const handleGameCreated = useCallback((id: string) => {
    setGameId(id);
    setGameState("waiting");
  }, []);

  const handleGameJoined = useCallback((id: string) => {
    setGameId(id);
    setGameState("playing");
  }, []);

  const handleGameEnd = useCallback(() => {
    setGameState("lobby");
    setGameId(null);
  }, []);

  return {
    gameId,
    gameState,
    player1Name,
    player2Name,
    handleGameCreated,
    handleGameJoined,
    handleGameEnd,
  };
}
