"use client";

import * as React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface FavoriteEntry {
  slug: string;
  addedAt: number;
}

interface FavoritesState {
  entries: FavoriteEntry[];
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  toggle: (slug: string) => boolean;
  isFavorite: (slug: string) => boolean;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      entries: [],
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      add: (slug) => {
        if (get().entries.some((e) => e.slug === slug)) return;
        set({
          entries: [{ slug, addedAt: Date.now() }, ...get().entries],
        });
      },
      remove: (slug) => {
        set({ entries: get().entries.filter((e) => e.slug !== slug) });
      },
      toggle: (slug) => {
        const existing = get().entries.some((e) => e.slug === slug);
        if (existing) {
          get().remove(slug);
          return false;
        }
        get().add(slug);
        return true;
      },
      isFavorite: (slug) => get().entries.some((e) => e.slug === slug),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "yop-favorites-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (s) => ({ entries: s.entries }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function useIsFavorite(slug: string): boolean {
  const hydrated = useFavorites((s) => s.hasHydrated);
  const fav = useFavorites((s) => s.isFavorite(slug));
  return hydrated && fav;
}

export function useFavoritesHydrated(): boolean {
  const hydrated = useFavorites((s) => s.hasHydrated);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted && hydrated;
}
