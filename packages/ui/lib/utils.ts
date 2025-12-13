import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with proper precedence
 * 
 * This utility combines clsx (for conditional classes) with tailwind-merge
 * (for proper Tailwind class deduplication and precedence).
 * 
 * Used by all shadcn/ui components for className composition.
 * 
 * @example
 * cn("px-4 py-2", "bg-blue-500", { "text-white": isActive })
 * // Returns: "px-4 py-2 bg-blue-500 text-white" (if isActive is true)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
