import { NextResponse } from "next/server";
import { fetchMarketQuotes } from "@/lib/market";

export const revalidate = 30;

export async function GET() {
  const data = await fetchMarketQuotes();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
