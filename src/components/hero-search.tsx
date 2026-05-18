"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadSearch } from "@/lib/search/fuse";
import type { PromptIndexItem } from "@/lib/content/types";

interface HeroSearchProps {
  placeholder?: string;
  totalHint?: number;
}

export function HeroSearch({
  placeholder = "搜索提示词、分类、标签…",
  totalHint,
}: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<PromptIndexItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const ensureLoaded = React.useCallback(async () => {
    if (loaded) return;
    try {
      await loadSearch();
      setLoaded(true);
    } catch (err) {
      console.error("[search] failed to load index", err);
    }
  }, [loaded]);

  React.useEffect(() => {
    let cancelled = false;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setActive(0);
      return;
    }
    (async () => {
      try {
        const c = await loadSearch();
        if (cancelled) return;
        const found = c.fuse.search(trimmed, { limit: 8 });
        setResults(found.map((f) => f.item));
        setActive(0);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  React.useEffect(() => {
    if (!listRef.current) return;
    const node = listRef.current.querySelector<HTMLElement>(
      `[data-idx="${active}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const select = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/prompts/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (query) {
        setQuery("");
      } else {
        setOpen(false);
        inputRef.current?.blur();
      }
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) select(r.slug);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          "flex items-center gap-3 border bg-card rounded-md px-3.5 h-12 transition-all",
          "border-border hover:border-foreground/40",
          "focus-within:border-foreground/60 focus-within:ring-2 focus-within:ring-ring/30 focus-within:bg-background",
        )}
      >
        <Search className="size-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            ensureLoaded();
            if (query) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          aria-label="搜索提示词"
          className="flex-1 bg-transparent outline-none text-[14.5px] placeholder:text-muted-foreground/60 min-w-0"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="清空"
          >
            <X className="size-4" />
          </button>
        )}
        {!query && (
          <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded-sm border border-border bg-muted text-[10px] font-mono text-muted-foreground tabular-nums">
            /
          </kbd>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-md border border-border bg-popover overflow-hidden shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              未找到与「<span className="text-foreground">{query}</span>」相关的提示词
            </div>
          ) : (
            <>
              <ul
                ref={listRef}
                className="max-h-[60vh] overflow-y-auto scrollbar-thin py-1"
                role="listbox"
              >
                {results.map((r, i) => (
                  <li key={r.slug} role="option" aria-selected={i === active}>
                    <Link
                      href={`/prompts/${r.slug}`}
                      data-idx={i}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "block px-4 py-2.5 transition-colors border-l-2 border-transparent",
                        i === active
                          ? "bg-muted border-l-accent text-foreground"
                          : "text-foreground hover:bg-muted/60",
                      )}
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        {r.isFeatured && (
                          <Sparkles className="size-3 text-accent shrink-0 -mb-0.5" />
                        )}
                        <span className="font-medium text-sm truncate flex-1">
                          {r.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                          {r.category}
                          {r.subcategory ? ` · ${r.subcategory}` : ""}
                        </span>
                      </div>
                      {r.intro && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1 ml-0">
                          {r.intro}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border bg-muted/30 px-3 py-1.5 flex items-center justify-between text-[10.5px] text-muted-foreground font-mono tabular-nums">
                <span>
                  {results.length} 条匹配
                  {totalHint ? ` · 库内 ${totalHint}` : ""}
                </span>
                <span className="flex items-center gap-2.5">
                  <KbdHint k="↑↓" hint="选择" />
                  <KbdHint k="↵" hint="打开" />
                  <KbdHint k="esc" hint="关闭" />
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function KbdHint({ k, hint }: { k: string; hint: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <kbd className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-sm border border-border bg-background text-[10px]">
        {k}
      </kbd>
      <span>{hint}</span>
    </span>
  );
}
