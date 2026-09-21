"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMarket } from "@/hooks/useMarket";
import { CandleChart } from "@/components/CandleChart";
import { StockLogo } from "@/components/StockLogo";
import { ArrowUpRight } from "@/components/icons";
import { formatChange, formatCompact, formatUsd } from "@/lib/market";
import type { Candle, ChartResponse, TokensQuote } from "@/lib/types";

interface PythResp {
  symbol: string;
  feedSymbol: string;
  price: number | null;
  publishTime?: number | null;
}

const INTERVALS: { key: string; label: string }[] = [
  { key: "1H", label: "1H" },
  { key: "1D", label: "1D" },
  { key: "1W", label: "1W" },
];

export function StockDetail({
  slug,
  symbol,
  ticker,
  name,
  summary,
  grade,
}: {
  slug: string;
  symbol: string;
  ticker: string;
  name: string;
  summary: string;
  grade: string;
}) {
  const { quotes, live } = useMarket();
  const q = quotes[slug];
  const [interval, setInterval] = useState("1D");
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [source, setSource] = useState<string>("fallback");
  const [loadingChart, setLoadingChart] = useState(true);
  const [quote, setQuote] = useState<TokensQuote | null>(null);
  const [pyth, setPyth] = useState<PythResp | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`/api/pyth?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: PythResp | null) => alive && setPyth(d))
        .catch(() => {});
    load();
    const id = window.setInterval(load, 15_000); // Pyth refreshes ~sub-second; poll gently
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [symbol]);

  useEffect(() => {
    let alive = true;
    setLoadingChart(true);
    fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&interval=${interval}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ChartResponse | null) => {
        if (!alive) return;
        setCandles(d?.candles ?? null);
        setSource(d?.source ?? "fallback");
        setQuote(d?.quote ?? null);
      })
      .catch(() => alive && setCandles(null))
      .finally(() => alive && setLoadingChart(false));
    return () => {
      alive = false;
    };
  }, [symbol, interval]);

  // Prefer Tokens.xyz (real market data) when a key is set; else DexScreener.
  const price = quote?.tokenPrice ?? q?.priceUsd ?? null;
  const change = quote?.change24h ?? q?.change24h ?? null;
  const up = (change ?? 0) >= 0;
  const stockPrice = quote?.stockPrice ?? null;
  const vol = quote?.volume24h ?? q?.volume24h ?? null;
  const liq = quote?.liquidity ?? q?.liquidityUsd ?? null;
  const mcap = quote?.marketCap ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <StockLogo symbol={symbol} size={40} />
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-[-0.02em] text-ink">
              {name}
            </h1>
            <div className="text-[12px] tracking-[0.01em] text-mute">
              {ticker} · tokenized on Solana
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-ink tabular-nums">
            {formatUsd(price)}
          </div>
          <div
            className="text-[13px] font-medium tabular-nums"
            style={{ color: change == null ? "var(--mute)" : up ? "var(--up)" : "var(--down)" }}
          >
            {formatChange(change)} · 24h
          </div>
          {stockPrice != null && (
            <div className="mt-0.5 text-[11px] text-mute tabular-nums">
              underlying stock {formatUsd(stockPrice)}
            </div>
          )}
        </div>
      </div>

      {/* Pyth: the oracle Hanko settles from on-chain */}
      {pyth && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rule bg-haze/40 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-6 items-center rounded-md bg-ink px-2 text-[10px] font-semibold tracking-[0.02em] text-paper">
              Pyth
            </span>
            <span className="text-[12px] leading-snug text-mute">
              {pyth.price != null ? (
                <>
                  Live oracle price ·{" "}
                  <span className="text-ink">{pyth.feedSymbol}</span>. Hanko settles
                  vaults on-chain from Pyth.
                </>
              ) : (
                <>
                  Hanko settles vaults on-chain from Pyth ·{" "}
                  <span className="text-ink">{pyth.feedSymbol}</span>.
                </>
              )}
            </span>
          </div>
          {pyth.price != null && (
            <div className="text-lg font-semibold text-ink tabular-nums">
              {formatUsd(pyth.price)}
            </div>
          )}
        </div>
      )}

      {/* chart */}
      <div className="rounded-2xl border border-rule bg-paper p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-mute">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: live ? "var(--up)" : "var(--mute)" }}
            />
            {source === "tokens.xyz"
              ? "Candles via Tokens.xyz"
              : "Indicative, connect a Tokens.xyz key for full candles"}
          </div>
          <div className="inline-flex rounded-lg border border-rule p-0.5">
            {INTERVALS.map((iv) => (
              <button
                key={iv.key}
                type="button"
                onClick={() => setInterval(iv.key)}
                aria-pressed={interval === iv.key}
                className={`press rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  interval === iv.key ? "bg-ink text-paper" : "text-mute hover:text-ink"
                }`}
              >
                {iv.label}
              </button>
            ))}
          </div>
        </div>
        {loadingChart ? (
          <div className="skeleton h-[260px] w-full rounded-lg" />
        ) : (
          <CandleChart candles={candles} line={q?.sparkline ?? null} height={260} />
        )}
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Price" value={formatUsd(price)} />
        <Stat label="24h change" value={formatChange(change)} tint={change == null ? undefined : up ? "var(--up)" : "var(--down)"} />
        <Stat label="24h volume" value={vol != null ? `$${formatCompact(vol)}` : "-"} />
        <Stat
          label={mcap != null ? "Market cap" : "Liquidity"}
          value={
            mcap != null
              ? `$${formatCompact(mcap)}`
              : liq != null
                ? `$${formatCompact(liq)}`
                : "-"
          }
        />
      </div>

      {/* what you hold + refract CTA */}
      <div className="rounded-2xl border border-rule p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-rule px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.02em] text-mute">
            Grade {grade}
          </span>
          <span className="text-[11px] tracking-[0.01em] text-mute">What you hold</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-mute">{summary}</p>
        <Link
          href="/refract"
          className="press mt-4 inline-flex items-center gap-1.5 rounded-lg border border-ink bg-ink px-4 py-2.5 text-[12px] font-semibold tracking-[0.01em] text-paper transition-opacity hover:opacity-90"
        >
          Refract {ticker} into Shield, Core, Edge
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint?: string;
}) {
  return (
    <div className="rounded-xl border border-rule p-3">
      <div className="text-[10px] font-semibold tracking-[0.01em] text-mute">
        {label}
      </div>
      <div
        className="mt-1 text-lg font-semibold tabular-nums"
        style={{ color: tint ?? "var(--ink)" }}
      >
        {value}
      </div>
    </div>
  );
}
