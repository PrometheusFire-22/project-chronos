/**
 * Application-wide constants
 */

export const APP_NAME = 'Project Chronos'
export const APP_DESCRIPTION = 'Multi-modal relationship intelligence platform for private markets'

export const API_VERSION = 'v1'
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

export const DATE_FORMATS = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
  FULL: 'full',
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  CLIENT: 'client',
} as const
