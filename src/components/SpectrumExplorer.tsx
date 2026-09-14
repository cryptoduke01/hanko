"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMarket } from "@/hooks/useMarket";
import { StockLogo } from "@/components/StockLogo";
import { formatUsd } from "@/lib/market";
import {
  type SpectrumConfig,
  type TrancheKey,
  TRANCHE_META,
  TRANCHES,
  edgeMetrics,
  payoffAll,
  samplePayoffCurve,
  shieldMetrics,
  strikes,
  trancheValues,
} from "@/lib/spectrum";

interface AssetOpt {
  slug: string;
  ticker: string;
  symbol: string;
  underlying: string;
  vol: number;
  fallback: number;
}

const ASSETS: AssetOpt[] = [
  { slug: "tslax", ticker: "TSLAx", symbol: "TSLA", underlying: "Tesla", vol: 0.6, fallback: 420 },
  { slug: "nvdax", ticker: "NVDAx", symbol: "NVDA", underlying: "NVIDIA", vol: 0.52, fallback: 180 },
  { slug: "spyx", ticker: "SPYx", symbol: "SPY", underlying: "S&P 500", vol: 0.16, fallback: 640 },
  { slug: "mstrx", ticker: "MSTRx", symbol: "MSTR", underlying: "MicroStrategy", vol: 0.95, fallback: 360 },
  { slug: "coinx", ticker: "COINx", symbol: "COIN", underlying: "Coinbase", vol: 0.8, fallback: 300 },
];

const MATURITIES = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "180D", days: 180 },
];

const clamp = (x: number, lo: number, hi: number) =>
  Math.min(Math.max(x, lo), hi);
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

// Chart geometry (viewBox units)
const W = 680;
const H = 380;
const PX0 = 46;
const PX1 = 664;
const PY0 = 16;
const PY1 = 344;
const MAX_MULT = 2;

export function SpectrumExplorer() {
  const { quotes } = useMarket();

  const [slug, setSlug] = useState("tslax");
  const [floorPct, setFloorPct] = useState(0.7);
  const [capPct, setCapPct] = useState(1.15);
  const [days, setDays] = useState(30);
  const [vol, setVol] = useState(0.6);
  const [settle, setSettle] = useState(1.3); // fraction of spot
  const [dragging, setDragging] = useState(false);

  const asset = ASSETS.find((a) => a.slug === slug) ?? ASSETS[0];

  // Reset vol to the asset's default when the asset changes.
  useEffect(() => {
    setVol(asset.vol);
  }, [asset.vol]);

  const liveSpot = quotes[slug]?.priceUsd ?? null;
  const spot = liveSpot && liveSpot > 0 ? liveSpot : asset.fallback;

  const cfg: SpectrumConfig = useMemo(
    () => ({ spot, floorPct, capPct, tYears: days / 365, vol, rate: 0.04 }),
    [spot, floorPct, capPct, days, vol]
  );

  const k = useMemo(() => strikes(cfg), [cfg]);
  const values = useMemo(() => trancheValues(cfg), [cfg]);
  const shield = useMemo(() => shieldMetrics(cfg), [cfg]);
  const edge = useMemo(() => edgeMetrics(cfg), [cfg]);
  const curve = useMemo(() => samplePayoffCurve(cfg, MAX_MULT, 96), [cfg]);

  const sMax = spot * MAX_MULT;
  const settlePrice = clamp(settle * spot, 0, sMax);
  const atSettle = payoffAll(settlePrice, k);
  const sumAtSettle = atSettle.shield + atSettle.core + atSettle.edge;

  // Scales
  const xOf = (s: number) => PX0 + (s / sMax) * (PX1 - PX0);
  const yOf = (v: number) => PY1 - (v / sMax) * (PY1 - PY0);

  // Build a stacked band path between lower[] and upper[] value arrays.
  const bandPath = (lower: number[], upper: number[]) => {
    const top = curve
      .map((c, i) => `${i === 0 ? "M" : "L"}${xOf(c.s).toFixed(1)},${yOf(upper[i]).toFixed(1)}`)
      .join(" ");
    const bottom = curve
      .map((c, i) => `L${xOf(c.s).toFixed(1)},${yOf(lower[i]).toFixed(1)}`)
      .reverse()
      .join(" ");
    return `${top} ${bottom} Z`;
  };

  const zeros = curve.map(() => 0);
  const cShield = curve.map((c) => c.shield);
  const cShieldCore = curve.map((c) => c.shield + c.core);
  const cTotal = curve.map((c) => c.shield + c.core + c.edge);

  const paths: Record<TrancheKey, string> = {
    shield: bandPath(zeros, cShield),
    core: bandPath(cShield, cShieldCore),
    edge: bandPath(cShieldCore, cTotal),
  };

  // Draggable settlement marker
  const svgRef = useRef<SVGSVGElement>(null);
  const setFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xv = ((clientX - rect.left) / rect.width) * W;
    const frac = clamp((xv - PX0) / (PX1 - PX0), 0, 1);
    setSettle(frac * MAX_MULT);
  };

  const stackAt = (arr: number[]) => {
    // interpolate stacked value at settlePrice for the marker chips
    return arr;
  };
  void stackAt;

  const markerX = xOf(settlePrice);
  const scenarios = [
    { label: "Crash −40%", f: 0.6 },
    { label: "Flat", f: 1.0 },
    { label: "Moon +50%", f: 1.5 },
  ];

  return (
    <div className="w-full">
      {/* --- Controls row --- */}
      <div className="flex flex-col gap-4 rounded-2xl border border-rule bg-paper p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {ASSETS.map((a) => {
            const active = a.slug === slug;
            return (
              <button
                key={a.slug}
                type="button"
                onClick={() => setSlug(a.slug)}
                data-active={active}
                className={`inline-flex items-center gap-1.5 rounded-lg press border px-2.5 py-1.5 text-[11px] tracking-[0.01em] transition-colors duration-200 ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-rule text-mute hover:border-ink hover:text-ink"
                }`}
              >
                <StockLogo symbol={a.symbol} size={15} />
                {a.ticker}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <StockLogo symbol={asset.symbol} size={36} />
            <div>
              <div className="font-mono text-[10px] tracking-[0.01em] text-mute">
                {asset.underlying} · 1 {asset.ticker}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-sans text-3xl font-bold tracking-tight text-ink tabular-nums">
                  {formatUsd(spot)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <SliderControl
              label="Floor L"
              value={pct(floorPct)}
              min={0.5}
              max={0.95}
              step={0.01}
              raw={floorPct}
              onChange={(v) => setFloorPct(Math.min(v, capPct - 0.05))}
              tint="var(--shield)"
            />
            <SliderControl
              label="Cap U"
              value={pct(capPct)}
              min={1.05}
              max={1.6}
              step={0.01}
              raw={capPct}
              onChange={(v) => setCapPct(Math.max(v, floorPct + 0.05))}
              tint="var(--edge)"
            />
            <SliderControl
              label="Vol σ"
              value={pct(vol)}
              min={0.1}
              max={1.2}
              step={0.01}
              raw={vol}
              onChange={setVol}
              tint="var(--mute)"
            />
            <div>
              <div className="mb-1 font-mono text-[10px] tracking-[0.01em] text-mute">
                Maturity
              </div>
              <div className="flex">
                {MATURITIES.map((m) => (
                  <button
                    key={m.days}
                    type="button"
                    onClick={() => setDays(m.days)}
                    className={`border-y border-r px-2.5 py-1 first:rounded-l-lg last:rounded-r-lg font-mono text-[11px] tracking-[0.01em] first:border-l transition-colors duration-200 ${
                      days === m.days
                        ? "border-ink bg-ink text-paper"
                        : "border-rule text-mute hover:text-ink"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Mint split bar --- */}
      <div className="mt-4 rounded-2xl border border-rule bg-paper p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.01em] text-mute">
            Deposit 1 {asset.ticker}, mint the spectrum
          </span>
          <span className="font-mono text-[10px] tracking-[0.01em] text-mute">
            Σ = {formatUsd(values.spot)}
          </span>
        </div>
        <div className="mt-3 flex h-9 w-full overflow-hidden rounded-lg border border-rule">
          {TRANCHES.map((key) => {
            const v = values[key];
            const w = (v / values.spot) * 100;
            return (
              <div
                key={key}
                className="relative flex items-center justify-center overflow-hidden border-r border-paper/40 last:border-r-0"
                style={{ width: `${w}%` }}
                title={`${TRANCHE_META[key].name} ${formatUsd(v)}`}
              >
                <span
                  className="absolute inset-0"
                  style={{ background: TRANCHE_META[key].colorVar, opacity: 0.16 }}
                  aria-hidden
                />
                <span
                  className="dither absolute inset-0"
                  style={{ background: TRANCHE_META[key].colorVar }}
                  aria-hidden
                />
                <span className="relative px-1 text-[10px] font-semibold tracking-[0.01em] text-ink whitespace-nowrap">
                  {w > 10 ? TRANCHE_META[key].name : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Tranche cards --- */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <TrancheCard
          k="shield"
          value={values.shield}
          share={values.shield / values.spot}
          lines={[
            ["Redeems at", formatUsd(shield.redeemsAt)],
            ["Implied APY", pct(shield.impliedApy)],
            ["Buffer", `−${pct(shield.bufferPct)} before impaired`],
          ]}
        />
        <TrancheCard
          k="core"
          value={values.core}
          share={values.core / values.spot}
          lines={[
            ["Band", `${formatUsd(k.L)} → ${formatUsd(k.U)}`],
            ["Width", pct(capPct - floorPct)],
            ["Role", "Plain exposure, mid-band"],
          ]}
        />
        <TrancheCard
          k="edge"
          value={values.edge}
          share={values.edge / values.spot}
          lines={[
            ["Strike", formatUsd(edge.strike)],
            ["Breakeven", `${formatUsd(edge.breakeven)} · +${pct(edge.breakevenMovePct)}`],
            ["Cost", `${pct(edge.costPctOfShare)} of a share · no liquidation`],
          ]}
        />
      </div>

      {/* --- Payoff chart --- */}
      <div className="mt-4 rounded-2xl border border-rule bg-paper p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] tracking-[0.01em] text-mute">
            Payoff at maturity · drag to set settlement price
          </span>
          <div className="flex gap-1.5">
            {scenarios.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setSettle(s.f)}
                className="rounded-md press border border-rule px-2 py-1 font-mono text-[10px] tracking-[0.01em] text-mute transition-colors duration-200 hover:border-ink hover:text-ink"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none select-none"
          style={{ cursor: "ew-resize" }}
          onPointerDown={(e) => {
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromClientX(e.clientX);
          }}
          onPointerMove={(e) => dragging && setFromClientX(e.clientX)}
          onPointerUp={(e) => {
            setDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          {/* Y grid + labels */}
          {[0, 0.5, 1, 1.5, 2].map((m) => (
            <g key={m}>
              <line
                x1={PX0}
                x2={PX1}
                y1={yOf(spot * m)}
                y2={yOf(spot * m)}
                stroke="var(--rule)"
                strokeWidth={0.75}
                strokeDasharray={m === 0 ? "0" : "2 3"}
                opacity={0.7}
              />
              <text
                x={PX0 - 6}
                y={yOf(spot * m) + 3}
                textAnchor="end"
                className="fill-mute font-mono"
                style={{ fontSize: 9 }}
              >
                {formatUsd(spot * m)}
              </text>
            </g>
          ))}

          {/* Dither patterns for the stacked areas */}
          <defs>
            <pattern id="dz-shield" width="3" height="3" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.95" fill="var(--shield)" />
            </pattern>
            <pattern id="dz-core" width="3" height="3" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.95" fill="var(--core)" />
            </pattern>
            <pattern id="dz-edge" width="3" height="3" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.95" fill="var(--edge)" />
            </pattern>
          </defs>
          {/* Stacked areas, dithered over a faint base */}
          <path d={paths.shield} fill="var(--shield)" opacity={0.12} />
          <path d={paths.shield} fill="url(#dz-shield)" />
          <path d={paths.core} fill="var(--core)" opacity={0.12} />
          <path d={paths.core} fill="url(#dz-core)" />
          <path d={paths.edge} fill="var(--edge)" opacity={0.12} />
          <path d={paths.edge} fill="url(#dz-edge)" />

          {/* Total line = S (45°), proves conservation */}
          <line
            x1={xOf(0)}
            y1={yOf(0)}
            x2={xOf(sMax)}
            y2={yOf(sMax)}
            stroke="var(--ink)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />

          {/* Strike + spot guides */}
          {[
            { x: k.L, label: "L", tint: "var(--shield)", row: 0 },
            { x: spot, label: "S₀", tint: "var(--ink)", row: 1 },
            { x: k.U, label: "U", tint: "var(--edge)", row: 0 },
          ].map((g) => (
            <g key={g.label}>
              <line
                x1={xOf(g.x)}
                x2={xOf(g.x)}
                y1={PY0}
                y2={PY1}
                stroke={g.tint}
                strokeWidth={0.75}
                strokeDasharray="2 3"
                opacity={0.55}
              />
              <text
                x={clamp(xOf(g.x), PX0 + 20, PX1 - 20)}
                y={PY1 + 20 + g.row * 11}
                textAnchor="middle"
                className="fill-mute font-mono"
                style={{ fontSize: 9 }}
              >
                {g.label} {formatUsd(g.x)}
              </text>
            </g>
          ))}

          {/* Settlement marker */}
          <line
            x1={markerX}
            x2={markerX}
            y1={PY0}
            y2={PY1}
            stroke="var(--ink)"
            strokeWidth={1.25}
          />
          <circle cx={markerX} cy={yOf(atSettle.shield)} r={3} fill="var(--shield)" stroke="var(--paper)" strokeWidth={1.5} />
          <circle cx={markerX} cy={yOf(atSettle.shield + atSettle.core)} r={3} fill="var(--core)" stroke="var(--paper)" strokeWidth={1.5} />
          <circle cx={markerX} cy={yOf(sumAtSettle)} r={3.5} fill="var(--edge)" stroke="var(--paper)" strokeWidth={1.5} />
          <text
            x={clamp(markerX, PX0 + 30, PX1 - 30)}
            y={PY0 + 10}
            textAnchor="middle"
            className="fill-ink font-mono"
            style={{ fontSize: 10, fontWeight: 600 }}
          >
            {formatUsd(settlePrice)}
          </text>
        </svg>

        {/* Readout at settlement */}
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {TRANCHES.map((key) => {
            const paid = values[key];
            const worth = atSettle[key];
            const mult = paid > 0 ? worth / paid : 0;
            const win = worth >= paid;
            return (
              <div
                key={key}
                className="border-l-2 pl-3"
                style={{ borderColor: TRANCHE_META[key].colorVar }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[11px] font-semibold tracking-[0.01em]"
                    style={{ color: TRANCHE_META[key].colorVar }}
                  >
                    {TRANCHE_META[key].name}
                  </span>
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      win ? "text-up" : "text-down"
                    }`}
                  >
                    {mult.toFixed(2)}×
                  </span>
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-mute tabular-nums">
                  paid {formatUsd(paid)} → {formatUsd(worth)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 border-t border-rule pt-3 text-center font-mono text-[10px] tracking-[0.01em] text-mute">
          SHIELD {formatUsd(atSettle.shield)} + CORE {formatUsd(atSettle.core)} +
          EDGE {formatUsd(atSettle.edge)} = {formatUsd(sumAtSettle)} · one share,
          conserved
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  raw,
  onChange,
  tint,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  raw: number;
  onChange: (v: number) => void;
  tint: string;
}) {
  return (
    <div className="w-[104px]">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.01em] text-mute">
          {label}
        </span>
        <span
          className="font-mono text-[10px] tabular-nums"
          style={{ color: tint }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={raw}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none bg-rule accent-ink"
        style={{ accentColor: tint }}
      />
    </div>
  );
}

function TrancheCard({
  k,
  value,
  share,
  lines,
}: {
  k: TrancheKey;
  value: number;
  share: number;
  lines: [string, string][];
}) {
  const meta = TRANCHE_META[k];
  return (
    <div className="rounded-xl border border-rule bg-paper p-4">
      <div className="flex items-start justify-between">
        <div>
          <div
            className="font-sans text-lg font-bold tracking-tight"
            style={{ color: meta.colorVar }}
          >
            {meta.name}
          </div>
          <div className="font-mono text-[10px] tracking-[0.01em] text-mute">
            {meta.role}
          </div>
        </div>
        <div className="text-right">
          <div className="font-sans text-lg font-semibold text-ink tabular-nums">
            {formatUsd(value)}
          </div>
          <div className="font-mono text-[10px] text-mute tabular-nums">
            {(share * 100).toFixed(0)}% of share
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 border-t border-rule pt-3">
        {lines.map(([label, val]) => (
          <div key={label} className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[10px] tracking-[0.01em] text-mute">
              {label}
            </span>
            <span className="text-right font-mono text-[11px] text-ink tabular-nums">
              {val}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 font-mono text-[10px] leading-relaxed text-mute">
        {meta.buyer}
      </div>
    </div>
  );
}
