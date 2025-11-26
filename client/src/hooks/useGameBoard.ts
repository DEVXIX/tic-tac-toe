import { useCallback, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type {
  GameEndedEvent,
  GameStartedEvent,
  MoveMadeEvent,
  PlayerDisconnectedEvent,
} from "../types/game";

/**
 * Custom hook for managing game board state and socket events
 */
export function useGameBoard(
  socket: Socket,
  gameId: string,
  playerName: string,
  player1Name: string,
  player2Name: string,
  onGameEnd: () => void
) {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);

  const mySymbol: "X" | "O" = player1Name === playerName ? "X" : "O";
  const isMyTurn = currentTurn === mySymbol;
  const opponentName = player1Name === playerName ? player2Name : player1Name;

  useEffect(() => {
    // Reset state on mount
    setBoard(Array(9).fill(null));
    setCurrentTurn("X");
    setWinner(null);
    setShowWinner(false);

    function handleGameStarted(data: GameStartedEvent) {
      if (data.gameId === gameId && data.player2 !== "Waiting...") {
        setBoard(data.board);
        setCurrentTurn(data.currentTurn);
        setWinner(null);
        setShowWinner(false);
      }
    }

    function handleMoveMade(data: MoveMadeEvent) {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
    }

    function handleGameEnded(data: GameEndedEvent) {
      setWinner(data.winner);
      setShowWinner(true);
      setTimeout(() => {
        onGameEnd();
      }, 3000);
    }

    function handlePlayerDisconnected(data: PlayerDisconnectedEvent) {
      setWinner(data.winner);
      setShowWinner(true);
      setTimeout(() => {
        onGameEnd();
      }, 3000);
    }

    socket.on("game_started", handleGameStarted);
    socket.on("move_made", handleMoveMade);
    socket.on("game_ended", handleGameEnded);
    socket.on("player_disconnected", handlePlayerDisconnected);

    return () => {
      socket.off("game_started", handleGameStarted);
      socket.off("move_made", handleMoveMade);
      socket.off("game_ended", handleGameEnded);
      socket.off("player_disconnected", handlePlayerDisconnected);
    };
  }, [socket, gameId, onGameEnd]);

  const makeMove = useCallback(
    (position: number) => {
      if (board[position] !== null || !isMyTurn || winner) {
        return;
      }
      socket.emit("make_move", { gameId, position });
    },
    [board, isMyTurn, winner, socket, gameId]
  );

  return {
    board,
    currentTurn,
    winner,
    showWinner,
    mySymbol,
    isMyTurn,
    opponentName,
    makeMove,
  };
}
