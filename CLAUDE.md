# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A Next.js 16 static-export frontend that wraps 117 Chinese AI prompts from the upstream `yaojingang/yao-open-prompts` repo (vendored as a git submodule). See `README.md` for product-level context. This file is for *changing the code*.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server at :3000. Runs `prebuild` (build-index) first via `predev`. |
| `pnpm build` | Production static export to `out/`. Auto-runs prebuild. |
| `pnpm typecheck` | `tsc --noEmit`. No lint, no test suite — typecheck is the only static check. |
| `pnpm sync:content` | `git submodule update --remote --merge` then rebuild index. |
| `pnpm vercel-build` | The build command Vercel runs (also initializes submodule). |

No `pnpm test`, no `pnpm lint`. The project was scaffolded with `--no-eslint`.

After a fresh clone you must `git submodule update --init --recursive` or the loader will warn and emit zero prompts.

## Architecture

### Data pipeline

```
content/yao-open-prompts/  (git submodule, read-only)
        │
        ▼  scripts/build-index.ts (prebuild hook)
        │  └─ gray-matter + extract Prompt body + extract {{}}/[] vars
        ▼
public/data/index.json (~73 KB, client search index)

src/app/**/page.tsx (RSC)
        │
        ▼  src/lib/content/loader.ts (fs read + cache)
        ▼
Static HTML at build time
```

The loader is the single source of truth — both the prebuild script and every RSC page funnel through it. It caches in-process; per-build it reads the filesystem exactly once.

### Routing (all SSG, no dynamic routes)

- `/`, `/about`, `/favorites` — static.
- `/category/[slug]` — 9 pages via `generateStaticParams` returning the hardcoded `CATEGORIES` list in `loader.ts`.
- `/prompts/[slug]` — 117 pages via `generateStaticParams` returning every prompt's slug.
- `/opengraph-image`, `/apple-icon` — `next/og` `ImageResponse`, both must export `dynamic = "force-static"` under `output: 'export'`.

### Client state

- **Search** (`src/lib/search/fuse.ts`): singleton + inflight promise, lazy-fetches `/data/index.json` on first focus of `HeroSearch`.
- **Favorites** (`src/lib/store/favorites.ts`): zustand + `persist` middleware → localStorage `yop-favorites-v1`. **All reads must go through `useIsFavorite()` or `useFavoritesHydrated()` to gate on `hasHydrated`**, otherwise SSR HTML disagrees with first client paint and hydration errors fire.

### Visual system

Cinnabar red `oklch(0.58 0.18 25)` + Source Han Serif (titles) + PingFang (body) + Sarasa Mono (preview). Tokens live entirely in `src/app/globals.css` via `@theme inline` and CSS custom properties for light/dark. **No `tailwind.config.ts` exists — do not create one** (Tailwind v4 reads config from CSS).

Strict rules baked into the system: no emoji, no purple gradients, single accent color, no shadows on cards (border-color hover only), serif only for hero titles + H1.

## Non-obvious gotchas (read before changing)

### Build / framework constraints

- **Page params are Promises in Next.js 16**: `const { slug } = await params;` — required, easy to forget when refactoring.
- **`output: 'export'` forbids**: ISR, `revalidate`, Edge runtime, server actions. Anything dynamic must compute at build time.
- **Do not re-add `trailingSlash: true`** to `next.config.ts`. It was removed because it caused `/opengraph-image` and `/apple-icon` to 308 to `/opengraph-image/`, which most social crawlers (X, Slack, LinkedIn) do not follow.
- **shadcn must be `@canary`** — stable shadcn is incompatible with Tailwind v4 + React 19. `components.json` is configured for canary; do not regenerate it with stable.

### Tooling

- **`pnpm-workspace.yaml` must allow esbuild builds** (`allowBuilds.esbuild: true`). `tsx` (the build-index runner) needs esbuild's postinstall to download the platform binary. pnpm 11 auto-rewrites this file on install, so verify after a fresh `pnpm install`.
- **Node 22 fetch is IPv6-preferred** and times out on many networks. `src/lib/content/upstream-info.ts` uses `node:https` with `family: 4`, then falls back to `curl` for the GitHub API. **Do not naively replace with `fetch`** — it will silently zero-out stars/forks data on the about page.

### Hot-reload caches

`loader.ts` and `upstream-info.ts` cache at module scope. **`pnpm dev` hot reload does not clear these** — after editing parsing logic, restart the dev server, do not rely on save-to-refresh.

### `@vercel/og` / Satori

- Satori accepts only TTF/OTF, not woff/woff2.
- Google Fonts serves TTF only when UA is `Mozilla/4.0` (any modern UA returns woff2). The helper in `src/app/opengraph-image.tsx` already does this — preserve it.
- Returned font CSS can wrap the URL across lines; flatten whitespace before regex-matching the URL.
- `vercel.json` adds `Content-Type: image/png` headers for `/opengraph-image` and `/apple-icon`, because static-export emits the OG file without `.png` extension and Vercel's default is `application/octet-stream` (which strict crawlers reject).

### Variable extraction quirks

- Two placeholder formats: `{{x}}` (curly, almost always user-fillable) and `[x]` (bracket, often *noise* like `[AI 应从用户回答中提取]`).
- Bracket regex excludes markdown links via negative lookbehind/lookahead on `(`.
- `prompt-workbench.tsx` flags bracket placeholders matching the `NOISE_HINT` pattern (`AI/应/请/若无/...`) or length > 12 as "可跳过" hints in the UI. Improving extraction precision = updating those heuristics, not the regex.
- Some prompts trip ~100+ "variables" because list/itemized sections happen to use brackets. The workbench shows a warning above 20 variables.

## Workflow

- Single-owner repo. **Direct push to `main` is the normal flow**; Vercel auto-deploys.
- Open a PR only when you want Vercel preview deployment (large changes you want to review side-by-side with prod).
- `.github/workflows/sync-upstream.yml` runs daily at UTC 18:00 (Beijing 02:00) — bumps the submodule, commits if it changed, push triggers Vercel redeploy. If GitHub disables cron after 60 days inactivity, push any commit (including `--allow-empty`) to re-enable.
- Production: `https://prompts.yolklab.net` (Cloudflare DNS-only → Vercel, Let's Encrypt cert auto-issued).

## When forking

`src/app/layout.tsx` hardcodes `metadataBase: new URL("https://prompts.yolklab.net")` for OG image resolution. Change it to the fork's domain or social image URLs will 404.
