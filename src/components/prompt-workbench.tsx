"use client";

import * as React from "react";
import { AlertTriangle, Eraser, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import type { PromptVariable } from "@/lib/content/types";

interface PromptWorkbenchProps {
  prompt: string;
  variables: PromptVariable[];
}

const TEXTAREA_HINT = /(列表|内容|文本|要求|描述|说明|片段|清单|json|items|list|大纲|总结|背景)/i;
const NOISE_HINT = /(AI[应将自需要从用]|^请[\s\S]|^若[无未]|^自动|^填写|^示例|^例如)/;

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildVarPlaceholder(v: PromptVariable): string {
  return v.kind === "curly" ? `{{${v.name}}}` : `[${v.name}]`;
}

function buildVarRegex(v: PromptVariable): RegExp {
  if (v.kind === "curly") {
    return new RegExp(`\\{\\{\\s*${escapeRegExp(v.name)}\\s*\\}\\}`, "g");
  }
  return new RegExp(`(?<![\\w\`])\\[${escapeRegExp(v.name)}\\](?!\\()`, "g");
}

function isLikelyHint(v: PromptVariable): boolean {
  return v.kind === "bracket" && (NOISE_HINT.test(v.name) || v.name.length > 12);
}

function pickFieldKind(v: PromptVariable): "textarea" | "input" {
  if (TEXTAREA_HINT.test(v.name)) return "textarea";
  if (v.name.length > 16) return "textarea";
  return "input";
}

interface PreviewSegment {
  type: "text" | "var";
  value: string;
  varName?: string;
  filled?: boolean;
}

function buildSegments(
  prompt: string,
  variables: PromptVariable[],
  values: Record<string, string>,
): PreviewSegment[] {
  if (variables.length === 0) return [{ type: "text", value: prompt }];

  const markers: Array<{ start: number; end: number; v: PromptVariable }> = [];
  for (const v of variables) {
    const re = buildVarRegex(v);
    for (const m of prompt.matchAll(re)) {
      if (m.index === undefined) continue;
      markers.push({ start: m.index, end: m.index + m[0].length, v });
    }
  }
  markers.sort((a, b) => a.start - b.start);

  const merged: typeof markers = [];
  for (const m of markers) {
    if (merged.length === 0 || m.start >= merged[merged.length - 1].end) {
      merged.push(m);
    }
  }

  const segments: PreviewSegment[] = [];
  let cursor = 0;
  for (const m of merged) {
    if (m.start > cursor) {
      segments.push({ type: "text", value: prompt.slice(cursor, m.start) });
    }
    const key = `${m.v.kind}:${m.v.name}`;
    const filled = Boolean(values[key]?.length);
    segments.push({
      type: "var",
      value: filled ? values[key] : prompt.slice(m.start, m.end),
      varName: m.v.name,
      filled,
    });
    cursor = m.end;
  }
  if (cursor < prompt.length) {
    segments.push({ type: "text", value: prompt.slice(cursor) });
  }
  return segments;
}

function renderFinalText(
  prompt: string,
  variables: PromptVariable[],
  values: Record<string, string>,
): string {
  let out = prompt;
  for (const v of variables) {
    const key = `${v.kind}:${v.name}`;
    const value = values[key];
    if (!value) continue;
    out = out.replace(buildVarRegex(v), value);
  }
  return out;
}

export function PromptWorkbench({ prompt, variables }: PromptWorkbenchProps) {
  const [values, setValues] = React.useState<Record<string, string>>({});

  const finalText = React.useMemo(
    () => renderFinalText(prompt, variables, values),
    [prompt, variables, values],
  );

  const segments = React.useMemo(
    () => buildSegments(prompt, variables, values),
    [prompt, variables, values],
  );

  const filledCount = React.useMemo(
    () => Object.values(values).filter((v) => v && v.length > 0).length,
    [values],
  );

  const handleClear = () => setValues({});

  if (variables.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            该提示词无占位符，可直接复制使用
          </div>
          <CopyButton text={prompt} variant="accent" />
        </div>
        <PromptPreview segments={segments} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-6">
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-7rem)]">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium">
            变量
            <span className="ml-2 font-mono text-xs text-muted-foreground tabular-nums">
              {filledCount}/{variables.length}
            </span>
          </h2>
          {filledCount > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              <Eraser className="size-3" />
              清空
            </button>
          )}
        </div>

        {variables.length > 20 && (
          <div className="flex gap-2 items-start text-xs text-muted-foreground bg-muted/50 border border-border rounded-md px-3 py-2">
            <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-accent" />
            <span>
              该提示词识别到 {variables.length} 个占位，多数可能是说明文字。建议直接复制后人工编辑。
            </span>
          </div>
        )}

        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">表单填写</TabsTrigger>
            <TabsTrigger value="raw">原始变量</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <VariableFormFields
              variables={variables}
              values={values}
              setValues={setValues}
            />
          </TabsContent>
          <TabsContent value="raw">
            <pre className="text-xs font-mono leading-relaxed bg-muted/30 border border-border rounded-md p-3 overflow-x-auto scrollbar-thin">
              {variables
                .map(
                  (v) =>
                    `${buildVarPlaceholder(v)}${v.occurrences > 1 ? `  × ${v.occurrences}` : ""}`,
                )
                .join("\n")}
            </pre>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>实时预览</span>
            <span className="text-border">·</span>
            <span className="font-mono tabular-nums">
              {finalText.length.toLocaleString("zh-CN")} 字符
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton
              text={prompt}
              label="复制原始"
              variant="outline"
              size="sm"
            />
            <CopyButton
              text={finalText}
              label="复制"
              variant="accent"
              size="sm"
            />
          </div>
        </div>
        <PromptPreview segments={segments} />
      </div>
    </div>
  );
}

interface VariableFormFieldsProps {
  variables: PromptVariable[];
  values: Record<string, string>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

function VariableFormFields({
  variables,
  values,
  setValues,
}: VariableFormFieldsProps) {
  return (
    <div className="space-y-3.5 scrollbar-thin lg:overflow-y-auto lg:max-h-[calc(100vh-16rem)] lg:pr-2 -mr-2">
      {variables.map((v) => {
        const key = `${v.kind}:${v.name}`;
        const hint = isLikelyHint(v);
        const fieldKind = pickFieldKind(v);
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-baseline gap-2 min-w-0">
              <Label htmlFor={key} className="truncate">
                <span className="font-mono text-[10px] text-muted-foreground/70 mr-1.5">
                  {v.kind === "curly" ? "{{" : "["}
                </span>
                <span className={cn(hint && "text-muted-foreground")}>
                  {v.name}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/70 ml-0.5">
                  {v.kind === "curly" ? "}}" : "]"}
                </span>
              </Label>
              {v.occurrences > 1 && (
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums shrink-0">
                  × {v.occurrences}
                </span>
              )}
              {hint && (
                <span
                  title="此占位可能为说明文字，可跳过"
                  className="inline-flex items-center text-muted-foreground"
                >
                  <Info className="size-3" />
                </span>
              )}
            </div>
            {fieldKind === "textarea" ? (
              <Textarea
                id={key}
                value={values[key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={hint ? "（可跳过）" : "输入内容"}
                rows={3}
              />
            ) : (
              <Input
                id={key}
                value={values[key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={hint ? "（可跳过）" : "输入内容"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PromptPreview({ segments }: { segments: PreviewSegment[] }) {
  return (
    <div className="rounded-md border border-border bg-card">
      <pre className="font-mono text-[13px] leading-[1.75] whitespace-pre-wrap break-words p-5 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return <React.Fragment key={i}>{seg.value}</React.Fragment>;
          }
          if (seg.filled) {
            return (
              <mark
                key={i}
                data-filled="true"
                title={seg.varName}
                className="rounded-sm"
              >
                {seg.value}
              </mark>
            );
          }
          return (
            <mark key={i} title={`未填：${seg.varName}`} className="rounded-sm">
              {seg.value}
            </mark>
          );
        })}
      </pre>
    </div>
  );
}
