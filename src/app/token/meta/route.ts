import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-stock token metadata JSON for wallets. `?s=<symbol>&p=<share|shield|core|edge>`.
 * The image is the stock logo with the tranche badge, so each Hanko token shows
 * its underlying stock and which part it is. On-chain name/symbol are authoritative;
 * these mirror them and, crucially, carry the per-stock `image`.
 */
export const revalidate = 86400;

const PART = {
  share: { suffix: "Share", tick: (s: string) => `h${s}`, blurb: "one whole tokenized share, fully backed and recombinable." },
  shield: { suffix: "Shield", tick: (s: string) => `${s}-S`, blurb: "the senior, safety part of a tokenized share." },
  core: { suffix: "Core", tick: (s: string) => `${s}-C`, blurb: "the mezzanine, exposure part of a tokenized share." },
  edge: { suffix: "Edge", tick: (s: string) => `${s}-E`, blurb: "the junior, upside part of a tokenized share." },
} as const;

type PartKey = keyof typeof PART;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const symbol = (sp.get("s") ?? "").trim().toUpperCase().slice(0, 6);
  const partRaw = (sp.get("p") ?? "share").trim().toLowerCase();
  const part = (partRaw in PART ? partRaw : "share") as PartKey;

  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const meta = PART[part];
  const image = `${req.nextUrl.origin}/token/img?s=${encodeURIComponent(symbol)}&p=${part}`;

  return NextResponse.json(
    {
      name: `Hanko ${symbol} ${meta.suffix}`,
      symbol: meta.tick(symbol),
      description: `Hanko ${symbol} ${meta.suffix}: ${meta.blurb} Three parts always recombine into one share.`,
      image,
      external_url: "https://hankolabs.xyz",
      properties: {
        category: "image",
        files: [{ uri: image, type: "image/png" }],
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
