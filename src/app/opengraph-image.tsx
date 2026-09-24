import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Hanko, trade a stock as three tokens";

/** Fetch a subset of a Google font as raw bytes for next/og. Satori has only a
 *  built-in Latin fallback, so the brand faces (Inter Tight, and Noto Serif JP
 *  for the seal glyph) have to be supplied. An unrecognised User-Agent makes
 *  Google serve TTF; we reject woff2, which Satori cannot parse, and return null
 *  on any failure so the card degrades to the default font instead of breaking. */
async function loadGoogleFont(
  family: string,
  weight: number,
  text: string,
): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "HankoOG/1.0" } },
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const src = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!src) return null;
    const fontRes = await fetch(src);
    if (!fontRes.ok) return null;
    const buf = await fontRes.arrayBuffer();
    const s = new Uint8Array(buf.slice(0, 4));
    if (s[0] === 0x77 && s[1] === 0x4f && s[2] === 0x46 && s[3] === 0x32) return null; // "wOF2"
    return buf;
  } catch {
    return null;
  }
}

const TEXT =
  "Trade a stock as three tokens. One share becomes a safe part, a balanced part, and an upside part. HANKO hankolabs.xyz";

type Font = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 700 | 800;
  style: "normal";
};

export default async function OpengraphImage() {
  const [seal, w400, w600, w800] = await Promise.all([
    loadGoogleFont("Noto+Serif+JP", 700, "判"),
    loadGoogleFont("Inter+Tight", 400, TEXT),
    loadGoogleFont("Inter+Tight", 600, TEXT),
    loadGoogleFont("Inter+Tight", 800, TEXT),
  ]);

  const fonts: Font[] = [];
  if (seal) fonts.push({ name: "Seal", data: seal, weight: 700, style: "normal" });
  if (w400) fonts.push({ name: "Inter Tight", data: w400, weight: 400, style: "normal" });
  if (w600) fonts.push({ name: "Inter Tight", data: w600, weight: 600, style: "normal" });
  if (w800) fonts.push({ name: "Inter Tight", data: w800, weight: 800, style: "normal" });

  const family = w400 || w600 || w800 ? "'Inter Tight', sans-serif" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px",
          backgroundColor: "#fafafa",
          color: "#0a0a0a",
          fontFamily: family,
        }}
      >
        {/* Seal + wordmark lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {seal ? (
            <div
              style={{
                position: "relative",
                display: "flex",
                width: 62,
                height: 62,
                borderRadius: 15,
                backgroundColor: "#c8402f",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 9,
                  left: 9,
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: "2.5px solid rgba(251,245,240,0.92)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontFamily: "Seal",
                  fontSize: 44,
                  lineHeight: 1,
                  color: "#fbf5f0",
                }}
              >
                判
              </div>
            </div>
          ) : null}
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#8a8a8a",
            }}
          >
            Hanko
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 28 }}>
          <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.06, letterSpacing: -3 }}>
            Trade a stock
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: -3,
              color: "#9a9a9a",
            }}
          >
            as three tokens.
          </div>
        </div>

        {/* Description (explicit width so wrapping height is measured correctly) */}
        <div
          style={{
            display: "flex",
            width: 720,
            marginTop: 26,
            fontSize: 27,
            fontWeight: 400,
            lineHeight: 1.4,
            color: "#5a5a5a",
          }}
        >
          One share becomes a safe part, a balanced part, and an upside part.
        </div>

        {/* Spectrum */}
        <div
          style={{
            display: "flex",
            height: 14,
            width: 420,
            marginTop: 40,
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flex: 0.5, backgroundColor: "#2f57d4" }} />
          <div style={{ display: "flex", flex: 0.3, backgroundColor: "#0e8f86" }} />
          <div style={{ display: "flex", flex: 0.2, backgroundColor: "#c2410c" }} />
        </div>

        <div
          style={{ display: "flex", marginTop: 30, fontSize: 24, fontWeight: 400, color: "#9a9a9a" }}
        >
          hankolabs.xyz
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
