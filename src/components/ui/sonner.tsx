"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme as ToasterProps["theme"]}
      richColors={false}
      closeButton={false}
      duration={2400}
      {...props}
    />
  );
}
