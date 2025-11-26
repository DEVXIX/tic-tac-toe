import { BeaconLogo } from "../BeaconLogo";

type GameHeaderProps = {
  playerName: string;
};

export function GameHeader({ playerName }: GameHeaderProps) {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto max-w-4xl px-6 py-6 flex items-center justify-between">
        <BeaconLogo />
        <p className="text-sm font-semibold text-gray-600">{playerName} (You)</p>
      </div>
    </header>
  );
}
