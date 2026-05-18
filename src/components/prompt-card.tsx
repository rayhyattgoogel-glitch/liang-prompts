import Link from "next/link";
import { Variable, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PromptCardData {
  slug: string;
  title: string;
  intro?: string;
  subcategory?: string;
  tags?: string[];
  version?: string;
  variableCount?: number;
  isFeatured?: boolean;
}

interface PromptCardProps {
  prompt: PromptCardData;
  className?: string;
  compact?: boolean;
}

export function PromptCard({ prompt, className, compact }: PromptCardProps) {
  const visibleTags = (prompt.tags ?? [])
    .filter((t) => t !== "重点推荐")
    .slice(0, 3);

  return (
    <Link href={`/prompts/${prompt.slug}`} className="group block focus-visible:outline-none">
      <Card
        className={cn(
          "hover-rise h-full flex flex-col gap-3 p-5 cursor-pointer relative",
          "group-focus-visible:border-foreground",
          className,
        )}
      >
        {prompt.isFeatured && (
          <span className="absolute -top-px -right-px inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide bg-accent text-accent-foreground px-1.5 py-0.5 rounded-bl-md rounded-tr-md">
            <Sparkles className="size-2.5" />
            推荐
          </span>
        )}

        <div className="flex items-baseline gap-2 min-w-0">
          {prompt.version && (
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
              {prompt.version}
            </span>
          )}
          <h3 className="font-medium text-[15px] leading-snug truncate group-hover:text-accent transition-colors">
            {prompt.title}
          </h3>
        </div>

        {!compact && prompt.intro && (
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
            {prompt.intro}
          </p>
        )}

        <div className="flex items-center gap-2 mt-auto pt-1 text-xs text-muted-foreground flex-wrap">
          {prompt.subcategory && (
            <span className="text-foreground/70 font-medium">
              {prompt.subcategory}
            </span>
          )}
          {visibleTags.length > 0 && (
            <>
              <span className="text-border">·</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {visibleTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          )}
          {prompt.variableCount && prompt.variableCount > 0 ? (
            <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground/70 font-mono tabular-nums">
              <Variable className="size-3" />
              {prompt.variableCount}
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
