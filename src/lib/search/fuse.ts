"use client";

import Fuse from "fuse.js";
import type { PromptIndex, PromptIndexItem } from "@/lib/content/types";

interface SearchCache {
  items: PromptIndexItem[];
  fuse: Fuse<PromptIndexItem>;
  total: number;
}

let cache: SearchCache | null = null;
let inflight: Promise<SearchCache> | null = null;

export async function loadSearch(): Promise<SearchCache> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    const res = await fetch("/data/index.json", { cache: "force-cache" });
    if (!res.ok) throw new Error(`Failed to load index: ${res.status}`);
    const data: PromptIndex = await res.json();
    const fuse = new Fuse(data.items, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "subcategory", weight: 0.2 },
        { name: "tags", weight: 0.2 },
        { name: "intro", weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 1,
      includeMatches: false,
    });
    cache = { items: data.items, fuse, total: data.total };
    return cache;
  })();

  return inflight;
}

export function isLoaded() {
  return cache !== null;
}
