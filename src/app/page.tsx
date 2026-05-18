import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CategoryGrid } from "@/components/category-grid";
import { HeroSearch } from "@/components/hero-search";
import { PromptCard } from "@/components/prompt-card";
import { Separator } from "@/components/ui/separator";
import {
  loadAllPrompts,
  loadCategoriesWithCounts,
  loadFeaturedPrompts,
} from "@/lib/content/loader";

export default function Home() {
  const all = loadAllPrompts();
  const featured = loadFeaturedPrompts(6);
  const categories = loadCategoriesWithCounts();
  const withVarsCount = all.filter((p) => p.variables.length > 0).length;

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-14 md:pt-16 md:pb-20 grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,420px)] gap-10 lg:gap-12 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border-l-2 border-accent pl-2.5 font-mono uppercase tracking-wider">
              中文 AI 提示词镜像
            </div>
            <h1 className="font-serif-display text-4xl md:text-5xl leading-[1.15] tracking-tight max-w-2xl text-balance">
              <span className="text-accent">{all.length}</span> 条中文 AI 提示词
              <br />
              开箱即用，按需填变量
            </h1>
            <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
              覆盖方法、工作、学习、内容、营销与思考六大维度的精选提示词库。识别{" "}
              <code className="font-mono text-[13px] text-foreground bg-muted px-1 py-0.5 rounded">
                {`{{变量}}`}
              </code>{" "}
              与{" "}
              <code className="font-mono text-[13px] text-foreground bg-muted px-1 py-0.5 rounded">
                [占位符]
              </code>
              ，实时预览替换效果，一键复制可用。
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/#categories"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition-colors group"
              >
                浏览全部分类
                <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <span className="text-border">·</span>
              <Link
                href="/favorites"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                我的收藏
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <HeroSearch totalHint={all.length} />
            <div className="flex items-center gap-4 px-1 font-mono text-[11px] text-muted-foreground tabular-nums">
              <Stat label="prompts" value={all.length} />
              <span className="text-border">·</span>
              <Stat label="categories" value={categories.length} />
              <span className="text-border">·</span>
              <Stat label="with vars" value={withVarsCount} />
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-10 pb-2">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif-display text-xl inline-flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              重点推荐
            </h2>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {featured.length} / {all.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map((p) => (
              <PromptCard
                key={p.slug}
                prompt={{
                  slug: p.slug,
                  title: p.title,
                  intro: p.intro,
                  subcategory: p.subcategory,
                  tags: p.tags,
                  version: p.version,
                  variableCount: p.variables.length,
                  isFeatured: p.tags.includes("重点推荐"),
                }}
              />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-2" />

      <CategoryGrid categories={categories} total={all.length} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-foreground font-medium">{value}</span>
      <span className="uppercase tracking-wider text-[10px]">{label}</span>
    </span>
  );
}
