import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

/**
 * Token icon for wallets: the underlying stock's logo with a small tranche badge
 * (S / C / E) in the tranche colour, so a Hanko token reads as "Tesla, Shield"
 * in Phantom instead of a generic mark. `?s=<symbol>&p=<share|shield|core|edge>`.
 * The whole share shows the plain logo; the three parts add the coloured badge.
 */
export const contentType = "image/png";

const SIZE = 512;

const PART = {
  shield: { letter: "S", color: "#2f57d4" },
  core: { letter: "C", color: "#0e8f86" },
  edge: { letter: "E", color: "#c2410c" },
} as const;

type PartKey = keyof typeof PART;

/** Fetch the stock logo and inline it as a data URI (Satori needs the bytes). */
async function logoDataUri(symbol: string): Promise<string | null> {
  const sym = symbol.toUpperCase();
  const urls = [
    `https://api.tokens.xyz/logos/xstocks/${sym}x.png`,
    `https://assets.parqet.com/logos/symbol/${symbol}?format=png&size=256`,
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!r.ok) continue;
      const type = r.headers.get("content-type") ?? "image/png";
      if (!type.startsWith("image/")) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 64) continue;
      return `data:${type};base64,${buf.toString("base64")}`;
    } catch {
      /* try the next source */
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const symbol = (sp.get("s") ?? "").trim();
  const partRaw = (sp.get("p") ?? "share").trim().toLowerCase();
  const part = (partRaw in PART ? partRaw : null) as PartKey | null;

  const logo = symbol ? await logoDataUri(symbol) : null;
  const letter = (symbol.charAt(0) || "?").toUpperCase();
  const badge = part ? PART[part] : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          position: "relative",
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            width={384}
            height={384}
            style={{ objectFit: "contain", borderRadius: 64 }}
            alt=""
          />
        ) : (
          <div
            style={{
              width: 384,
              height: 384,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 96,
              background: "#0a0a0a",
              color: "#fafafa",
              fontSize: 220,
              fontWeight: 700,
            }}
          >
            {letter}
          </div>
        )}

        {badge && (
          <div
            style={{
              position: "absolute",
              left: 288,
              top: 288,
              width: 150,
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 150,
              background: badge.color,
              color: "#ffffff",
              fontSize: 92,
              fontWeight: 700,
              border: "10px solid #fafafa",
            }}
          >
            {badge.letter}
          </div>
        )}
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    },
  );
}
