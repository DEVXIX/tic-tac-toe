import { BoardCell } from "./BoardCell";

type GameBoardGridProps = {
  board: Array<string | null>;
  onCellClick: (position: number) => void;
  isMyTurn: boolean;
  hasWinner: boolean;
};

export function GameBoardGrid({ board, onCellClick, isMyTurn, hasWinner }: GameBoardGridProps) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="grid grid-cols-3 gap-4">
        {board.map((cell, index) => (
          <BoardCell
            key={index}
            value={cell}
            onClick={() => onCellClick(index)}
            disabled={cell !== null || !isMyTurn || hasWinner}
            isMyTurn={isMyTurn}
            hasWinner={hasWinner}
          />
        ))}
      </div>
    </div>
  );
}
