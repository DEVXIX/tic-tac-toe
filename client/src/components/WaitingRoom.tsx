import { useEffect, useState } from "react";
import { BeaconLogo } from "./BeaconLogo";

type WaitingRoomProps = {
  gameId: string;
  playerName: string;
};

export function WaitingRoom({ gameId, playerName }: WaitingRoomProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <BeaconLogo />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-12 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#ff5622] rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Waiting for opponent{dots}</h2>
          <p className="text-gray-600 mb-6">Another player will join shortly.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Game ID</p>
            <p className="text-lg font-mono font-semibold text-gray-800 break-all">{gameId}</p>
          </div>
          <p className="text-sm text-gray-600">You are: {playerName}</p>
        </div>
      </div>
    </div>
  );
}
