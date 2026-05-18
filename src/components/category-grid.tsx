import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CategoryMeta } from "@/lib/content/types";

interface CategoryGridProps {
  categories: CategoryMeta[];
  total: number;
}

export function CategoryGrid({ categories, total }: CategoryGridProps) {
  return (
    <section
      id="categories"
      className="scroll-mt-20 mx-auto max-w-6xl px-6 py-8"
    >
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-serif-display text-xl">按分类浏览</h2>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          共 {total} 条
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((c) => {
          const num = c.slug.slice(0, 2);
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group focus-visible:outline-none"
            >
              <Card
                className={cn(
                  "hover-rise h-full p-5 flex flex-col gap-2 cursor-pointer",
                  "group-focus-visible:border-foreground",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono text-2xl tabular-nums text-muted-foreground/60 group-hover:text-accent transition-colors">
                      {num}
                    </span>
                    <h3 className="font-serif-display text-lg leading-snug">
                      {c.name}
                    </h3>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0 mt-1" />
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                  {c.description}
                </p>
                <div className="mt-auto pt-3 flex items-center gap-2 text-xs">
                  <span className="font-mono tabular-nums text-foreground/80">
                    {c.count}
                  </span>
                  <span className="text-muted-foreground">条提示词</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
