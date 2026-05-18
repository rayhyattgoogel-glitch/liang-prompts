import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function loadGeistBold() {
  const url =
    "https://fonts.googleapis.com/css2?family=Geist:wght@700&text=P";
  const css = await fetch(url, {
    headers: { "User-Agent": "Mozilla/4.0" },
  }).then((r) => r.text());
  const flat = css.replace(/\s+/g, " ");
  const m = flat.match(
    /src:\s*url\(([^)\s]+)\)\s*format\(['"](truetype|opentype|woff2)['"]\)/,
  );
  if (!m) throw new Error("Failed to parse Geist font CSS");
  return fetch(m[1]).then((r) => r.arrayBuffer());
}

export default async function AppleIcon() {
  const font = await loadGeistBold();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#C24A2D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 120,
            fontWeight: 700,
            paddingBottom: 8,
            letterSpacing: -2,
          }}
        >
          P
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: font, style: "normal", weight: 700 },
      ],
    },
  );
}
