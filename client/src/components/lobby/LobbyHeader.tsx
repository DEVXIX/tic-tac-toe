import { BeaconLogo } from "../BeaconLogo";

type LobbyHeaderProps = {
  playerName: string;
  onlineCount: number;
};

export function LobbyHeader({ playerName, onlineCount }: LobbyHeaderProps) {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <BeaconLogo />
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-gray-600">{onlineCount} online</span>
          </div>
          <p className="text-sm font-semibold text-gray-600">{playerName}</p>
        </div>
      </div>
    </header>
  );
}
