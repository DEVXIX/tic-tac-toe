import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { BeaconLogo } from "./BeaconLogo";

type GameBoardProps = {
  gameId: string;
  playerName: string;
  player1Name: string;
  player2Name: string;
  onGameEnd: () => void;
};

export function GameBoard({ gameId, playerName, player1Name, player2Name, onGameEnd }: GameBoardProps) {
  const { socket } = useSocket();
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [mySymbol] = useState<"X" | "O">(player1Name === playerName ? "X" : "O");
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {

    function handleMoveMade(data: { position: number; symbol: "X" | "O"; board: Array<string | null>; currentTurn: "X" | "O" }) {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
    }

    function handleGameEnded(data: { winner: string }) {
      setWinner(data.winner);
      setShowWinner(true);
      setTimeout(() => {
        onGameEnd();
      }, 3000);
    }

    function handlePlayerDisconnected(data: { winner: string }) {
      setWinner(data.winner);
      setShowWinner(true);
      setTimeout(() => {
        onGameEnd();
      }, 3000);
    }

    socket.on("move_made", handleMoveMade);
    socket.on("game_ended", handleGameEnded);
    socket.on("player_disconnected", handlePlayerDisconnected);

    return () => {
      socket.off("move_made", handleMoveMade);
      socket.off("game_ended", handleGameEnded);
      socket.off("player_disconnected", handlePlayerDisconnected);
    };
  }, [socket, onGameEnd]);

  const handleMove = (position: number) => {
    if (board[position] !== null) return;
    if (currentTurn !== mySymbol) return;
    if (winner) return;

    socket.emit("make_move", { gameId, position });
  };

  const isMyTurn = currentTurn === mySymbol;
  const opponentName = player1Name === playerName ? player2Name : player1Name;

  let winnerMessage = "";
  if (winner === "Draw") {
    winnerMessage = "It's a Draw!";
  } else if (winner === mySymbol) {
    winnerMessage = "You Won!";
  } else if (winner === playerName) {
    winnerMessage = "You Won!";
  } else if (winner) {
    winnerMessage = `${opponentName} Won!`;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-6 py-6 flex items-center justify-between">
          <BeaconLogo />
          <p className="text-sm font-semibold text-gray-600">{playerName} (You)</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {showWinner && (
          <div className="mb-8 bg-[#ff5622] border border-[#ff5622] rounded-lg p-6 text-center">
            <h2 className="text-3xl font-semibold text-white mb-2">{winnerMessage}</h2>
            <p className="text-white opacity-90">Redirecting to lobby...</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">You</p>
            <p className="text-2xl font-semibold text-gray-800">{playerName}</p>
            <p className="text-[#ff5622] font-semibold mt-2">{mySymbol}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Current Turn</p>
              <div
                className={`inline-block px-6 py-3 rounded-lg font-semibold ${
                  isMyTurn ? "bg-[#ff5622] text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {isMyTurn ? "Your Turn" : `${opponentName}'s Turn`}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Opponent</p>
            <p className="text-2xl font-semibold text-gray-800">{opponentName}</p>
            <p className="text-[#ff5622] font-semibold mt-2">{mySymbol === "X" ? "O" : "X"}</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleMove(index)}
                disabled={cell !== null || !isMyTurn || winner !== null}
                className={`aspect-square flex items-center justify-center text-5xl font-semibold rounded-lg border-2 transition-all ${
                  cell === null && isMyTurn && !winner
                    ? "border-gray-300 hover:border-[#ff5622] hover:bg-[#ff5622] hover:bg-opacity-5 cursor-pointer"
                    : "border-gray-200"
                } ${cell === "X" ? "text-gray-800" : cell === "O" ? "text-[#ff5622]" : ""} ${
                  cell === null && !isMyTurn ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
