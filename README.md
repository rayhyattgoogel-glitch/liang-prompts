<div align="center">

<img src="https://prompts.yolklab.net/opengraph-image" alt="靓开源提示词" width="640"/>

# 靓开源提示词

**117 条中文 AI 提示词的精致前端 · 开箱即用，按需填变量**

[![Live](https://img.shields.io/badge/Live-prompts.yolklab.net-C24A2D?style=flat-square)](https://prompts.yolklab.net)
[![Code](https://img.shields.io/badge/Code-MIT-black?style=flat-square)](#协议)
[![Content](https://img.shields.io/badge/Content-CC%20BY%204.0-1768AC?style=flat-square)](https://creativecommons.org/licenses/by/4.0/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Deploy on Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=flat-square&logo=vercel)](https://prompts.yolklab.net)

[在线访问](https://prompts.yolklab.net) · [关于本站](https://prompts.yolklab.net/about) · [上游内容](https://github.com/yaojingang/yao-open-prompts)

</div>

---

## 是什么

「靓开源提示词」是 [yaojingang/yao-open-prompts](https://github.com/yaojingang/yao-open-prompts) 的**非官方中文镜像前端**——把姚金刚整理的 117 条中文 AI 提示词以更精致、更顺手的方式呈现，让「日常找提示词 → 填变量 → 一键复制使用」这条链路尽可能短。

上游官方 GitHub Pages 只能按分类罗列 + 跳转 GitHub 看原文。本站补全了几项关键日用能力：

- **模糊搜索**：Fuse.js 客户端索引，输入 `/` 或 `⌘K` 立刻聚焦，结果按分类/子类/标签加权
- **变量填充器**：自动识别 `{{变量}}` 和 `[占位符]`，左侧表单实时驱动右侧预览，未填占位朱砂高亮
- **一键复制**：复制的是纯净 Prompt 正文，无 frontmatter、无 markdown 围栏
- **收藏夹**：本机 localStorage，不上传任何数据；按收藏时间倒序
- **关于页**：构建期拉 GitHub API，把上游 stars / forks / license / 当前同步 commit 全部冻结到静态 HTML
- **每日自动同步**：GitHub Actions cron 每天北京时间 02:00 拉一次上游更新

视觉上拒绝 AI 通用美学（紫色渐变、Inter 字体、Tailwind 默认色）——走「朱砂红 + 中文编辑器 / 文献感」路线，思源宋衬线标题、PingFang 正文、Sarasa Mono 等宽预览。

## 技术栈

| 分类 | 选型 |
|---|---|
| Framework | Next.js 16 (App Router, RSC) · React 19 · 静态导出 `output: 'export'` |
| Styling | Tailwind v4（CSS 变量主题）· 手写 shadcn-style 组件 · OKLCH 色彩 |
| 字体 | 思源宋（标题） + PingFang/HarmonyOS Sans SC（正文） + Geist / Sarasa Mono（等宽）|
| State | zustand + persist（收藏） · next-themes（主题） |
| Search | Fuse.js 客户端模糊索引 |
| OG / Favicon | `@vercel/og` 构建期生成，从 Google Fonts 拉 TTF subset |
| 内容 | git submodule 引入上游 markdown，`gray-matter` 解析 |
| Hosting | Vercel · Cloudflare DNS（DNS only） |
| CI | GitHub Actions 每日 cron 自动同步上游 |

## 本地开发

```bash
# 1. clone（必须 --recursive 拉 submodule）
git clone --recursive https://github.com/rayhyattgoogel-glitch/liang-prompts.git
cd liang-prompts

# 或者已经 clone 但忘了 --recursive
git submodule update --init --recursive

# 2. 安装
pnpm install

# 3. 开发（自动跑 prebuild 生成 public/data/index.json）
pnpm dev          # http://localhost:3000

# 4. 拉一次上游最新内容
pnpm sync:content

# 5. 生产构建
pnpm build        # 输出到 out/
```

需要 Node ≥ 20、pnpm ≥ 11。`pnpm-workspace.yaml` 显式允许 esbuild 跑 install script（tsx 需要）。

## 部署

### Vercel（推荐）

1. Fork 这个仓库到你自己的 GitHub
2. Vercel → Add New Project → Import → 选 fork 出来的仓库
3. Framework 自动识别为 Next.js，无需任何环境变量
4. 部署即可——`vercel.json` 已配 `vercel-build` script 自动初始化 submodule

部署后**必须修改一处**：把 `src/app/layout.tsx` 里的 `metadataBase: new URL("https://prompts.yolklab.net")` 改成你的域名，否则社交分享卡片链接会指错。

### 绑定自定义域名 + Cloudflare

DNS only 方案（最简）：

| 域名类型 | Cloudflare DNS 记录 | 代理状态 |
|---|---|---|
| 子域名（推荐） | CNAME → `cname.vercel-dns.com` | **DNS only（灰色云）** |
| Apex 域名 | A → `76.76.21.21` | **DNS only（灰色云）** |

⚠️ **必须灰色云**：开成橙色 Proxied 会让 Vercel 拒绝签发 SSL。Vercel 自带全球 CDN，套 CF Proxy 不会更快、反而增加复杂度。

## 自动同步上游

`.github/workflows/sync-upstream.yml` 每天北京 02:00（UTC 18:00）执行：

1. fetch 上游 `yaojingang/yao-open-prompts:main` 最新 commit
2. 若 submodule pointer 改变，自动 `git add + commit + push`
3. push 触发 Vercel 自动重新构建并部署
4. 若上游无更新，跳过提交，不产生空 commit

也可在 GitHub Actions 页面手动触发（`workflow_dispatch`）。

## 项目结构

```
liang-prompts/
├── .github/workflows/sync-upstream.yml  # 每日 cron 同步上游
├── content/yao-open-prompts/            # git submodule（只读）
├── scripts/build-index.ts               # prebuild：117 md → public/data/index.json
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # 字体 + ThemeProvider + Toaster
│   │   ├── page.tsx                     # 首页（Hero 搜索 + 分类网格 + 重点推荐）
│   │   ├── opengraph-image.tsx          # 动态 OG 1200×630
│   │   ├── icon.svg                     # 朱砂圆 + 白 P favicon
│   │   ├── apple-icon.tsx               # 朱砂 + 白 P apple touch icon 180×180
│   │   ├── prompts/[slug]/page.tsx      # 117 详情页（含变量填充器）
│   │   ├── category/[slug]/page.tsx     # 9 分类页（子类 chip 过滤）
│   │   ├── favorites/page.tsx           # 收藏夹（client-only）
│   │   ├── about/page.tsx               # 关于页（含上游 stars/forks/license）
│   │   └── globals.css                  # 朱砂 OKLCH 主题 + 字体栈
│   ├── components/                      # 复用组件
│   │   ├── ui/                          # shadcn 风格基础组件
│   │   ├── prompt-workbench.tsx         # 变量表单 + 实时预览（核心）
│   │   ├── hero-search.tsx              # 首页 Fuse 搜索框 + 下拉结果
│   │   └── ...
│   └── lib/
│       ├── content/                     # md 解析、变量提取、上游元数据
│       ├── search/                      # Fuse.js 客户端工厂
│       └── store/                       # zustand 收藏 store
├── next.config.ts                       # output: 'export'
├── vercel.json                          # build command + Content-Type headers
└── pnpm-workspace.yaml                  # allowBuilds: esbuild
```

## 数据管线

构建期一次性解析 117 个 md 文件：

1. `gray-matter` 取 frontmatter，`tags` 字符串切分成数组
2. 反向引用正则抽取 `## Prompt` 围栏内代码（同时兼容 3/4 个反引号）
3. 扫描 `{{变量}}` 与 `[占位符]`（排除 markdown 链接），生成变量清单
4. 输出 73 KB 的 `public/data/index.json` 供客户端搜索使用
5. 详情页正文走 RSC 注入静态 HTML，不重复传输

整个解析 < 1 秒。详情页 117 张 HTML + 1200×630 OG PNG 全部 SSG。

## 已知边界与默认决定

- **占位符识别仅 `{{x}}` 与 `[x]`**：上游极个别提示词使用 `{ 多行块 }` 或 `<!-- -->` 占位段，本站不解析，详情页给提示「请手动编辑」
- **占位符噪声过滤**：含「AI / 应 / 若无」等关键词的方括号被标记为「可跳过的说明文字」
- **重点推荐**：默认按 `tags` 含「重点推荐」筛选，结果不足 6 条时按 AI 方法分类回退补齐
- **英文 `prompts-en/` 镜像**：当前未接入，预留作 v2 的 i18n 入口

## 协议

| 部分 | License | 作者 |
|---|---|---|
| 前端代码 | MIT | 本仓库贡献者 |
| 提示词内容 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [姚金刚](https://github.com/yaojingang)（[yao-open-prompts](https://github.com/yaojingang/yao-open-prompts)）|

转载、引用、二次创作提示词内容时请保留原作者署名与许可链接。

## 致谢

- **[姚金刚](https://github.com/yaojingang)** 持续整理与开源的 [yao-open-prompts](https://github.com/yaojingang/yao-open-prompts) 提示词库
- **Vercel** 提供的 Next.js、`@vercel/og`、Hosting
- **shadcn** 的 UI 组件思路与 OKLCH 主题工程化范式
- 视觉灵感：中国印章朱砂、思源宋体、Linear Changelog 的克制美学
