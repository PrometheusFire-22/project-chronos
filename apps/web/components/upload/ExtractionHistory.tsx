'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@chronos/ui/components/sheet'
import { Button } from '@chronos/ui/components/button'
import { Clock, FileText, Loader2 } from 'lucide-react'

interface ExtractionSummary {
  id: string
  fileName: string
  contactCount: number
  caseName: string | null
  createdAt: string
}

interface ExtractionDetail {
  id: string
  fileName: string
  contacts: {
    name: string
    role: string
    firm: string
    email: string | null
    phone: string | null
    address: string | null
  }[]
  document_metadata: {
    case_name: string
    court_file_no: string
    filing_date: string | null
  }
  contactCount: number
}

interface ExtractionHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoadExtraction: (extraction: ExtractionDetail) => void
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export function ExtractionHistory({
  open,
  onOpenChange,
  onLoadExtraction,
}: ExtractionHistoryProps) {
  const [extractions, setExtractions] = useState<ExtractionSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/extractions')
      if (!res.ok) throw new Error('Failed to load history')
      const data = await res.json()
      setExtractions(data.extractions)
    } catch {
      setError('Could not load extraction history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchHistory()
    }
  }, [open, fetchHistory])

  const handleSelect = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/extractions/${id}`)
      if (!res.ok) throw new Error('Failed to load extraction')
      const data: ExtractionDetail = await res.json()
      onLoadExtraction(data)
      onOpenChange(false)
    } catch {
      setError('Could not load extraction details')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex flex-col overflow-hidden">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Extraction History
          </SheetTitle>
          <SheetDescription>
            Your past CCAA contact extractions
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 overflow-y-auto -mx-6 px-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-sm text-red-400">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchHistory}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && extractions.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                Your extraction history will appear here
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Upload a CCAA filing to get started
              </p>
            </div>
          )}

          {!loading && extractions.length > 0 && (
            <div className="space-y-1">
              {extractions.map((ext) => (
                <button
                  key={ext.id}
                  onClick={() => handleSelect(ext.id)}
                  disabled={loadingId === ext.id}
                  className="w-full rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-muted/50 disabled:opacity-60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {ext.caseName || ext.fileName}
                      </p>
                      {ext.caseName && (
                        <p className="truncate text-xs text-muted-foreground">
                          {ext.fileName}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ext.contactCount} contact{ext.contactCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {loadingId === ext.id ? (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(ext.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
