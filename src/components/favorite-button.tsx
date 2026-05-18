"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites, useIsFavorite } from "@/lib/store/favorites";

interface FavoriteButtonProps {
  slug: string;
  title?: string;
  size?: "sm" | "default" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  slug,
  title,
  size = "default",
  showLabel = true,
  className,
}: FavoriteButtonProps) {
  const isFav = useIsFavorite(slug);
  const toggle = useFavorites((s) => s.toggle);
  const hydrated = useFavorites((s) => s.hasHydrated);

  const handleClick = () => {
    const nowFav = toggle(slug);
    if (nowFav) {
      toast.success(title ? `已收藏「${title}」` : "已收藏");
    } else {
      toast("已移除收藏");
    }
  };

  return (
    <Button
      type="button"
      variant={isFav ? "accent" : "outline"}
      size={size}
      onClick={handleClick}
      disabled={!hydrated}
      aria-pressed={isFav}
      aria-label={isFav ? "取消收藏" : "添加到收藏"}
      className={cn(className)}
    >
      <Star
        className={cn("size-4 transition-all", isFav && "fill-current")}
      />
      {showLabel && (size !== "icon") && (
        <span>{isFav ? "已收藏" : "收藏"}</span>
      )}
    </Button>
  );
}
