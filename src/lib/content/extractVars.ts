import type { PromptVariable } from "./types";

const CURLY_RE = /\{\{\s*([^}\n]+?)\s*\}\}/g;
const BRACKET_RE = /(?<![\w`!])\[([^\[\]\n]{1,40})\](?!\()/g;

const NOISE_PATTERNS = [
  /^\d+$/,
  /^\s*$/,
  /^[a-z\-]+\s*=/i,
  /^[xX×✓✗√!@#$%^&*]+$/,
];

function shouldDrop(name: string): boolean {
  return NOISE_PATTERNS.some((re) => re.test(name));
}

export function extractVariables(prompt: string): PromptVariable[] {
  const map = new Map<string, PromptVariable>();

  for (const m of prompt.matchAll(CURLY_RE)) {
    const name = m[1].trim();
    if (!name || shouldDrop(name)) continue;
    const key = `curly:${name}`;
    const existing = map.get(key);
    if (existing) existing.occurrences += 1;
    else map.set(key, { name, kind: "curly", occurrences: 1 });
  }

  for (const m of prompt.matchAll(BRACKET_RE)) {
    const name = m[1].trim();
    if (!name || shouldDrop(name)) continue;
    const key = `bracket:${name}`;
    const existing = map.get(key);
    if (existing) existing.occurrences += 1;
    else map.set(key, { name, kind: "bracket", occurrences: 1 });
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "curly" ? -1 : 1;
    return b.occurrences - a.occurrences;
  });
}
