"use client";

import Link from "next/link";
import { useMarket } from "@/hooks/useMarket";
import { StockLogo } from "@/components/StockLogo";
import { ArrowRight } from "@/components/icons";
import { assets } from "@/lib/assets";
import { formatChange, formatCompact, formatUsd } from "@/lib/market";

/** Tradeable tokenized stocks: those with a mint and a real ticker symbol. */
const CATALOG = assets
  .filter((a) => a.mint && /\(([A-Z.]{1,6})\)/.test(a.underlying))
  .map((a) => {
    const symbol = a.underlying.match(/\(([A-Z.]{1,6})\)/)![1];
    const name = a.underlying.replace(/\s*\(.*\)\s*/, "").trim();
    return { slug: a.slug, ticker: a.ticker, symbol, name };
  });

function Sparkline({ points, positive }: { points: number[] | null; positive: boolean }) {
  if (!points || points.length < 2) return <div className="h-5 w-16" />;
  const w = 64;
  const h = 20;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={positive ? "var(--up)" : "var(--down)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StockCatalog() {
  const { quotes, loading } = useMarket();

  return (
    <div className="overflow-hidden rounded-2xl border border-rule">
      <div className="hidden items-center gap-4 border-b border-rule px-4 py-2.5 text-[10px] tracking-[0.01em] text-mute sm:flex">
        <span className="flex-1">Stock</span>
        <span className="hidden w-16 text-right md:inline">Trend</span>
        <span className="hidden w-20 text-right lg:inline">24h vol</span>
        <span className="w-24 text-right">Price</span>
        <span className="w-16 text-right">24h</span>
        <span className="w-20 text-right" />
      </div>

      <ul className="divide-y divide-rule">
        {CATALOG.map((row) => {
          const q = quotes[row.slug];
          const price = q?.priceUsd ?? null;
          const change = q?.change24h ?? null;
          const vol = q?.volume24h ?? null;
          return (
            <li key={row.slug}>
              <Link
                href={`/assets/${row.slug}`}
                className="group flex items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-haze focus-visible:bg-haze focus-visible:outline-none"
              >
                <StockLogo symbol={row.symbol} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink">{row.ticker}</div>
                  <div className="truncate text-xs text-mute">{row.name}</div>
                </div>

                <div className="hidden w-16 justify-end md:flex">
                  <Sparkline points={q?.sparkline ?? null} positive={(change ?? 0) >= 0} />
                </div>

                <div className="hidden w-20 text-right text-xs text-mute tabular-nums lg:block">
                  {vol == null ? (loading ? "" : "") : `$${formatCompact(vol)}`}
                </div>

                <div className="w-24 text-right text-sm text-ink tabular-nums">
                  {price === null ? (
                    loading ? (
                      <span className="skeleton inline-block h-4 w-14 align-middle" />
                    ) : (
                      <span className="text-mute">n/a</span>
                    )
                  ) : (
                    formatUsd(price)
                  )}
                </div>

                <div
                  className={`w-16 text-right text-xs tabular-nums ${
                    change == null ? "text-mute" : change >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {change == null ? "" : formatChange(change)}
                </div>

                <span className="hidden w-20 items-center justify-end gap-1.5 text-[11px] tracking-[0.01em] text-mute transition-colors duration-150 group-hover:text-ink sm:inline-flex">
                  View
                  <ArrowRight size={12} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
