/**
 * Pyth price data (server-side). Hanko settles on-chain from a Pyth pull oracle
 * (`settle_with_oracle`); this reads Pyth's off-chain price so the UI can show
 * the live number a position resolves against.
 *
 * Uses the Pyth Pro / Terminal API (pyth.dourolabs.app) with a Bearer key. It is
 * symbol-based: `Equity.US.{TICKER}/USD` for equities and ETFs (the same regular
 * equity feed the Pyth track highlights). Which symbols return data depends on
 * the plan behind PYTH_API_KEY; unavailable ones return null and the UI still
 * names the feed. Key is server-side only, never exposed.
 */
const PYTH_PRO = "https://pyth.dourolabs.app";

/** The Pyth feed symbol Hanko shows for a stock ticker. */
export function pythSymbol(ticker: string): string {
  return `Equity.US.${ticker.toUpperCase()}/USD`;
}

export interface PythPrice {
  symbol: string;
  feedSymbol: string;
  price: number | null;
  publishTime: number | null;
}

interface UdfHistory {
  s?: string; // "ok" | "no_data" | "error"
  t?: number[];
  c?: number[];
}

/** Latest Pyth price for a stock ticker via the Pro history endpoint (last
 *  close). Returns price null when no key or the plan does not cover the feed. */
export async function fetchPythPrice(ticker: string): Promise<PythPrice | null> {
  const feedSymbol = pythSymbol(ticker);
  const key = process.env.PYTH_API_KEY;
  if (!key) return { symbol: ticker.toUpperCase(), feedSymbol, price: null, publishTime: null };
  try {
    const now = Math.floor(Date.now() / 1000);
    const from = now - 10 * 86400; // small window; we take the most recent close
    const url =
      `${PYTH_PRO}/v1/fixed_rate@1000ms/history` +
      `?symbol=${encodeURIComponent(feedSymbol)}&from=${from}&to=${now}&resolution=1D`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return { symbol: ticker.toUpperCase(), feedSymbol, price: null, publishTime: null };
    const data = (await res.json()) as UdfHistory;
    if (data.s !== "ok" || !data.c?.length || !data.t?.length) {
      return { symbol: ticker.toUpperCase(), feedSymbol, price: null, publishTime: null };
    }
    const i = data.c.length - 1;
    return {
      symbol: ticker.toUpperCase(),
      feedSymbol,
      price: data.c[i] ?? null,
      publishTime: data.t[i] ?? null,
    };
  } catch {
    return { symbol: ticker.toUpperCase(), feedSymbol, price: null, publishTime: null };
  }
}
