import Link from "next/link";
import { Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

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
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="查看本项目的 GitHub 仓库"
          title="本项目 GitHub"
        >
          <a
            href="https://github.com/rayhyattgoogel-glitch/liang-prompts"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Github className="size-4" />
          </a>
        </Button>
      </div>
    </header>
  );
}
