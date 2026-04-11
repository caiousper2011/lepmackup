import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "L&PMakeUp — Maquiagem profissional a partir de R$ 6,99";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fce7f3 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: 64,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 999,
              background: "linear-gradient(135deg, #f43f5e, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            L&P
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              background: "linear-gradient(90deg, #e11d48, #db2777)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            L&PMakeUp
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#111827",
            lineHeight: 1.05,
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Maquiagem Profissional</span>
          <span style={{ color: "#e11d48" }}>a partir de R$ 6,99</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#4b5563",
            marginBottom: 32,
          }}
        >
          Cílios, delineadores, gloss, paletas e mais — tudo por R$ 7,99
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              background: "#fff",
              color: "#e11d48",
              borderRadius: 999,
              padding: "12px 28px",
              border: "2px solid #fda4af",
            }}
          >
            ⚡ Frete para todo Brasil
          </span>
          <span
            style={{
              background: "linear-gradient(90deg, #f43f5e, #db2777)",
              color: "white",
              borderRadius: 999,
              padding: "12px 28px",
            }}
          >
            4+ itens = R$ 6,99 cada
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
