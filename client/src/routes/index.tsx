import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BeaconLogo } from "../components/BeaconLogo";
import { GameBoard } from "../components/GameBoard";
import { GameLobby } from "../components/GameLobby";
import { WaitingRoom } from "../components/WaitingRoom";
import { useSocket } from "../context/SocketContext";
import { useGameState } from "../hooks/useGameState";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { socket } = useSocket();
  const [nickname, setNickname] = useState<string | null>(null);
  const {
    gameId,
    gameState,
    player1Name,
    player2Name,
    handleGameCreated,
    handleGameJoined,
    handleGameEnd,
  } = useGameState(socket);

  const handleNicknameSubmit = (name: string) => {
    setNickname(name);
    socket.emit("register_user", { playerName: name });
  };

  if (!nickname) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <BeaconLogo />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2 text-center">Tic-Tac-Toe</h1>
            <p className="text-gray-600 mb-6 text-center">Enter your nickname to start</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("nickname") as string;
                if (name.trim()) {
                  handleNicknameSubmit(name.trim());
                }
              }}
            >
              <input
                type="text"
                name="nickname"
                placeholder="Your nickname"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 mb-4"
              />
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "waiting" && gameId) {
    return <WaitingRoom gameId={gameId} playerName={nickname} />;
  }

  if (gameState === "playing" && gameId) {
    return (
      <GameBoard
        gameId={gameId}
        playerName={nickname}
        player1Name={player1Name}
        player2Name={player2Name}
        onGameEnd={handleGameEnd}
      />
    );
  }

  return (
    <GameLobby
      playerName={nickname}
      onGameCreated={handleGameCreated}
      onGameJoined={handleGameJoined}
    />
  );
}
