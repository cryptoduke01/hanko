import { NextRequest, NextResponse } from "next/server";
import { fetchOhlcv, tokensXyzConfigured } from "@/lib/tokens";
import type { ChartResponse } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 300;

/**
 * Real OHLCV candles for a stock ticker, from Tokens.xyz when a key is set.
 * Returns `candles: null` (not an error) when unconfigured, so the client can
 * fall back to the coarse price line it already has from the market feed.
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
  const interval = req.nextUrl.searchParams.get("interval")?.trim() || "1D";
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const candles = await fetchOhlcv(symbol, interval);
  const body: ChartResponse = {
    symbol: symbol.toUpperCase(),
    interval,
    candles,
    line: null,
    source: candles ? "tokens.xyz" : tokensXyzConfigured() ? "unavailable" : "fallback",
    fetchedAt: new Date().toISOString(),
  };
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
