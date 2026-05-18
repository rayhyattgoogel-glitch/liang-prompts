import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-none transition-colors",
      "placeholder:text-muted-foreground/60",
      "focus-visible:outline-none focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "font-mono text-[13.5px]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
