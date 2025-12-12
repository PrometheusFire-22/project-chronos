'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

/**
 * Theme Provider Wrapper
 *
 * Uses next-themes library for:
 * - Persistent theme storage (localStorage)
 * - SSR-safe hydration (prevents flash of wrong theme)
 * - System preference detection
 *
 * @example
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
