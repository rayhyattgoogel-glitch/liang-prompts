import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link
          href="/"
          className="flex items-baseline gap-2.5 font-serif-display text-[17px] tracking-tight hover:text-accent transition-colors"
        >
          <span className="text-accent">靓</span>
          <span>开源提示词</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
          <Link
            href="/#categories"
            className="hover:text-foreground transition-colors"
          >
            分类
          </Link>
          <Link
            href="/favorites"
            className="hover:text-foreground transition-colors"
          >
            收藏
          </Link>
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            关于
          </Link>
        </nav>

        <div className="flex-1" />

        <ThemeToggle />
      </div>
    </header>
  );
}
