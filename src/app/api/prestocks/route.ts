import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 60;

/**
 * Live pre-IPO tokens from PreStocks (server-side proxy, so no CORS and one
 * cached upstream call). PreStocks issues SPL tokens backed 1:1 by SPV exposure
 * to private companies; Hanko refracts them the same way it refracts any share.
 * Source: https://prestocks.com/api/prestocks
 */
interface PreStockRaw {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  external_url?: string;
  contract_address: string;
  markPrice?: number;
  markValuation?: number;
  tokenPrice?: number;
  impliedValuation?: number;
  supply?: number;
}

export interface PreStock {
  name: string;
  symbol: string;
  mint: string;
  price: number | null;
  valuation: number | null;
  image: string | null;
  url: string | null;
  description: string | null;
  supply: number | null;
}

export async function GET() {
  try {
    const res = await fetch("https://prestocks.com/api/prestocks", {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`PreStocks ${res.status}`);
    const raw = (await res.json()) as PreStockRaw[];
    const tokens: PreStock[] = (Array.isArray(raw) ? raw : []).map((t) => ({
      name: t.name,
      symbol: t.symbol,
      mint: t.contract_address,
      price: typeof t.tokenPrice === "number" ? t.tokenPrice : t.markPrice ?? null,
      valuation:
        typeof t.impliedValuation === "number"
          ? t.impliedValuation
          : t.markValuation ?? null,
      image: t.image ?? null,
      url: t.external_url ?? null,
      description: t.description ?? null,
      supply: typeof t.supply === "number" ? t.supply : null,
    }));
    return NextResponse.json(
      { tokens, source: "prestocks", fetchedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (e) {
    return NextResponse.json(
      { tokens: [], error: e instanceof Error ? e.message : "PreStocks unavailable" },
      { status: 200 }
    );
  }
}
