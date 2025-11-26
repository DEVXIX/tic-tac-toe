type WinnerBannerProps = {
  message: string;
};

export function WinnerBanner({ message }: WinnerBannerProps) {
  return (
    <div className="mb-8 bg-primary border border-primary rounded-lg p-6 text-center">
      <h2 className="text-3xl font-semibold text-white mb-2">{message}</h2>
      <p className="text-white opacity-90">Redirecting to lobby...</p>
    </div>
  );
}
