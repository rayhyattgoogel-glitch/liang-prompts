export type PromptStatus = "active" | "draft" | "third-party-review";

export interface PromptVariable {
  name: string;
  kind: "curly" | "bracket";
  occurrences: number;
}

export interface PromptRecord {
  slug: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  title: string;
  author: string;
  version: string;
  created: string;
  status: PromptStatus;
  tags: string[];
  sourceSection?: string;
  intro: string;
  prompt: string;
  variables: PromptVariable[];
  relativePath: string;
}

export interface CategoryMeta {
  slug: string;
  name: string;
  count: number;
  description: string;
}

export interface PromptIndexItem {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  tags: string[];
  intro: string;
  version: string;
  variableCount: number;
  isFeatured: boolean;
}

export interface PromptIndex {
  generatedAt: string;
  total: number;
  categories: CategoryMeta[];
  items: PromptIndexItem[];
}
