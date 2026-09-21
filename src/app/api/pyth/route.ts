import { NextRequest, NextResponse } from "next/server";
import { fetchPythPrice } from "@/lib/pyth";

export const runtime = "nodejs";
export const revalidate = 30;

/**
 * Live Pyth price for a stock ticker (Pyth Pro equity feed). Always returns the
 * feed symbol; `price` is null when no key is set or the plan does not cover it,
 * so the UI still names the Pyth feed Hanko settles from.
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }
  const p = await fetchPythPrice(symbol);
  return NextResponse.json(p, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
