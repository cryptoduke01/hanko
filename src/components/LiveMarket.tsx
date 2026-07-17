"use client";

import { formatChange, formatCompact, formatUsd } from "@/lib/market";
import type { MarketQuote } from "@/lib/types";

export function PriceCell({
  quote,
  loading,
}: {
  quote?: MarketQuote;
  loading?: boolean;
}) {
  if (loading && !quote?.priceUsd) {
    return <span className="skeleton inline-block h-3.5 w-14" />;
  }
  if (!quote || quote.priceUsd == null) {
    return <span className="font-mono text-mute">—</span>;
  }
  return (
    <span className="font-mono tabular-nums text-ink">
      {formatUsd(quote.priceUsd)}
    </span>
  );
}

export function ChangeCell({
  quote,
  loading,
}: {
  quote?: MarketQuote;
  loading?: boolean;
}) {
  if (loading && quote?.change24h == null) {
    return <span className="skeleton inline-block h-3.5 w-12" />;
  }
  if (!quote || quote.change24h == null) {
    return <span className="font-mono text-mute">—</span>;
  }
  const up = quote.change24h > 0;
  const flat = quote.change24h === 0;
  return (
    <span
      className={`font-mono tabular-nums ${
        flat ? "text-mute" : up ? "text-up" : "text-down"
      }`}
    >
      {formatChange(quote.change24h)}
    </span>
  );
}

export function MarketStrip({
  quote,
  loading,
  mint,
}: {
  quote?: MarketQuote;
  loading?: boolean;
  mint: string | null;
}) {
  if (!mint) {
    return (
      <div className="border border-rule bg-haze/60 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
          Live market
        </p>
        <p className="mt-1 text-sm text-mute">
          No verified mint mapped for this record yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-rule bg-paper">
      <div className="flex items-center justify-between border-b border-rule px-4 py-2">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              quote?.priceUsd != null ? "live-dot bg-up" : "bg-mute/40"
            }`}
          />
          Live market · DexScreener
        </p>
        {quote?.pairUrl && (
          <a
            href={quote.pairUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-mute transition-opacity hover:text-ink hover:opacity-80"
          >
            Pair ↗
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-4">
        <Metric
          label="Price"
          loading={loading && !quote?.priceUsd}
          value={formatUsd(quote?.priceUsd)}
        />
        <Metric
          label="24h"
          loading={loading && quote?.change24h == null}
          value={formatChange(quote?.change24h)}
          tone={
            quote?.change24h == null
              ? "mute"
              : quote.change24h > 0
                ? "up"
                : quote.change24h < 0
                  ? "down"
                  : "mute"
          }
        />
        <Metric
          label="Vol 24h"
          loading={loading && !quote?.volume24h}
          value={
            quote?.volume24h != null ? `$${formatCompact(quote.volume24h)}` : "—"
          }
        />
        <Metric
          label="Liquidity"
          loading={loading && !quote?.liquidityUsd}
          value={
            quote?.liquidityUsd != null
              ? `$${formatCompact(quote.liquidityUsd)}`
              : "—"
          }
        />
      </div>
      <p className="truncate border-t border-rule px-4 py-2 font-mono text-[10px] text-mute">
        Mint {mint}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  loading,
  tone = "ink",
}: {
  label: string;
  value: string;
  loading?: boolean;
  tone?: "ink" | "mute" | "up" | "down";
}) {
  const toneClass =
    tone === "up"
      ? "text-up"
      : tone === "down"
        ? "text-down"
        : tone === "mute"
          ? "text-mute"
          : "text-ink";
  return (
    <div className="bg-paper px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
        {label}
      </p>
      {loading ? (
        <span className="skeleton mt-1.5 inline-block h-4 w-16" />
      ) : (
        <p className={`mt-1 font-mono text-sm tabular-nums ${toneClass}`}>
          {value}
        </p>
      )}
    </div>
  );
}
