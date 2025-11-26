type TurnIndicatorProps = {
  isMyTurn: boolean;
  opponentName: string;
};

export function TurnIndicator({ isMyTurn, opponentName }: TurnIndicatorProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Current Turn</p>
        <div
          className={`inline-block px-6 py-3 rounded-lg font-semibold ${
            isMyTurn ? "bg-primary text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          {isMyTurn ? "Your Turn" : `${opponentName}'s Turn`}
        </div>
      </div>
    </div>
  );
}
