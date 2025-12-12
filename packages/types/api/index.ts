/**
 * API-related type definitions
 * These should match the FastAPI backend contracts
 */

export interface ClientMetrics {
  clientId: string
  revenue: number
  churnRisk: number
  timeSeries: TimeSeriesPoint[]
}

export interface TimeSeriesPoint {
  timestamp: string
  value: number
  label?: string
}

export interface GraphNode {
  id: string
  type: string
  properties: Record<string, unknown>
}

export interface GraphEdge {
  source: string
  target: string
  type: string
  weight?: number
}
