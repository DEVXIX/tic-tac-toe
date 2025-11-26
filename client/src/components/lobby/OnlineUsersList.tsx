type OnlineUsersListProps = {
  users: Array<string>;
  currentPlayerName: string;
};

export function OnlineUsersList({ users, currentPlayerName }: OnlineUsersListProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gray-400" />
        Online Users ({users.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {users.map((user, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              user === currentPlayerName
                ? "bg-primary text-white font-semibold"
                : "bg-gray-50 text-gray-800"
            }`}
          >
            {user} {user === currentPlayerName && "(You)"}
          </div>
        ))}
      </div>
    </div>
  );
}
