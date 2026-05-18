import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-1.5 py-0 font-medium text-xs leading-5 transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-border bg-muted text-muted-foreground hover:bg-muted/80",
        accent:
          "border-accent/30 bg-accent/10 text-accent",
        outline: "border-border bg-transparent text-muted-foreground",
        solid:
          "border-transparent bg-foreground text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
