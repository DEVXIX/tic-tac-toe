type BoardCellProps = {
  value: string | null;
  onClick: () => void;
  disabled: boolean;
  isMyTurn: boolean;
  hasWinner: boolean;
};

export function BoardCell({ value, onClick, disabled, isMyTurn, hasWinner }: BoardCellProps) {
  const getCellStyles = () => {
    if (value === null && isMyTurn && !hasWinner) {
      return "border-gray-300 hover:border-primary hover:bg-primary hover:bg-opacity-5 cursor-pointer";
    }
    if (value === null && !isMyTurn) {
      return "border-gray-200 cursor-not-allowed opacity-50";
    }
    return "border-gray-200";
  };

  const getTextColor = () => {
    if (value === "X") return "text-gray-800";
    if (value === "O") return "text-primary";
    return "";
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`aspect-square flex items-center justify-center text-5xl font-semibold rounded-lg border-2 transition-all ${getCellStyles()} ${getTextColor()}`}
    >
      {value}
    </button>
  );
}
