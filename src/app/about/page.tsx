import Link from "next/link";
import {
  ChevronLeft,
  Star,
  GitFork,
  AlertCircle,
  GitCommit,
  Scale,
  Calendar,
  Sparkles,
  Search,
  Variable,
  Copy,
  Bookmark,
  RefreshCcw,
  Eye,
  ExternalLink,
  Github,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  loadAllPrompts,
  loadCategoriesWithCounts,
} from "@/lib/content/loader";
import { loadUpstreamInfo } from "@/lib/content/upstream-info";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于本站",
  description:
    "靓开源提示词是 yaojingang/yao-open-prompts 的非官方中文镜像，提供搜索、变量填充、一键复制等使用体验。",
};

function formatNumber(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1)}k`;
  }
  return n.toLocaleString("zh-CN");
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

function daysAgo(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "今日";
  if (days === 1) return "1 天前";
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.floor(days / 30)} 个月前`;
  return `${Math.floor(days / 365)} 年前`;
}

export default async function AboutPage() {
  const prompts = loadAllPrompts();
  const categories = loadCategoriesWithCounts();
  const upstream = await loadUpstreamInfo();

  const withVarsCount = prompts.filter((p) => p.variables.length > 0).length;
  const totalChars = prompts.reduce((s, p) => s + p.prompt.length, 0);
  const featuredCount = prompts.filter((p) =>
    p.tags.includes("重点推荐"),
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-6 pt-10 pb-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="size-3.5" />
        返回首页
      </Link>

      <header className="border-b border-border pb-10 mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border-l-2 border-accent pl-2.5 font-mono uppercase tracking-wider mb-5">
          ABOUT · 关于本站
        </div>
        <h1 className="font-serif-display text-4xl leading-tight tracking-tight mb-4 text-balance">
          一份精致的{" "}
          <span className="text-accent">中文 AI 提示词</span>{" "}
          使用工具
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          「靓开源提示词」是 <span className="text-foreground">yao-open-prompts</span> 的非官方中文镜像，专注于让 117 条精选中文 AI 提示词「找得到、填得快、复制即用」。 本站不存储原创内容，所有提示词版权归原作者所有。
        </p>
      </header>

      <Section title="站内规模" subtitle="构建期统计">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-md overflow-hidden">
          <StatTile
            label="prompts"
            value={prompts.length}
            unit="条提示词"
          />
          <StatTile
            label="categories"
            value={categories.length}
            unit="个分类"
          />
          <StatTile
            label="with vars"
            value={withVarsCount}
            unit="条含变量"
          />
          <StatTile
            label="total chars"
            value={Math.round(totalChars / 1000)}
            unit="k 字符"
          />
        </div>
        {featuredCount > 0 && (
          <p className="text-xs text-muted-foreground mt-3 px-1">
            其中{" "}
            <span className="text-accent font-medium">{featuredCount} 条</span>{" "}
            被标记为「重点推荐」
          </p>
        )}
      </Section>

      <Section
        title="内容来源"
        subtitle="所有提示词均整理自上游项目"
      >
        <Card className="overflow-hidden">
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1 inline-flex items-center gap-1">
                  <Github className="size-3" />
                  GitHub Repository
                </div>
                <a
                  href={upstream.htmlUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-baseline gap-1.5 font-mono text-lg text-foreground tracking-tight hover:text-accent transition-colors group"
                >
                  {upstream.fullName}
                  <ExternalLink className="size-3.5 text-muted-foreground/60 group-hover:text-accent transition-colors" />
                </a>
              </div>
              {upstream.license && (
                <Badge variant="accent" className="font-mono">
                  <Scale className="size-2.5 mr-1" />
                  {upstream.license}
                </Badge>
              )}
            </div>

            {upstream.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {upstream.description}
              </p>
            )}

            {upstream.topics.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {upstream.topics.slice(0, 8).map((t) => (
                  <Badge key={t} variant="outline" className="font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <RepoMetric
                icon={Star}
                value={formatNumber(upstream.stars)}
                label="Stars"
                accent
              />
              <RepoMetric
                icon={GitFork}
                value={formatNumber(upstream.forks)}
                label="Forks"
              />
              <RepoMetric
                icon={Eye}
                value={formatNumber(upstream.watchers)}
                label="Watchers"
              />
              <RepoMetric
                icon={AlertCircle}
                value={formatNumber(upstream.openIssues)}
                label="Open issues"
              />
            </div>

            <Separator />

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <MetaRow
                icon={Calendar}
                label="上游最近 push"
                value={
                  upstream.pushedAt
                    ? `${formatDate(upstream.pushedAt)} · ${daysAgo(upstream.pushedAt)}`
                    : "—"
                }
              />
              <MetaRow
                icon={Calendar}
                label="仓库创建"
                value={formatDate(upstream.createdAt)}
              />
              <MetaRow
                icon={GitCommit}
                label="本站同步至"
                value={
                  upstream.submoduleAvailable
                    ? upstream.submoduleCommitShort
                    : "—"
                }
                href={
                  upstream.submoduleAvailable
                    ? upstream.submoduleCommitUrl
                    : undefined
                }
                mono
              />
              <MetaRow
                icon={Calendar}
                label="同步时间"
                value={
                  upstream.submoduleCommitDate
                    ? `${formatDate(upstream.submoduleCommitDate)} · ${daysAgo(upstream.submoduleCommitDate)}`
                    : "—"
                }
              />
            </dl>

            {upstream.submoduleAvailable && upstream.submoduleCommitMessage && (
              <div className="text-xs text-muted-foreground border-l-2 border-border pl-3 py-1 font-mono leading-relaxed">
                <span className="text-foreground/70">最近提交：</span>
                {upstream.submoduleCommitMessage}
              </div>
            )}

            {!upstream.apiAvailable && (
              <div className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-md px-3 py-2">
                构建时未能从 GitHub API 拉取最新统计，以上数字可能为兜底值；
                下一次同步会自动更新。
              </div>
            )}

            <div className="flex items-center gap-4 pt-1 flex-wrap text-xs">
              <a
                href={upstream.htmlUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-foreground hover:text-accent transition-colors group font-medium"
              >
                <Github className="size-3.5" />
                在 GitHub 查看仓库
                <ExternalLink className="size-3 opacity-60 group-hover:opacity-100" />
              </a>
              <span className="text-border">·</span>
              <a
                href={`${upstream.htmlUrl}/blob/${upstream.defaultBranch}/CATALOG.md`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                完整目录
                <ExternalLink className="size-3" />
              </a>
              {upstream.submoduleAvailable && (
                <>
                  <span className="text-border">·</span>
                  <a
                    href={upstream.submoduleCommitUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-mono"
                  >
                    <GitCommit className="size-3" />
                    {upstream.submoduleCommitShort}
                    <ExternalLink className="size-3" />
                  </a>
                </>
              )}
            </div>
          </div>
        </Card>
      </Section>

      <Section title="版权与署名" subtitle="License & Attribution">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-5 space-y-2">
            <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              提示词内容
            </div>
            <div className="font-serif-display text-xl">CC BY 4.0</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              原作者：<span className="text-foreground">姚金刚</span>。 转载、引用、二次创作时请保留作者署名与许可协议链接。
            </p>
          </Card>
          <Card className="p-5 space-y-2">
            <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              本站前端代码
            </div>
            <div className="font-serif-display text-xl">MIT</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              本站为非官方中文镜像，无商业用途，仅作中文 AI 工具爱好者使用。
            </p>
          </Card>
        </div>
      </Section>

      <Section title="本站能力" subtitle="为日常使用而设计">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <FeatureItem icon={Search}>
            117 条提示词全文模糊搜索（Fuse.js 客户端索引）
          </FeatureItem>
          <FeatureItem icon={Variable}>
            自动识别 <code className="font-mono text-[12px] bg-muted px-1 py-0.5 rounded">{`{{变量}}`}</code> 与{" "}
            <code className="font-mono text-[12px] bg-muted px-1 py-0.5 rounded">[占位符]</code>
          </FeatureItem>
          <FeatureItem icon={Sparkles}>
            实时预览替换效果，未填占位朱砂高亮
          </FeatureItem>
          <FeatureItem icon={Copy}>
            一键复制 Prompt 正文，无 frontmatter 干扰
          </FeatureItem>
          <FeatureItem icon={Bookmark}>
            收藏夹与最近浏览（即将上线）
          </FeatureItem>
          <FeatureItem icon={RefreshCcw}>
            上游内容每日自动同步（UTC 18:00 / 北京 02:00）
          </FeatureItem>
        </ul>
      </Section>

      <Section title="技术栈" subtitle="开源、静态、零后端">
        <div className="font-mono text-[13px] leading-relaxed text-muted-foreground space-y-1.5">
          <StackLine label="Framework">
            Next.js 16 · React 19 · App Router · Static Export
          </StackLine>
          <StackLine label="Styling">
            Tailwind v4 · shadcn/ui · OKLCH 色彩 · 思源宋 + PingFang + Sarasa Mono
          </StackLine>
          <StackLine label="State">
            Fuse.js · zustand · next-themes
          </StackLine>
          <StackLine label="Hosting">
            Vercel · GitHub Actions 每日 cron 同步
          </StackLine>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-5">
        <h2 className="font-serif-display text-xl">{title}</h2>
        {subtitle && (
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function StatTile({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="bg-card p-5 flex flex-col gap-1">
      <span className="font-serif-display text-3xl text-foreground tabular-nums">
        {value.toLocaleString("zh-CN")}
      </span>
      <span className="text-xs text-muted-foreground">{unit}</span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-1">
        {label}
      </span>
    </div>
  );
}

function RepoMetric({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div
        className={
          "font-serif-display text-2xl tabular-nums " +
          (accent ? "text-accent" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  mono,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  href?: string;
}) {
  const valueClass =
    "text-foreground tabular-nums " + (mono ? "font-mono text-[12px]" : "");
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className={valueClass}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 hover:text-accent transition-colors"
          >
            {value}
            <ExternalLink className="size-3 opacity-60" />
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="size-4 text-accent shrink-0 mt-0.5" />
      <span className="text-foreground leading-relaxed">{children}</span>
    </li>
  );
}

function StackLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3 flex-wrap">
      <span className="inline-flex items-center justify-center min-w-[88px] text-[11px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      <span className="text-foreground/90">{children}</span>
    </div>
  );
}
