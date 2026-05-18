import { ImageResponse } from "next/og";
import { loadAllPrompts, loadCategoriesWithCounts } from "@/lib/content/loader";

export const dynamic = "force-static";
export const alt = "靓开源提示词 · 117 条中文 AI 提示词，开箱即用";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(family: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap&text=${encodeURIComponent(text)}`;
  // Mozilla/4.0 forces Google Fonts to serve TTF (Satori does not accept woff/woff2).
  const css = await fetch(url, {
    headers: { "User-Agent": "Mozilla/4.0" },
  }).then((r) => r.text());
  // Collapse any whitespace (the URL can wrap across lines in the response).
  const flat = css.replace(/\s+/g, " ");
  const resource = flat.match(
    /src:\s*url\(([^)\s]+)\)\s*format\(['"](truetype|opentype|woff2)['"]\)/,
  );
  if (!resource)
    throw new Error(`Could not parse font URL from CSS: ${flat.slice(0, 300)}`);
  return fetch(resource[1]).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const prompts = loadAllPrompts();
  const categories = loadCategoriesWithCounts();
  const withVars = prompts.filter((p) => p.variables.length > 0).length;

  const titleChars = "靓开源提示词条中文AI";
  const subtitleChars = "条中文AI提示词开箱即用按需填变量";
  const allHanChars = Array.from(
    new Set((titleChars + subtitleChars).split("")),
  ).join("");

  const [serifBold, sansRegular, monoRegular] = await Promise.all([
    loadGoogleFont("Noto+Serif+SC", 700, "靓开源提示词" + prompts.length),
    loadGoogleFont("Noto+Sans+SC", 400, allHanChars + subtitleChars),
    loadGoogleFont(
      "Geist+Mono",
      500,
      "promptsyolklab.net 0123456789 categorieswithvarsAI/  ·",
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FCFBF7",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "Sans",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#C24A2D",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Serif",
              fontSize: 42,
              fontWeight: 700,
              paddingBottom: 4,
            }}
          >
            P
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              fontFamily: "Serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#2A2C36",
            }}
          >
            <span style={{ color: "#C24A2D" }}>靓</span>
            <span>开源提示词</span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 28,
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Serif",
              fontSize: 100,
              fontWeight: 700,
              color: "#2A2C36",
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            <span style={{ color: "#C24A2D" }}>{prompts.length}</span>
            <span style={{ marginLeft: 18 }}>条中文 AI 提示词</span>
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Serif",
              fontSize: 56,
              fontWeight: 700,
              color: "#5A5D6B",
              letterSpacing: -1,
            }}
          >
            开箱即用，按需填变量
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #D4D2CB",
            paddingTop: 24,
            fontFamily: "Mono",
            fontSize: 22,
            color: "#7A7D89",
          }}
        >
          <div style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#2A2C36" }}>{prompts.length}</span>
              <span>prompts</span>
            </div>
            <span style={{ color: "#D4D2CB" }}>·</span>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#2A2C36" }}>{categories.length}</span>
              <span>categories</span>
            </div>
            <span style={{ color: "#D4D2CB" }}>·</span>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#2A2C36" }}>{withVars}</span>
              <span>with vars</span>
            </div>
          </div>
          <div style={{ color: "#2A2C36" }}>prompts.yolklab.net</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Serif", data: serifBold, style: "normal", weight: 700 },
        { name: "Sans", data: sansRegular, style: "normal", weight: 400 },
        { name: "Mono", data: monoRegular, style: "normal", weight: 500 },
      ],
    },
  );
}
