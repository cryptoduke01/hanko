/** Soft grainy monochrome sphere — CSS radial + SVG noise. Decorative only. */
export function GrainSphere({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none relative ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 38% 32%, #f5f5f5 0%, #d4d4d4 28%, #8a8a8a 55%, #3a3a3a 78%, #111 100%)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.35] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="hanko-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hanko-noise)" />
      </svg>
    </div>
  );
}
