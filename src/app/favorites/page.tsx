"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bookmark,
  ChevronLeft,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompt-card";
import {
  useFavorites,
  useFavoritesHydrated,
  type FavoriteEntry,
} from "@/lib/store/favorites";
import type { PromptIndex, PromptIndexItem } from "@/lib/content/types";

export default function FavoritesPage() {
  const hydrated = useFavoritesHydrated();
  const entries = useFavorites((s) => s.entries);
  const clear = useFavorites((s) => s.clear);
  const remove = useFavorites((s) => s.remove);

  const [index, setIndex] = React.useState<PromptIndexItem[] | null>(null);
  const [indexError, setIndexError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/data/index.json", { cache: "force-cache" })
      .then((r) => r.json() as Promise<PromptIndex>)
      .then((d) => {
        if (!cancelled) setIndex(d.items);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setIndexError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lookup = React.useMemo(() => {
    if (!index) return null;
    return new Map(index.map((i) => [i.slug, i]));
  }, [index]);

  const resolved = React.useMemo(() => {
    if (!lookup) return null;
    const sorted = [...entries].sort((a, b) => b.addedAt - a.addedAt);
    return sorted.map((e) => ({ entry: e, item: lookup.get(e.slug) }));
  }, [entries, lookup]);

  const validCount = resolved?.filter((r) => r.item).length ?? 0;
  const orphanCount = resolved
    ? resolved.length - validCount
    : 0;

  const handleClear = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        `确认清空全部 ${entries.length} 条收藏？此操作不可撤销。`,
      )
    ) {
      clear();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pt-10 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="size-3.5" />
        返回首页
      </Link>

      <header className="border-b border-border pb-8 mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border-l-2 border-accent pl-2.5 font-mono uppercase tracking-wider mb-3">
            <Bookmark className="size-3" />
            FAVORITES · 我的收藏
          </div>
          <h1 className="font-serif-display text-3xl leading-tight flex items-baseline gap-3">
            收藏夹
            {hydrated && entries.length > 0 && (
              <span className="font-mono text-muted-foreground text-xl tabular-nums">
                {entries.length}
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            收藏只保存在本机浏览器中，不会上传到服务器。
          </p>
        </div>
        {hydrated && entries.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <Trash2 className="size-3.5" />
            清空收藏
          </Button>
        )}
      </header>

      {!hydrated ? (
        <SkeletonGrid />
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : !lookup ? (
        indexError ? (
          <ErrorState />
        ) : (
          <SkeletonGrid />
        )
      ) : (
        <>
          {orphanCount > 0 && (
            <OrphanWarning
              orphans={resolved!.filter((r) => !r.item).map((r) => r.entry)}
              onRemove={remove}
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {resolved!
              .filter((r) => r.item)
              .map(({ entry, item }) => (
                <PromptCard
                  key={entry.slug}
                  prompt={{
                    slug: item!.slug,
                    title: item!.title,
                    intro: item!.intro,
                    subcategory: item!.subcategory,
                    tags: item!.tags,
                    version: item!.version,
                    variableCount: item!.variableCount,
                    isFeatured: item!.isFeatured,
                  }}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 max-w-md mx-auto">
      <Bookmark className="size-10 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="font-serif-display text-2xl mb-3">还没有收藏</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        在任意提示词详情页点击右上角的{" "}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-border rounded-sm text-xs">
          ☆ 收藏
        </span>
        ，它会出现在这里。
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button asChild variant="default">
          <Link href="/">浏览全部提示词</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/#categories">按分类查看</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-center py-20 max-w-md mx-auto text-sm text-muted-foreground">
      <AlertCircle className="size-8 text-accent mx-auto mb-3" />
      数据加载失败，请刷新重试。
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-md border border-border bg-card animate-pulse"
        />
      ))}
    </div>
  );
}

function OrphanWarning({
  orphans,
  onRemove,
}: {
  orphans: FavoriteEntry[];
  onRemove: (slug: string) => void;
}) {
  return (
    <div className="mb-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
      <div className="flex items-start gap-2 mb-2">
        <AlertCircle className="size-3.5 text-accent shrink-0 mt-0.5" />
        <span>
          以下 {orphans.length} 条收藏在上游已被移除或重命名，建议清理：
        </span>
      </div>
      <ul className="flex flex-wrap gap-2 mt-2 ml-5.5">
        {orphans.map((o) => (
          <li
            key={o.slug}
            className="inline-flex items-center gap-1.5 px-2 py-1 border border-border rounded-sm bg-background font-mono"
          >
            <span>{o.slug}</span>
            <button
              type="button"
              onClick={() => onRemove(o.slug)}
              className="text-muted-foreground hover:text-accent transition-colors"
              aria-label={`移除失效的收藏 ${o.slug}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
