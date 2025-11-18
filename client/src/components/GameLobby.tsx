import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { BeaconLogo } from "./BeaconLogo";

type GameHistory = {
  id: string;
  player1: string;
  player2: string;
  winner: string;
  createdAt: string;
};

type ActiveGame = {
  id: string;
  player1: string;
  playerCount: number;
  status: string;
};

type GameLobbyProps = {
  playerName: string;
  onGameCreated: (gameId: string) => void;
  onGameJoined: (gameId: string) => void;
};

export function GameLobby({ playerName, onGameCreated, onGameJoined }: GameLobbyProps) {
  const { socket } = useSocket();
  const [games, setGames] = useState<Array<GameHistory>>([]);
  const [activeGames, setActiveGames] = useState<Array<ActiveGame>>([]);
  const [onlineUsers, setOnlineUsers] = useState<Array<string>>([]);

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/games/history");
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error("Failed to fetch game history:", error);
      }
    };

    fetchGameHistory();
    
    // Request current online users and active games when entering lobby
    socket.emit("request_online_users");
    socket.emit("request_active_games");

    function onActiveGamesUpdated(data: { games: Array<ActiveGame> }) {
      setActiveGames(data.games);
    }

    function onOnlineUsersUpdated(data: { users: Array<string> }) {
      setOnlineUsers(data.users);
    }

    function handleGameCreated(data: { gameId: string }) {
      onGameCreated(data.gameId);
    }

    socket.on("active_games_updated", onActiveGamesUpdated);
    socket.on("online_users_updated", onOnlineUsersUpdated);
    socket.on("game_created", handleGameCreated);

    return () => {
      socket.off("active_games_updated", onActiveGamesUpdated);
      socket.off("online_users_updated", onOnlineUsersUpdated);
      socket.off("game_created", handleGameCreated);
    };
  }, [socket, onGameCreated]);

  const handleCreateGame = () => {
    socket.emit("create_game", { playerName });
  };

  const handleJoinGame = (gameId: string) => {
    socket.emit("join_game", { gameId, playerName });
    onGameJoined(gameId);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <BeaconLogo />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-gray-600">{onlineUsers.length} online</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">{playerName}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ready to play?</h2>
              <p className="text-gray-600 mb-6">Start a new game and wait for an opponent to join.</p>
              <button
                onClick={handleCreateGame}
                className="bg-[#ff5622] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e54d1f] transition-colors"
              >
                Create Game
              </button>
            </div>

            {activeGames.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Games Waiting for Players</h2>
                <div className="space-y-3">
                  {activeGames.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#ff5622] transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{game.player1}</p>
                        <p className="text-sm text-gray-600">Waiting for opponent...</p>
                      </div>
                      <button
                        onClick={() => handleJoinGame(game.id)}
                        className="bg-[#ff5622] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#e54d1f] transition-colors text-sm"
                      >
                        Join Game
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Games</h2>
              {games.length === 0 ? (
                <p className="text-gray-600">No games played yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {games.slice(0, 10).map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {game.player1} vs {game.player2}
                        </p>
                        <p className="text-sm text-gray-600">{new Date(game.createdAt).toLocaleString()}</p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg font-semibold ${ game.winner === "Draw"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-[#ff5622] bg-opacity-10 text-[#fff]"
                        }`}
                      >
                        {game.winner}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                Online Users ({onlineUsers.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {onlineUsers.map((user, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      user === playerName ? "bg-[#ff5622] text-white font-semibold" : "bg-gray-50 text-gray-800"
                    }`}
                  >
                    {user} {user === playerName && "(You)"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
