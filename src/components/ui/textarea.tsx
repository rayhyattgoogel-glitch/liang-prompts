import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors",
      "placeholder:text-muted-foreground/60",
      "focus-visible:outline-none focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "font-mono text-[13.5px] leading-relaxed scrollbar-thin",
      "min-h-[72px]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
