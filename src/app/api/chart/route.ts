import { NextRequest, NextResponse } from "next/server";
import { fetchOhlcv, fetchTokensQuote, tokensXyzConfigured } from "@/lib/tokens";
import type { ChartResponse } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 300;

/**
 * Real OHLCV candles + a rich quote (token price and underlying stock price) for
 * a ticker, from Tokens.xyz when a key is set. Returns `candles: null` (not an
 * error) when unconfigured, so the client can fall back to its coarse line.
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
  const interval = req.nextUrl.searchParams.get("interval")?.trim() || "1D";
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const [candles, quote] = await Promise.all([
    fetchOhlcv(symbol, interval),
    fetchTokensQuote(symbol),
  ]);
  const body: ChartResponse = {
    symbol: symbol.toUpperCase(),
    interval,
    candles,
    line: null,
    quote,
    source: candles ? "tokens.xyz" : tokensXyzConfigured() ? "unavailable" : "fallback",
    fetchedAt: new Date().toISOString(),
  };
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
