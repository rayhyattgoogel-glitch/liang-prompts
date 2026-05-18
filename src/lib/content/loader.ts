import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { extractIntro, extractPromptBody } from "./parsePrompt";
import { extractVariables } from "./extractVars";
import type { CategoryMeta, PromptRecord, PromptStatus } from "./types";

const CONTENT_ROOT = path.resolve(process.cwd(), "content/yao-open-prompts");
const PROMPTS_ROOT = path.join(CONTENT_ROOT, "prompts");

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "01-ai-methods",
    name: "AI 方法",
    count: 0,
    description: "元提示词、反编译、网页逆向和提示词工程方法",
  },
  {
    slug: "02-ai-work",
    name: "AI 工作",
    count: 0,
    description: "企业、合同、销售、客服、产品原型、PPT、网页等生产力场景",
  },
  {
    slug: "03-ai-learning",
    name: "AI 学习",
    count: 0,
    description: "学习方法、记忆术、费曼提问、习惯养成和学习助理",
  },
  {
    slug: "04-ai-life",
    name: "AI 生活",
    count: 0,
    description: "健康、亲子歌曲等生活场景",
  },
  {
    slug: "05-ai-education",
    name: "AI 教育",
    count: 0,
    description: "儿童教育、互动学习页面和小游戏创作",
  },
  {
    slug: "06-ai-content",
    name: "AI 内容",
    count: 0,
    description: "写作、润色、标题、公众号 HTML、短视频、运营、图像、PPT 创意",
  },
  {
    slug: "07-ai-coding",
    name: "AI 编程",
    count: 0,
    description: "架构设计和编程协作",
  },
  {
    slug: "08-ai-marketing",
    name: "AI 营销",
    count: 0,
    description: "GEO 内容生成、结构化数据、信源建设、数据监测、增长诊断、合规",
  },
  {
    slug: "09-ai-thinking",
    name: "AI 思考",
    count: 0,
    description: "批判思维、记忆、标题和思维类灵感提示词",
  },
];

let cache: PromptRecord[] | null = null;

export function loadAllPrompts(): PromptRecord[] {
  if (cache) return cache;

  if (!fs.existsSync(PROMPTS_ROOT)) {
    console.warn(
      `[loader] Submodule not initialized at ${PROMPTS_ROOT}. ` +
        `Run: git submodule update --init --recursive`,
    );
    cache = [];
    return cache;
  }

  const files = fg.sync("**/*.md", {
    cwd: PROMPTS_ROOT,
    absolute: true,
    ignore: ["README.md", "**/README.md"],
  });

  const records: PromptRecord[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const relativePath = path.relative(PROMPTS_ROOT, file);
    const slug = path.basename(file, ".md");
    const segments = relativePath.split(path.sep);
    const categorySlug = segments[0];

    const raw = fs.readFileSync(file, "utf-8");
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;

    const promptBody = extractPromptBody(parsed.content);
    if (!promptBody) {
      skipped.push(relativePath);
      continue;
    }

    const intro = extractIntro(parsed.content);
    const variables = extractVariables(promptBody);

    const rawTags = fm.tags;
    const tags =
      typeof rawTags === "string"
        ? rawTags
            .split(/[,，]\s*/)
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(rawTags)
          ? rawTags.map(String)
          : [];

    records.push({
      slug,
      category: typeof fm.category === "string" ? fm.category : "",
      categorySlug,
      subcategory:
        typeof fm.subcategory === "string" ? fm.subcategory : "",
      title: typeof fm.title === "string" ? fm.title : slug,
      author: typeof fm.author === "string" ? fm.author : "",
      version: typeof fm.version === "string" ? fm.version : "",
      created: typeof fm.created === "string" ? fm.created : "",
      status:
        (typeof fm.status === "string"
          ? (fm.status as PromptStatus)
          : "active") ?? "active",
      tags,
      sourceSection:
        typeof fm.source_section === "string" ? fm.source_section : undefined,
      intro,
      prompt: promptBody,
      variables,
      relativePath: `prompts/${relativePath}`,
    });
  }

  if (skipped.length > 0) {
    console.warn(
      `[loader] Skipped ${skipped.length} file(s) without parseable Prompt body:\n` +
        skipped.map((s) => `  - ${s}`).join("\n"),
    );
  }

  records.sort((a, b) => {
    if (a.categorySlug !== b.categorySlug)
      return a.categorySlug.localeCompare(b.categorySlug);
    if (a.created !== b.created) return b.created.localeCompare(a.created);
    return a.title.localeCompare(b.title, "zh-CN");
  });

  cache = records;
  return records;
}

export function loadPromptBySlug(slug: string): PromptRecord | undefined {
  return loadAllPrompts().find((p) => p.slug === slug);
}

export function loadCategoriesWithCounts(): CategoryMeta[] {
  const prompts = loadAllPrompts();
  return CATEGORIES.map((c) => ({
    ...c,
    count: prompts.filter((p) => p.categorySlug === c.slug).length,
  }));
}

export function loadPromptsByCategory(categorySlug: string): PromptRecord[] {
  return loadAllPrompts().filter((p) => p.categorySlug === categorySlug);
}

export function loadFeaturedPrompts(limit = 6): PromptRecord[] {
  const all = loadAllPrompts();
  const featured = all.filter((p) => p.tags.includes("重点推荐"));
  if (featured.length >= limit) return featured.slice(0, limit);

  const merged = [...featured];
  for (const p of all) {
    if (merged.length >= limit) break;
    if (!merged.find((m) => m.slug === p.slug)) merged.push(p);
  }
  return merged.slice(0, limit);
}
