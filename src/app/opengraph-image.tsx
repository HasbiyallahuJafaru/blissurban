import { ImageResponse } from "next/og";

export const alt = "Bliss Urban Hotels & Suites — Barnawa, Kaduna";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card is set, not photographed. Every picture on the site is still
 * a stand-in of somebody else's building, and a borrowed photograph does more
 * damage on WhatsApp than a blank preview does: it travels without the page
 * around it that admits what it is. Type is honest at any size.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#14100f",
          padding: "72px 80px",
          color: "#f6efe6",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#c9a227",
            }}
          >
            Barnawa · Kaduna
          </div>
          <div style={{ display: "flex", width: 120, height: 2, background: "#c9a227", marginTop: 28 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 82, lineHeight: 1.05, letterSpacing: -1 }}>Bliss Urban</div>
          <div style={{ fontSize: 82, lineHeight: 1.05, color: "#c9a227", fontStyle: "italic" }}>
            Hotels &amp; Suites
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#cbbfae" }}>
          Twenty-four hour power · Secure parking · Fibre Wi-Fi · Kitchen to midnight
        </div>
      </div>
    ),
    size,
  );
}
