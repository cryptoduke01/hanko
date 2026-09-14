import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Hanko, trade a stock as three tokens";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(1100px 520px at 50% 118%, rgba(109,155,255,0.30), rgba(45,212,191,0.16) 46%, rgba(251,146,60,0.22) 72%, rgba(10,10,10,0) 100%)",
          color: "#f2f2f2",
          fontFamily: "sans-serif",
        }}
      >
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 30,
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.0, letterSpacing: -4 }}>
            Trade a stock
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: -4,
              color: "#8a8a8a",
            }}
          >
            as three tokens.
          </div>
        </div>
        <div style={{ fontSize: 30, color: "#b5b5b5", marginTop: 34, maxWidth: 760 }}>
          One share becomes a safe part, a balanced part, and an upside part.
        </div>
        <div
          style={{
            display: "flex",
            height: 14,
            width: 420,
            marginTop: 46,
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flex: 0.5, backgroundColor: "#6d9bff" }} />
          <div style={{ display: "flex", flex: 0.3, backgroundColor: "#2dd4bf" }} />
          <div style={{ display: "flex", flex: 0.2, backgroundColor: "#fb923c" }} />
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 24, color: "#8a8a8a" }}>
          hankolabs.xyz
        </div>
      </div>
    ),
    { ...size }
  );
}
