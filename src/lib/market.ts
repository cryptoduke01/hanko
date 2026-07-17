import { getTrackedMints } from "./assets";
import type { MarketQuote, MarketResponse } from "./types";

interface DexPair {
  chainId?: string;
  url?: string;
  priceUsd?: string;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  baseToken?: { address?: string; symbol?: string };
}

/**
 * Live market quotes from DexScreener (public, no API key).
 * Picks the highest-liquidity Solana pair per mint.
 */
export async function fetchMarketQuotes(): Promise<MarketResponse> {
  const tracked = getTrackedMints();
  const quotes: Record<string, MarketQuote> = {};
  const fetchedAt = new Date().toISOString();

  // Seed empty quotes so UI always has keys
  for (const t of tracked) {
    quotes[t.slug] = {
      mint: t.mint,
      ticker: t.ticker,
      priceUsd: null,
      change24h: null,
      volume24h: null,
      liquidityUsd: null,
      pairUrl: null,
      updatedAt: fetchedAt,
    };
  }

  if (tracked.length === 0) {
    return { quotes, fetchedAt, source: "dexscreener" };
  }

  // DexScreener allows comma-separated token addresses
  const mints = tracked.map((t) => t.mint).join(",");
  const url = `https://api.dexscreener.com/tokens/v1/solana/${mints}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 30 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return { quotes, fetchedAt, source: "dexscreener" };
    }

    const pairs = (await res.json()) as DexPair[];
    if (!Array.isArray(pairs)) {
      return { quotes, fetchedAt, source: "dexscreener" };
    }

    // Best pair per mint (highest liquidity)
    const bestByMint = new Map<string, DexPair>();
    for (const pair of pairs) {
      const mint = pair.baseToken?.address;
      if (!mint || pair.chainId !== "solana") continue;
      const liq = pair.liquidity?.usd ?? 0;
      const prev = bestByMint.get(mint);
      const prevLiq = prev?.liquidity?.usd ?? -1;
      if (!prev || liq > prevLiq) bestByMint.set(mint, pair);
    }

    for (const t of tracked) {
      const pair = bestByMint.get(t.mint);
      if (!pair) continue;
      quotes[t.slug] = {
        mint: t.mint,
        ticker: t.ticker,
        priceUsd: pair.priceUsd ? Number(pair.priceUsd) : null,
        change24h:
          typeof pair.priceChange?.h24 === "number"
            ? pair.priceChange.h24
            : null,
        volume24h:
          typeof pair.volume?.h24 === "number" ? pair.volume.h24 : null,
        liquidityUsd:
          typeof pair.liquidity?.usd === "number" ? pair.liquidity.usd : null,
        pairUrl: pair.url ?? null,
        updatedAt: fetchedAt,
      };
    }
  } catch {
    // Return empty quotes on network failure; UI degrades gracefully
  }

  return { quotes, fetchedAt, source: "dexscreener" };
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
