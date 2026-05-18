import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "靓开源提示词 · 117 条中文 AI 提示词，开箱即用",
    template: "%s · 靓开源提示词",
  },
  description:
    "中文 AI 提示词库的精致前端。覆盖方法、工作、学习、内容、营销、思考等 9 大场景；支持模糊搜索、变量占位符填充、一键复制。",
  keywords: [
    "提示词",
    "AI 提示词",
    "Prompt",
    "中文 Prompt 库",
  ],
  openGraph: {
    title: "靓开源提示词",
    description:
      "117 条中文 AI 提示词，开箱即用。支持搜索、变量填充、一键复制。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <SiteHeader />
          <main className="flex-1 w-full">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
