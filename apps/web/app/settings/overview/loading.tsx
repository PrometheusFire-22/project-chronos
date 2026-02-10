import { Skeleton } from "@chronos/ui/components/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Card Skeleton */}
        <div className="w-full h-[220px] rounded-2xl border border-border bg-card/50 p-6 flex flex-col gap-6 relative overflow-hidden">
            <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <div className="space-y-3">
                 <Skeleton className="h-12 w-full rounded-lg" />
                 <Skeleton className="h-12 w-full rounded-lg" />
            </div>
        </div>

        {/* Usage Analytics Skeleton */}
        <div className="w-full h-[300px] rounded-2xl border border-border bg-card/50 p-6 flex flex-col justify-between">
             <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-24" />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl sm:col-span-2" />
             </div>
        </div>
      </div>
    </div>
  )
}
