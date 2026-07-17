"use client";

import { useEffect, useState } from "react";
import { Sparkline } from "./Sparkline";
import { useTheme } from "./ThemeProvider";
import type { MarketQuote } from "@/lib/types";

interface ChartPreviewProps {
  quote?: MarketQuote;
  loading?: boolean;
  height?: number;
}

/**
 * Detail-page chart: DexScreener embed when pair is known,
 * sparkline fallback while loading / offline.
 */
export function ChartPreview({
  quote,
  loading,
  height = 360,
}: ChartPreviewProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pair = quote?.pairAddress;
  const up =
    quote?.change24h == null ? null : quote.change24h >= 0 ? true : false;

  if (!quote?.mint) {
    return (
      <div className="border border-rule bg-haze/40 px-4 py-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
          Chart
        </p>
        <p className="mt-2 text-sm text-mute">
          No mint mapped. Chart unavailable.
        </p>
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="border border-rule bg-paper px-4 py-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
            Preview · 24h shape
          </p>
          {loading && (
            <span className="font-mono text-[10px] text-mute">Loading…</span>
          )}
        </div>
        <div className="flex items-center justify-center py-4">
          <Sparkline
            points={quote.sparkline}
            width={280}
            height={80}
            positive={up}
          />
        </div>
        <p className="text-center font-mono text-[10px] text-mute">
          Approximate path from multi-horizon returns. Pair chart loads when
          liquidity is found.
        </p>
      </div>
    );
  }

  const embedTheme = theme === "dark" ? "dark" : "light";
  const src = `https://dexscreener.com/solana/${pair}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=${embedTheme}&theme=${embedTheme}&chartStyle=1&chartType=usd&interval=15`;

  return (
    <div className="border border-rule bg-paper">
      <div className="flex items-center justify-between border-b border-rule px-4 py-2">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              quote.priceUsd != null ? "live-dot bg-up" : "bg-mute/40"
            }`}
          />
          Chart · DexScreener
        </p>
        {quote.pairUrl && (
          <a
            href={quote.pairUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-mute transition-opacity hover:text-ink"
          >
            Open ↗
          </a>
        )}
      </div>

      {/* Sparkline strip while iframe boots */}
      <div className="flex items-center gap-4 border-b border-rule px-4 py-2 sm:hidden">
        <Sparkline points={quote.sparkline} width={96} height={28} positive={up} />
        <span className="font-mono text-[10px] text-mute">24h shape</span>
      </div>

      <div
        className="relative w-full overflow-hidden bg-haze/30"
        style={{ height }}
      >
        {mounted ? (
          <iframe
            key={`${pair}-${embedTheme}`}
            title={`${quote.ticker} price chart`}
            src={src}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            allow="clipboard-write"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Sparkline
              points={quote.sparkline}
              width={320}
              height={100}
              positive={up}
            />
          </div>
        )}
      </div>
    </div>
  );
}
