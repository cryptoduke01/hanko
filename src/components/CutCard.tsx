/**
 * A cutout card: a framed haze panel with the dither grid and film grain, and
 * an optional colour glow rising from a corner. The shared card language across
 * the site — the closing FeatureCard is the large, seal-bearing sibling.
 */
export function CutCard({
  tint,
  className = "",
  padding = "p-6",
  children,
}: {
  tint?: string;
  className?: string;
  padding?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-rule bg-haze ${className}`}
    >
      <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />
      {tint && (
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: `radial-gradient(78% 62% at 16% 118%, ${tint} 0%, transparent 60%)`,
          }}
        />
      )}
      <div className={`relative ${padding}`}>{children}</div>
    </div>
  );
}
