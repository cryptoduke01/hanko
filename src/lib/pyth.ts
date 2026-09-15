/**
 * Pyth price data (server-side). Hanko settles on-chain from a Pyth pull oracle
 * (`settle_with_oracle`); this reads the SAME feeds off-chain via Hermes so the
 * UI can show the live price a position will resolve against.
 *
 * Feeds are the tokenized-stock (xStock) prices, `Crypto.{TICKER}X/USD`. Ids
 * resolved from Hermes `/v2/price_feeds`; kept as a static map so a page render
 * is a single price fetch.
 */
const HERMES = "https://hermes.pyth.network";

/** Base ticker -> Pyth xStock feed id (Crypto.{TICKER}X/USD). */
export const PYTH_FEEDS: Record<string, string> = {
  TSLA: "47a156470288850a440df3a6ce85a55917b813a19bb5b31128a33a986566a362",
  NVDA: "4244d07890e4610f46bbde67de8f43a4bf8b569eebe904f136b469f148503b7f",
  SPY: "2817b78438c769357182c04346fddaad1178c82f4048828fe0997c3c64624e14",
  MSTR: "53f95ba4e23ed15ea56083e2ee9a5eec48055d6f59033d4bb95f1ca2a2349c28",
  COIN: "641435d5dffb5311140b480517c79986d8488d5cf08a11eec53b83ad02cab33f",
  GOOGL: "b911b0329028cd0283e4259c33809d62942bd2716a58084e5f31d64c00b5424e",
  AMZN: "7148fbe6e493ff2580305c92a8d7f8628c9943b11b9b253aebc24863fec290e8",
  MSFT: "bb723a70af731ab56b9a650eb7e8ac22b7bc07ea77f8670bd1fa9a37bf6df3f5",
  META: "bf3e5871be3f80ab7a4d1f1fd039145179fb58569e159aee1ccd472868ea5900",
  HOOD: "dd49a9ac6df5cbfa9d8fc6371f7ae927a74d5c6763c1c01b4220d70314c647f9",
  CRCL: "c13184461c0c80d98ffcd89be627c2220b94a96c7c67f0c4b16bc12fd3b17758",
  GLD: "e7d1138d0083368634087268c64b7bea0b4101a6365f83915cba9e76a8364b96",
  QQQ: "178a6f73a5aede9d0d682e86b0047c9f333ed0efe5c6537ca937565219c4054d",
};

export interface PythPrice {
  symbol: string;
  feedId: string;
  price: number;
  /** 1-sigma confidence interval, in price units. */
  conf: number;
  publishTime: number;
}

export function pythFeedId(symbol: string): string | null {
  return PYTH_FEEDS[symbol.toUpperCase()] ?? null;
}

interface HermesParsed {
  parsed?: {
    id: string;
    price: { price: string; conf: string; expo: number; publish_time: number };
  }[];
}

/** Latest Pyth price for a Hanko ticker, or null when there is no feed / it is
 *  unavailable. Price and conf are scaled by the feed's exponent. */
export async function fetchPythPrice(symbol: string): Promise<PythPrice | null> {
  const feedId = pythFeedId(symbol);
  if (!feedId) return null;
  try {
    const res = await fetch(
      `${HERMES}/v2/updates/price/latest?ids[]=${feedId}`,
      { next: { revalidate: 15 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as HermesParsed;
    const p = data.parsed?.[0]?.price;
    if (!p) return null;
    const scale = 10 ** p.expo;
    return {
      symbol: symbol.toUpperCase(),
      feedId,
      price: Number(p.price) * scale,
      conf: Number(p.conf) * scale,
      publishTime: p.publish_time,
    };
  } catch {
    return null;
  }
}
