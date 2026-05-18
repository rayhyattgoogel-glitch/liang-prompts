import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border mt-16">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row gap-3 md:gap-6 items-start md:items-center text-xs text-muted-foreground">
        <div>
          提示词内容 © 姚金刚 · CC BY 4.0
        </div>
        <div className="hidden md:block">·</div>
        <div>本站为非官方中文镜像 · 内容每日自动同步</div>
        <div className="flex-1" />
        <Link
          href="/about"
          className="hover:text-foreground transition-colors"
        >
          关于本站
        </Link>
      </div>
    </footer>
  );
}
