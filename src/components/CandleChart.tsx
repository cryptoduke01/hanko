import type { Candle } from "@/lib/types";

/**
 * OHLC candlestick chart (SVG). Renders real candles when available; otherwise
 * draws a coarse price line from the market quote so there is always something
 * to show. Purely presentational, theme-aware via --up / --down / --rule.
 */
export function CandleChart({
  candles,
  line,
  height = 260,
  className = "",
}: {
  candles: Candle[] | null;
  line: number[] | null;
  height?: number;
  className?: string;
}) {
  const W = 760;
  const H = height;
  const padY = 14;

  if (candles && candles.length >= 2) {
    const hi = Math.max(...candles.map((c) => c.h));
    const lo = Math.min(...candles.map((c) => c.l));
    const range = hi - lo || 1;
    const y = (v: number) => padY + (1 - (v - lo) / range) * (H - padY * 2);
    const slot = W / candles.length;
    const bodyW = Math.max(1, Math.min(slot * 0.62, 14));

    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={className}
        style={{ width: "100%", height, display: "block" }}
        role="img"
        aria-label="Price candlestick chart"
      >
        {candles.map((c, i) => {
          const cx = i * slot + slot / 2;
          const up = c.c >= c.o;
          const color = up ? "var(--up)" : "var(--down)";
          const yO = y(c.o);
          const yC = y(c.c);
          const top = Math.min(yO, yC);
          const bodyH = Math.max(1, Math.abs(yC - yO));
          return (
            <g key={i}>
              <line
                x1={cx}
                x2={cx}
                y1={y(c.h)}
                y2={y(c.l)}
                stroke={color}
                strokeWidth={1}
                opacity={0.85}
              />
              <rect
                x={cx - bodyW / 2}
                y={top}
                width={bodyW}
                height={bodyH}
                fill={color}
                rx={0.5}
              />
            </g>
          );
        })}
      </svg>
    );
  }

  if (line && line.length >= 2) {
    const hi = Math.max(...line);
    const lo = Math.min(...line);
    const range = hi - lo || 1;
    const up = line[line.length - 1]! >= line[0]!;
    const color = up ? "var(--up)" : "var(--down)";
    const pts = line.map((p, i) => {
      const x = (i / (line.length - 1)) * W;
      const yv = padY + (1 - (p - lo) / range) * (H - padY * 2);
      return `${x.toFixed(1)},${yv.toFixed(1)}`;
    });
    const area = `M0,${H} L${pts.join(" L")} L${W},${H} Z`;
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={className}
        style={{ width: "100%", height, display: "block" }}
        role="img"
        aria-label="Price line chart"
      >
        <path d={area} fill={color} opacity={0.08} />
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  return (
    <div
      className={`flex items-center justify-center text-[12px] text-mute ${className}`}
      style={{ height }}
    >
      No price history yet.
    </div>
  );
}
