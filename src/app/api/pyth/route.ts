import { NextRequest, NextResponse } from "next/server";
import { fetchPythPrice, pythFeedId } from "@/lib/pyth";

export const runtime = "nodejs";
export const revalidate = 15;

/**
 * Live Pyth price for a stock ticker, the same feed Hanko settles vaults from.
 * Returns `price: null` (not an error) when there is no feed for the ticker.
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }
  const feedId = pythFeedId(symbol);
  if (!feedId) {
    return NextResponse.json({ symbol: symbol.toUpperCase(), price: null });
  }
  const p = await fetchPythPrice(symbol);
  return NextResponse.json(
    p ?? { symbol: symbol.toUpperCase(), feedId, price: null },
    {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    }
  );
}
