/**
 * Hero backdrop, Hanko's own: the spectrum drifting like slow waves, a dither
 * grid, film grain, and the seal pressed faintly *around* the edges with the
 * centre kept clear for the headline. Decorative.
 */
export function HeroBackdrop() {
  return (
    <div
      className="grain pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="hero-depth wave-anim absolute inset-0" />
      <div className="hero-dots absolute inset-0" />
      <SealField className="absolute inset-0 h-full w-full" />
    </div>
  );
}

/** A field of the 判 seal tiled around the hero; the centre is masked clear. */
function SealField({ className = "" }: { className?: string }) {
  return (
    <svg className={className} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <pattern
          id="hero-seal-tile"
          width="150"
          height="150"
          patternUnits="userSpaceOnUse"
          patternTransform="translate(18 14)"
        >
          <text
            x="75"
            y="75"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: 40, fontWeight: 500 }}
            fill="var(--ink)"
          >
            判
          </text>
        </pattern>
        {/* clear a large centre so seals read as sitting *around* the headline */}
        <radialGradient id="hero-seal-fade" cx="50%" cy="46%" r="72%">
          <stop offset="0%" stopColor="#000" />
          <stop offset="44%" stopColor="#000" />
          <stop offset="100%" stopColor="#fff" />
        </radialGradient>
        <mask id="hero-seal-clear">
          <rect width="100%" height="100%" fill="url(#hero-seal-fade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#hero-seal-tile)"
        opacity="0.06"
        mask="url(#hero-seal-clear)"
      />
    </svg>
  );
}
