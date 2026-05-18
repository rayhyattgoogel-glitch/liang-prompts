import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FavoriteButton } from "@/components/favorite-button";
import { PromptWorkbench } from "@/components/prompt-workbench";
import {
  loadAllPrompts,
  loadPromptBySlug,
  loadPromptsByCategory,
} from "@/lib/content/loader";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return loadAllPrompts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = loadPromptBySlug(slug);
  if (!p) return {};
  const titleHasVersion =
    p.version && p.title.toLowerCase().includes(p.version.toLowerCase());
  return {
    title:
      p.version && !titleHasVersion ? `${p.title} ${p.version}` : p.title,
    description: p.intro.slice(0, 140),
  };
}

export default async function PromptDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const prompt = loadPromptBySlug(slug);
  if (!prompt) notFound();

  const sameCategory = loadPromptsByCategory(prompt.categorySlug);
  const idx = sameCategory.findIndex((p) => p.slug === prompt.slug);
  const prev = idx > 0 ? sameCategory[idx - 1] : null;
  const next = idx < sameCategory.length - 1 ? sameCategory[idx + 1] : null;

  return (
    <article className="mx-auto max-w-6xl px-6 pt-10 pb-16">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link
          href={`/category/${prompt.categorySlug}`}
          className="hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <ChevronLeft className="size-3.5" />
          {prompt.category}
        </Link>
        {prompt.subcategory && (
          <>
            <span className="text-border">/</span>
            <span>{prompt.subcategory}</span>
          </>
        )}
      </nav>

      <header className="border-b border-border pb-8 mb-8">
        <div className="flex items-start justify-between gap-6 mb-4 flex-wrap">
          <h1 className="font-serif-display text-3xl md:text-4xl leading-tight tracking-tight flex-1 min-w-0 text-balance">
            {prompt.title}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            {prompt.version && (
              <span className="font-mono text-xs px-2 py-1 border border-border rounded-sm tabular-nums h-9 inline-flex items-center">
                {prompt.version}
              </span>
            )}
            <FavoriteButton
              slug={prompt.slug}
              title={prompt.title}
              size="sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {prompt.author && <span>{prompt.author}</span>}
          {prompt.author && prompt.created && (
            <span className="text-border">·</span>
          )}
          {prompt.created && (
            <span className="font-mono tabular-nums">{prompt.created}</span>
          )}
          {prompt.sourceSection && (
            <>
              <span className="text-border">·</span>
              <span className="font-mono text-[11px]">
                {prompt.sourceSection}
              </span>
            </>
          )}
        </div>

        {prompt.intro && (
          <p className="mt-5 text-[15px] text-muted-foreground leading-relaxed max-w-3xl">
            {prompt.intro}
          </p>
        )}

        {prompt.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-4">
            {prompt.tags.map((tag) => (
              <Badge
                key={tag}
                variant={tag === "重点推荐" ? "accent" : "outline"}
                className="font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <PromptWorkbench prompt={prompt.prompt} variables={prompt.variables} />

      <Separator className="mt-16 mb-6" />

      <nav className="flex items-stretch justify-between gap-3">
        {prev ? (
          <Link
            href={`/prompts/${prev.slug}`}
            className="hover-rise group flex items-center gap-3 border border-border rounded-md p-4 flex-1 min-w-0 max-w-sm focus-visible:outline-none focus-visible:border-foreground"
          >
            <ChevronLeft className="size-4 text-muted-foreground shrink-0 group-hover:text-accent transition-colors" />
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">
                上一篇
              </div>
              <div className="text-sm font-medium truncate">{prev.title}</div>
            </div>
          </Link>
        ) : (
          <div className="flex-1 max-w-sm" />
        )}
        {next ? (
          <Link
            href={`/prompts/${next.slug}`}
            className="hover-rise group flex items-center gap-3 border border-border rounded-md p-4 flex-1 min-w-0 max-w-sm justify-end text-right focus-visible:outline-none focus-visible:border-foreground"
          >
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">
                下一篇
              </div>
              <div className="text-sm font-medium truncate">{next.title}</div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:text-accent transition-colors" />
          </Link>
        ) : (
          <div className="flex-1 max-w-sm" />
        )}
      </nav>
    </article>
  );
}
