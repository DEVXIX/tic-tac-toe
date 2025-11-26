type CreateGamePanelProps = {
  onCreateGame: () => void;
};

export function CreateGamePanel({ onCreateGame }: CreateGamePanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ready to play?</h2>
      <p className="text-gray-600 mb-6">Start a new game and wait for an opponent to join.</p>
      <button
        onClick={onCreateGame}
        className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Create Game
      </button>
    </div>
  );
}
