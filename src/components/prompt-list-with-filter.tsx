"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PromptCard, type PromptCardData } from "@/components/prompt-card";

interface PromptListWithFilterProps {
  prompts: Array<PromptCardData & { subcategory: string }>;
  subcategories: string[];
}

export function PromptListWithFilter({
  prompts,
  subcategories,
}: PromptListWithFilterProps) {
  const [activeSubcat, setActiveSubcat] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    if (!activeSubcat) return prompts;
    return prompts.filter((p) => p.subcategory === activeSubcat);
  }, [prompts, activeSubcat]);

  if (subcategories.length === 0) {
    return <PromptGrid prompts={prompts} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 flex-wrap">
        <ChipButton
          active={activeSubcat === null}
          onClick={() => setActiveSubcat(null)}
        >
          全部
          <span className="ml-1.5 font-mono tabular-nums text-[10px] text-muted-foreground/80">
            {prompts.length}
          </span>
        </ChipButton>
        {subcategories.map((sub) => {
          const count = prompts.filter((p) => p.subcategory === sub).length;
          return (
            <ChipButton
              key={sub}
              active={activeSubcat === sub}
              onClick={() => setActiveSubcat(sub)}
            >
              {sub}
              <span className="ml-1.5 font-mono tabular-nums text-[10px] text-muted-foreground/80">
                {count}
              </span>
            </ChipButton>
          );
        })}
      </div>
      <PromptGrid prompts={filtered} />
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center h-7 px-2.5 rounded-sm border text-xs transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/40",
      )}
    >
      {children}
    </button>
  );
}

function PromptGrid({ prompts }: { prompts: PromptCardData[] }) {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        该子类下暂无提示词
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {prompts.map((p) => (
        <PromptCard key={p.slug} prompt={p} />
      ))}
    </div>
  );
}
