import { getTrackedMints } from "./assets";
import type { MarketQuote, MarketResponse } from "./types";

interface DexPair {
  chainId?: string;
  url?: string;
  pairAddress?: string;
  priceUsd?: string;
  priceChange?: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  baseToken?: { address?: string; symbol?: string };
}

function emptyQuote(
  t: { mint: string; ticker: string },
  fetchedAt: string
): MarketQuote {
  return {
    mint: t.mint,
    ticker: t.ticker,
    priceUsd: null,
    change24h: null,
    change6h: null,
    change1h: null,
    change5m: null,
    volume24h: null,
    liquidityUsd: null,
    pairAddress: null,
    pairUrl: null,
    sparkline: null,
    updatedAt: fetchedAt,
  };
}

/**
 * Rebuild approximate sparkline from multi-horizon % changes.
 * Points: ~24h ago, ~6h, ~1h, ~5m, now. Good enough for preview, not OHLC.
 */
export function buildSparkline(
  price: number,
  change: { m5?: number | null; h1?: number | null; h6?: number | null; h24?: number | null }
): number[] | null {
  if (!price || price <= 0) return null;

  const past = (pct: number | null | undefined) => {
    if (pct == null || Number.isNaN(pct)) return null;
    const factor = 1 + pct / 100;
    if (factor <= 0) return null;
    return price / factor;
  };

  const p24 = past(change.h24);
  const p6 = past(change.h6);
  const p1 = past(change.h1);
  const p5 = past(change.m5);

  const pts = [p24, p6, p1, p5, price].filter(
    (n): n is number => typeof n === "number" && Number.isFinite(n)
  );

  return pts.length >= 2 ? pts : null;
}

async function fetchMintBatch(mints: string[]): Promise<DexPair[]> {
  if (mints.length === 0) return [];
  const url = `https://api.dexscreener.com/tokens/v1/solana/${mints.join(",")}`;
  const res = await fetch(url, {
    next: { revalidate: 30 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? (data as DexPair[]) : [];
}

/**
 * Live market quotes from DexScreener (public, no API key).
 * Batches mints; picks highest-liquidity Solana pair per mint.
 */
export async function fetchMarketQuotes(): Promise<MarketResponse> {
  const tracked = getTrackedMints();
  const quotes: Record<string, MarketQuote> = {};
  const fetchedAt = new Date().toISOString();

  for (const t of tracked) {
    quotes[t.slug] = emptyQuote(t, fetchedAt);
  }

  if (tracked.length === 0) {
    return { quotes, fetchedAt, source: "dexscreener", count: 0 };
  }

  try {
    const BATCH = 25;
    const mintToSlug = new Map(tracked.map((t) => [t.mint, t]));
    const allPairs: DexPair[] = [];

    for (let i = 0; i < tracked.length; i += BATCH) {
      const batch = tracked.slice(i, i + BATCH).map((t) => t.mint);
      const pairs = await fetchMintBatch(batch);
      allPairs.push(...pairs);
    }

    const bestByMint = new Map<string, DexPair>();
    for (const pair of allPairs) {
      const mint = pair.baseToken?.address;
      if (!mint || pair.chainId !== "solana") continue;
      const liq = pair.liquidity?.usd ?? 0;
      const prev = bestByMint.get(mint);
      const prevLiq = prev?.liquidity?.usd ?? -1;
      if (!prev || liq > prevLiq) bestByMint.set(mint, pair);
    }

    for (const [mint, pair] of bestByMint) {
      const t = mintToSlug.get(mint);
      if (!t) continue;
      const priceUsd = pair.priceUsd ? Number(pair.priceUsd) : null;
      const change24h =
        typeof pair.priceChange?.h24 === "number" ? pair.priceChange.h24 : null;
      const change6h =
        typeof pair.priceChange?.h6 === "number" ? pair.priceChange.h6 : null;
      const change1h =
        typeof pair.priceChange?.h1 === "number" ? pair.priceChange.h1 : null;
      const change5m =
        typeof pair.priceChange?.m5 === "number" ? pair.priceChange.m5 : null;

      quotes[t.slug] = {
        mint,
        ticker: t.ticker,
        priceUsd,
        change24h,
        change6h,
        change1h,
        change5m,
        volume24h:
          typeof pair.volume?.h24 === "number" ? pair.volume.h24 : null,
        liquidityUsd:
          typeof pair.liquidity?.usd === "number" ? pair.liquidity.usd : null,
        pairAddress: pair.pairAddress ?? null,
        pairUrl: pair.url ?? null,
        sparkline:
          priceUsd != null
            ? buildSparkline(priceUsd, {
                m5: change5m,
                h1: change1h,
                h6: change6h,
                h24: change24h,
              })
            : null,
        updatedAt: fetchedAt,
      };
    }
  } catch {
    // degrade gracefully
  }

  const liveCount = Object.values(quotes).filter(
    (q) => q.priceUsd != null
  ).length;

  return { quotes, fetchedAt, source: "dexscreener", count: liveCount };
}

export function formatUsd(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(n);
  }
  if (n >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 4,
  }).format(n);
}

export function formatCompact(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatChange(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}
