import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  CATEGORIES,
  loadCategoriesWithCounts,
  loadPromptsByCategory,
} from "@/lib/content/loader";
import { PromptListWithFilter } from "@/components/prompt-list-with-filter";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = loadCategoriesWithCounts().find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: `${cat.name} · ${cat.count} 条提示词`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = loadCategoriesWithCounts().find((c) => c.slug === slug);
  if (!cat) notFound();

  const prompts = loadPromptsByCategory(slug);
  const subcategories = Array.from(
    new Set(prompts.map((p) => p.subcategory).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "zh-CN"));

  const num = cat.slug.slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-10 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="size-3.5" />
        返回首页
      </Link>

      <header className="border-b border-border pb-8 mb-8 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-3xl tabular-nums text-accent">
            {num}
          </span>
          <h1 className="font-serif-display text-3xl leading-tight">
            {cat.name}
          </h1>
        </div>
        <div className="flex-1 sm:pl-6 sm:border-l sm:border-border">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {cat.description}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs font-mono text-muted-foreground tabular-nums">
            <span className="text-foreground">{cat.count}</span>
            <span>条提示词</span>
            {subcategories.length > 0 && (
              <>
                <span className="text-border">·</span>
                <span className="text-foreground">{subcategories.length}</span>
                <span>个子类</span>
              </>
            )}
          </div>
        </div>
      </header>

      <PromptListWithFilter
        prompts={prompts.map((p) => ({
          slug: p.slug,
          title: p.title,
          intro: p.intro,
          subcategory: p.subcategory,
          tags: p.tags,
          version: p.version,
          variableCount: p.variables.length,
          isFeatured: p.tags.includes("重点推荐"),
        }))}
        subcategories={subcategories}
      />
    </div>
  );
}
