"use client";

import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider simplified - dark mode disabled
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}

