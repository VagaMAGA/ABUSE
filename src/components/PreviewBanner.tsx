type PreviewBannerProps = {
  message?: string;
};

export function PreviewBanner({ message }: PreviewBannerProps) {
  return (
    <div className="uni-card px-4 py-3">
      <p className="uni-label text-[var(--uni-pink)]">Preview mode</p>
      <p className="uni-caption mt-1">
        {message ??
          "Demo data — browse the app now. Connect wallet on Base after Hub deploy to play live."}
      </p>
    </div>
  );
}
