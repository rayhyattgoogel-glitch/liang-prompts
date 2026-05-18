const PROMPT_FENCE_RE =
  /^## Prompt\s*\n(`{3,})([a-zA-Z0-9_-]*)\n([\s\S]*?)\n\1\s*$/m;

const INTRO_RE = /^## 简介\s*\n([\s\S]*?)(?=\n## |\n#\s|$)/m;

export function extractPromptBody(markdown: string): string {
  const match = markdown.match(PROMPT_FENCE_RE);
  if (!match) return "";
  return match[3].trim();
}

export function extractIntro(markdown: string): string {
  const match = markdown.match(INTRO_RE);
  if (!match) return "";
  return match[1]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}
