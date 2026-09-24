import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Hanko, trade a stock as three tokens";

/** Load a one-glyph (判) subset of Noto Serif JP for the seal. next/og cannot
 *  render CJK from its built-in Latin font, so we fetch a subset and pass it in.
 *  An unrecognised User-Agent makes Google Fonts serve TTF (Satori cannot parse
 *  woff2, which we reject). On any failure we return null and draw no seal, so
 *  the card never shows an empty square. */
async function loadSealGlyph(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&text=%E5%88%A4",
      { headers: { "User-Agent": "HankoOG/1.0" } },
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) return null;
    const fontRes = await fetch(url);
    if (!fontRes.ok) return null;
    const buf = await fontRes.arrayBuffer();
    const s = new Uint8Array(buf.slice(0, 4));
    // reject woff2 ("wOF2"), which Satori cannot parse
    if (s[0] === 0x77 && s[1] === 0x4f && s[2] === 0x46 && s[3] === 0x32) return null;
    return buf;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const glyph = await loadSealGlyph();
  const fonts = glyph
    ? [{ name: "Seal", data: glyph, weight: 700 as const, style: "normal" as const }]
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(1100px 520px at 50% 118%, rgba(109,155,255,0.30), rgba(45,212,191,0.16) 46%, rgba(251,146,60,0.22) 72%, rgba(10,10,10,0) 100%)",
          color: "#f2f2f2",
          fontFamily: "sans-serif",
        }}
      >
        {/* Seal + wordmark lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {glyph ? (
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
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#9a9a9a",
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
              color: "#8a8a8a",
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
            lineHeight: 1.4,
            color: "#b5b5b5",
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
          <div style={{ display: "flex", flex: 0.5, backgroundColor: "#6d9bff" }} />
          <div style={{ display: "flex", flex: 0.3, backgroundColor: "#2dd4bf" }} />
          <div style={{ display: "flex", flex: 0.2, backgroundColor: "#fb923c" }} />
        </div>

        <div style={{ display: "flex", marginTop: 30, fontSize: 24, color: "#8a8a8a" }}>
          hankolabs.xyz
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
