"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast:
              "!font-sans !text-sm !bg-card !text-foreground !border !border-border !rounded-md",
            description: "!text-muted-foreground",
            actionButton: "!bg-accent !text-accent-foreground",
          },
        }}
      />
    </NextThemesProvider>
  );
}
