import type { Candle, TokensQuote } from "./types";

/**
 * Tokens.xyz Assets API client (server-side only).
 *
 * The API key is a secret: Tokens.xyz's own docs say never ship it in frontend
 * code or a public repo, so this module is imported only from server routes and
 * reads `TOKENS_XYZ_API_KEY` from the environment. When the key is absent the
 * functions return null and callers fall back to the public price feed, so the
 * app works with or without a key.
 *
 * Assets API reference: https://docs.tokens.xyz/v1/quickstart
 */
const BASE = "https://api.tokens.xyz/v1";

export function tokensXyzConfigured(): boolean {
  return Boolean(process.env.TOKENS_XYZ_API_KEY);
}

async function call<T>(path: string): Promise<T | null> {
  const key = process.env.TOKENS_XYZ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "x-api-key": key, Accept: "application/json" },
      // Charts move slowly; cache a few minutes to stay well under rate limits.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface SearchResp {
  results?: { assetId: string; symbol?: string }[];
}
interface OhlcvResp {
  candles?: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }[];
}

/** Resolve a ticker (e.g. "TSLA") to a Tokens.xyz canonical assetId. */
async function resolveAssetId(symbol: string): Promise<string | null> {
  const data = await call<SearchResp>(
    `/assets/search?q=${encodeURIComponent(symbol)}&limit=5`
  );
  const hit =
    data?.results?.find(
      (r) => r.symbol?.toUpperCase() === symbol.toUpperCase()
    ) ?? data?.results?.[0];
  return hit?.assetId ?? null;
}

/**
 * Fetch real OHLCV candles for a stock ticker. Returns null when no key is
 * configured or the asset/candles are unavailable, so callers can fall back.
 */
export async function fetchOhlcv(
  symbol: string,
  interval = "1D"
): Promise<Candle[] | null> {
  if (!tokensXyzConfigured()) return null;
  const assetId = await resolveAssetId(symbol);
  if (!assetId) return null;
  // Widen the window so the chart has enough candles to read well.
  const now = Math.floor(Date.now() / 1000);
  const span =
    interval === "1H" ? 5 * 86400 : interval === "1W" ? 730 * 86400 : 120 * 86400;
  const data = await call<OhlcvResp>(
    `/assets/${encodeURIComponent(assetId)}/ohlcv?interval=${encodeURIComponent(interval)}&from=${now - span}&to=${now}`
  );
  if (!data?.candles?.length) return null;
  return data.candles
    .filter((c) => Number.isFinite(c.close))
    .map((c) => ({
      t: c.time,
      o: c.open,
      h: c.high,
      l: c.low,
      c: c.close,
      v: typeof c.volume === "number" ? c.volume : null,
    }));
}

interface AssetStats {
  price?: number;
  liquidity?: number;
  volume24hUSD?: number;
  marketCap?: number;
  priceChange24hPercent?: number;
}
interface SearchResultFull {
  assetId: string;
  name: string;
  symbol?: string;
  imageUrl?: string;
  stats?: AssetStats;
  canonicalMarket?: { price?: number; priceChange24hPercent?: number };
}

export async function fetchTokensQuote(
  symbol: string
): Promise<TokensQuote | null> {
  if (!tokensXyzConfigured()) return null;
  const data = await call<{ results?: SearchResultFull[] }>(
    `/assets/search?q=${encodeURIComponent(symbol)}&limit=5`
  );
  const hit =
    data?.results?.find(
      (r) => r.symbol?.toUpperCase() === symbol.toUpperCase()
    ) ?? data?.results?.[0];
  if (!hit) return null;
  const s = hit.stats ?? {};

  // The company description lives on the asset detail, not the search result.
  let description: string | null = null;
  const detail = await call<{ asset?: { description?: string } }>(
    `/assets/${encodeURIComponent(hit.assetId)}`
  );
  if (detail?.asset?.description) description = detail.asset.description;

  return {
    symbol: hit.symbol?.toUpperCase() ?? symbol.toUpperCase(),
    name: hit.name,
    tokenPrice: s.price ?? null,
    stockPrice: hit.canonicalMarket?.price ?? null,
    change24h: s.priceChange24hPercent ?? null,
    volume24h: s.volume24hUSD ?? null,
    liquidity: s.liquidity ?? null,
    marketCap: s.marketCap ?? null,
    image: hit.imageUrl ?? null,
    description,
  };
}
