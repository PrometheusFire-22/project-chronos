import { Skeleton } from '@chronos/ui/components/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header — mirrors the gradient title + subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-40 mb-2 rounded-lg" />
          <Skeleton className="h-5 w-72 rounded" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Card — matches avatar + name/email + status rows */}
        <div className="w-full rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-6 flex flex-col gap-6 relative overflow-hidden">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-52 rounded" />
            </div>
          </div>

          {/* Status rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Usage Analytics Card — matches title + 2x2 metric grid + quick actions */}
        <div className="w-full rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-6 flex flex-col relative overflow-hidden">
          {/* Title row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-6 w-36 rounded" />
            </div>
            <Skeleton className="h-4 w-24 rounded" />
          </div>

          {/* Metric boxes — 2-column grid like the real page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PDF Uploads */}
            <div className="p-4 rounded-xl bg-background/50 border border-border">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="w-4 h-4 rounded" />
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <Skeleton className="h-7 w-8 rounded" />
                <Skeleton className="h-4 w-10 rounded" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>

            {/* Total Pages */}
            <div className="p-4 rounded-xl bg-background/50 border border-border">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="w-4 h-4 rounded" />
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <Skeleton className="h-7 w-8 rounded" />
                <Skeleton className="h-4 w-14 rounded" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>

            {/* Queries */}
            <div className="p-4 rounded-xl bg-background/50 border border-border">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="w-4 h-4 rounded" />
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <Skeleton className="h-7 w-8 rounded" />
                <Skeleton className="h-4 w-10 rounded" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Skeleton className="h-4 w-24 rounded mb-4" />
            <Skeleton className="h-10 w-56 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
