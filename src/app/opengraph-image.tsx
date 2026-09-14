import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Hanko, split a stock into three parts";

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
          padding: "90px",
          background: "#0b0b0b",
          color: "#f2f2f2",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 7,
            textTransform: "uppercase",
            color: "#8a8a8a",
          }}
        >
          Hanko
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.02,
            marginTop: 28,
            letterSpacing: -3,
          }}
        >
          One share.
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: -3,
            color: "#8a8a8a",
          }}
        >
          Three tradeable parts.
        </div>
        <div
          style={{
            display: "flex",
            height: 14,
            width: 380,
            marginTop: 52,
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flex: 0.5, background: "#6d9bff" }} />
          <div style={{ display: "flex", flex: 0.3, background: "#2dd4bf" }} />
          <div style={{ display: "flex", flex: 0.2, background: "#fb923c" }} />
        </div>
        <div style={{ fontSize: 24, color: "#8a8a8a", marginTop: 44 }}>
          hankolabs.xyz
        </div>
      </div>
    ),
    { ...size }
  );
}
