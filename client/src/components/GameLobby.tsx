import { useSocket } from "../context/SocketContext";
import { useGameLobby } from "../hooks/useGameLobby";
import { ActiveGamesList } from "./lobby/ActiveGamesList";
import { CreateGamePanel } from "./lobby/CreateGamePanel";
import { GameHistoryList } from "./lobby/GameHistoryList";
import { LobbyHeader } from "./lobby/LobbyHeader";
import { OnlineUsersList } from "./lobby/OnlineUsersList";

type GameLobbyProps = {
  playerName: string;
  onGameCreated: (gameId: string) => void;
  onGameJoined: (gameId: string) => void;
};

export function GameLobby({ playerName, onGameCreated, onGameJoined }: GameLobbyProps) {
  const { socket } = useSocket();
  const { games, activeGames, onlineUsers, createGame, joinGame } = useGameLobby(socket, playerName);

  const handleCreateGame = () => {
    createGame();
    socket.once("game_created", (data: { gameId: string }) => {
      onGameCreated(data.gameId);
    });
  };

  const handleJoinGame = (gameId: string) => {
    joinGame(gameId);
    onGameJoined(gameId);
  };

  return (
    <div className="min-h-screen bg-white">
      <LobbyHeader playerName={playerName} onlineCount={onlineUsers.length} />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CreateGamePanel onCreateGame={handleCreateGame} />
            <ActiveGamesList games={activeGames} onJoinGame={handleJoinGame} />
            <GameHistoryList games={games} />
          </div>

          <div className="space-y-6">
            <OnlineUsersList users={onlineUsers} currentPlayerName={playerName} />
          </div>
        </div>
      </main>
    </div>
  );
}
