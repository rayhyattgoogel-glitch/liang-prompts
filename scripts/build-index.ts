import fs from "node:fs";
import path from "node:path";
import {
  loadAllPrompts,
  loadCategoriesWithCounts,
} from "../src/lib/content/loader";
import type {
  PromptIndex,
  PromptIndexItem,
} from "../src/lib/content/types";

const OUT = path.resolve(process.cwd(), "public/data/index.json");

function truncate(text: string, max = 140): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, max - 1) + "…";
}

function main() {
  const prompts = loadAllPrompts();

  if (prompts.length === 0) {
    console.warn(
      "[build-index] No prompts loaded; skipping index generation. " +
        "Ensure the submodule is initialized.",
    );
    return;
  }

  const items: PromptIndexItem[] = prompts.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    categorySlug: p.categorySlug,
    subcategory: p.subcategory,
    tags: p.tags,
    intro: truncate(p.intro),
    version: p.version,
    variableCount: p.variables.length,
    isFeatured: p.tags.includes("重点推荐"),
  }));

  const index: PromptIndex = {
    generatedAt: new Date().toISOString(),
    total: items.length,
    categories: loadCategoriesWithCounts(),
    items,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(index, null, 2), "utf-8");

  const sizeKb = (fs.statSync(OUT).size / 1024).toFixed(1);
  const featuredCount = items.filter((i) => i.isFeatured).length;
  const withVarsCount = items.filter((i) => i.variableCount > 0).length;

  console.log(
    `✓ Built index → ${path.relative(process.cwd(), OUT)} (${sizeKb} KB)\n` +
      `  prompts: ${items.length}\n` +
      `  featured: ${featuredCount}\n` +
      `  with variables: ${withVarsCount}`,
  );
}

main();
