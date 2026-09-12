/**
 * The Hanko mark: a single seal disc rendered as a 1-bit dither that dissolves
 * at its edge. One quiet element, all negative space around it. The only
 * texture on the page.
 */
export function DitherSeal({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="Hanko seal"
    >
      <defs>
        <pattern
          id="hanko-dither"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="0.9" fill="var(--ink)" />
        </pattern>
        <radialGradient id="hanko-fade">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="58%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="hanko-mask">
          <rect x="60" y="60" width="280" height="280" fill="url(#hanko-fade)" />
        </mask>
      </defs>

      {/* dithered disc */}
      <g mask="url(#hanko-mask)">
        <circle cx="200" cy="200" r="140" fill="url(#hanko-dither)" opacity="0.85" />
      </g>

      {/* seal ring */}
      <circle
        cx="200"
        cy="200"
        r="140"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* 判 — the seal character */}
      <text
        x="200"
        y="200"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink"
        style={{ fontSize: 132, fontWeight: 500, opacity: 0.9 }}
      >
        判
      </text>
    </svg>
  );
}
