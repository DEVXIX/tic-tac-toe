type PlayerInfoProps = {
  label: string;
  playerName: string;
  symbol: "X" | "O";
};

export function PlayerInfo({ label, playerName, symbol }: PlayerInfoProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-800">{playerName}</p>
      <p className="text-primary font-semibold mt-2">{symbol}</p>
    </div>
  );
}
