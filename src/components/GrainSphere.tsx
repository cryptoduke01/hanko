/** Soft grainy monochrome liquid sphere — decorative hero element. */
export function GrainSphere({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none relative ${className}`}
      aria-hidden="true"
    >
      {/* Soft ambient bloom */}
      <div
        className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(180,180,180,0.45) 0%, rgba(250,250,250,0) 70%)",
        }}
      />

      {/* Liquid sphere body */}
      <div className="liquid-sphere absolute inset-0 overflow-hidden rounded-full shadow-[inset_-24px_-28px_60px_rgba(0,0,0,0.35),inset_18px_16px_40px_rgba(255,255,255,0.55)]">
        <div
          className="liquid-sphere-inner absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 34% 30%, var(--sphere-highlight) 0%, color-mix(in srgb, var(--sphere-highlight) 70%, var(--sphere-mid)) 22%, var(--sphere-mid) 48%, color-mix(in srgb, var(--sphere-mid) 40%, var(--sphere-deep)) 72%, var(--sphere-deep) 100%)",
          }}
        />
        {/* Specular highlight */}
        <div
          className="absolute left-[18%] top-[14%] h-[28%] w-[34%] rounded-full opacity-70 blur-md"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in srgb, var(--sphere-highlight) 90%, transparent) 0%, transparent 70%)",
          }}
        />
        {/* SVG grain clipped to circle */}
        <svg
          className="absolute inset-0 h-full w-full rounded-full opacity-[0.28] mix-blend-overlay"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="hanko-noise" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.72"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <clipPath id="sphere-clip">
              <circle cx="50%" cy="50%" r="50%" />
            </clipPath>
          </defs>
          <rect
            width="100%"
            height="100%"
            filter="url(#hanko-noise)"
            clipPath="url(#sphere-clip)"
          />
        </svg>
      </div>
    </div>
  );
}
