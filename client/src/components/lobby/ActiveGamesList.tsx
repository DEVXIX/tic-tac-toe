import type { ActiveGame } from "../../types/game";

type ActiveGamesListProps = {
  games: Array<ActiveGame>;
  onJoinGame: (gameId: string) => void;
};

export function ActiveGamesList({ games, onJoinGame }: ActiveGamesListProps) {
  if (games.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Games Waiting for Players</h2>
      <div className="space-y-3">
        {games.map((game) => (
          <div
            key={game.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
          >
            <div>
              <p className="font-semibold text-gray-800">{game.player1}</p>
              <p className="text-sm text-gray-600">Waiting for opponent...</p>
            </div>
            <button
              onClick={() => onJoinGame(game.id)}
              className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              Join Game
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
