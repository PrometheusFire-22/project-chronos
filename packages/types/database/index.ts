/**
 * Database-related type definitions
 */

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
}

export interface QueryResult<T = unknown> {
  rows: T[]
  rowCount: number
  command: string
}
