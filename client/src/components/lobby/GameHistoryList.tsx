import type { GameHistory } from "../../types/game";

type GameHistoryListProps = {
  games: Array<GameHistory>;
};

export function GameHistoryList({ games }: GameHistoryListProps) {
  if (games.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Games</h2>
        <p className="text-gray-600">No games played yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Games</h2>
      <div className="space-y-3">
        {games.slice(0, 10).map((game) => (
          <div
            key={game.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div>
              <p className="font-semibold text-gray-800">
                {game.player1} vs {game.player2}
              </p>
              <p className="text-sm text-gray-600">{new Date(game.createdAt).toLocaleString()}</p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-semibold ${
                game.winner === "Draw"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-primary bg-opacity-10 text-white"
              }`}
            >
              {game.winner}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
