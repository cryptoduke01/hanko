"use client";

interface SparklineProps {
  points: number[] | null | undefined;
  width?: number;
  height?: number;
  positive?: boolean | null;
  className?: string;
}

/**
 * Minimal SVG sparkline for table rows and cards.
 */
export function Sparkline({
  points,
  width = 72,
  height = 28,
  positive = null,
  className = "",
}: SparklineProps) {
  if (!points || points.length < 2) {
    return (
      <span
        className={`inline-block font-mono text-[10px] text-mute ${className}`}
        style={{ width, height, lineHeight: `${height}px` }}
      >
        —
      </span>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pad = 2;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((p - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0]},${height} L${coords[0][0]},${height} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const up = positive ?? last >= first;
  const stroke = up ? "var(--up)" : "var(--down)";
  const fill = up ? "color-mix(in srgb, var(--up) 16%, transparent)" : "color-mix(in srgb, var(--down) 16%, transparent)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden
    >
      <path d={area} fill={fill} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r="2"
        fill={stroke}
      />
    </svg>
  );
}
