/**
 * Common types used across Project Chronos applications
 */

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'client'
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  data: T
  error?: string
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    hasMore?: boolean
  }
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }
