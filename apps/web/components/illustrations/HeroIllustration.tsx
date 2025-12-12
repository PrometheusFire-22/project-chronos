'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

/**
 * Hero Illustration Component
 *
 * Theme-aware illustration that automatically switches between
 * light and dark variants based on the current theme.
 *
 * Features:
 * - Automatic theme detection
 * - SSR-safe (prevents hydration mismatch)
 * - Optimized with Next.js Image component
 * - Responsive sizing
 *
 * @example
 * <HeroIllustration />
 */
export function HeroIllustration() {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Return placeholder during SSR
    return (
      <div className="w-full aspect-video bg-muted animate-pulse rounded-lg" />
    )
  }

  // Determine which theme is active
  const currentTheme = theme === 'system' ? systemTheme : theme
  const illustrationSrc = currentTheme === 'dark' 
    ? '/illustrations/hero-dark.svg'
    : '/illustrations/hero-light.svg'

  return (
    <div className="relative w-full aspect-video">
      <Image
        src={illustrationSrc}
        alt="Abstract geometric composition representing multi-modal data architecture"
        fill
        className="object-contain"
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
      />
    </div>
  )
}
