import { useSocket } from "../context/SocketContext";
import { useGameBoard } from "../hooks/useGameBoard";
import { GameBoardGrid } from "./game/GameBoardGrid";
import { GameHeader } from "./game/GameHeader";
import { PlayerInfo } from "./game/PlayerInfo";
import { TurnIndicator } from "./game/TurnIndicator";
import { WinnerBanner } from "./game/WinnerBanner";

type GameBoardProps = {
  gameId: string;
  playerName: string;
  player1Name: string;
  player2Name: string;
  onGameEnd: () => void;
};

export function GameBoard({
  gameId,
  playerName,
  player1Name,
  player2Name,
  onGameEnd,
}: GameBoardProps) {
  const { socket } = useSocket();
  const {
    board,
    winner,
    showWinner,
    mySymbol,
    isMyTurn,
    opponentName,
    makeMove,
  } = useGameBoard(socket, gameId, playerName, player1Name, player2Name, onGameEnd);

  const getWinnerMessage = () => {
    if (winner === "Draw") return "It's a Draw!";
    if (winner === mySymbol || winner === playerName) return "You Won!";
    return `${opponentName} Won!`;
  };

  return (
    <div className="min-h-screen bg-white">
      <GameHeader playerName={playerName} />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {showWinner && <WinnerBanner message={getWinnerMessage()} />}

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <PlayerInfo label="You" playerName={playerName} symbol={mySymbol} />
          <TurnIndicator isMyTurn={isMyTurn} opponentName={opponentName} />
          <PlayerInfo
            label="Opponent"
            playerName={opponentName}
            symbol={mySymbol === "X" ? "O" : "X"}
          />
        </div>

        <GameBoardGrid
          board={board}
          onCellClick={makeMove}
          isMyTurn={isMyTurn}
          hasWinner={winner !== null}
        />
      </main>
    </div>
  );
}
