export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-xs bg-slate-200/80 ${className}`}
    />
  );
}

export function PageHeaderSkeleton({ hasAction = true }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-48 sm:w-64" />
        <Skeleton className="h-3.5 w-72 sm:w-96" />
      </div>
      {hasAction && <Skeleton className="h-8 w-32 rounded-sm" />}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xs" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-2.5 w-28" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-2xs">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <Skeleton className="h-8 w-60 rounded-xs" />
        <Skeleton className="h-8 w-28 rounded-xs" />
      </div>

      {/* Table Header */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-3.5 ${i === 0 ? 'w-10' : i === 1 ? 'w-40' : 'w-24'} mr-4`}
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center px-4 py-3">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-3.5 ${
                  c === 0 ? 'w-8' : c === 1 ? 'w-48' : c === cols - 1 ? 'w-16' : 'w-20'
                } mr-4`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton hasAction={false} />

      {/* 4 Stat Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Champion Recommendation Card */}
      <div className="mb-4 rounded-sm border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <Skeleton className="h-9 w-36 rounded-sm" />
        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2"
          >
            <Skeleton className="h-7 w-7 rounded-xs" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalculationSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton />

      {/* Dual Panel Configuration */}
      <div className="mb-4 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="space-y-3 rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full rounded-xs" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-xs" />
            <Skeleton className="h-6 w-20 rounded-xs" />
            <Skeleton className="h-6 w-20 rounded-xs" />
          </div>
        </div>
        <div className="space-y-3 rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-full rounded-xs" />
            <Skeleton className="h-7 w-full rounded-xs" />
            <Skeleton className="h-7 w-full rounded-xs" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton />

      {/* Dual Panel Compare Selector */}
      <div className="mb-4 grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs lg:col-span-4 space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-full rounded-xs" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xs" />
            ))}
          </div>
        </div>
        <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs lg:col-span-8 space-y-3">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-14 w-full rounded-xs" />
          <Skeleton className="h-28 w-full rounded-xs" />
        </div>
      </div>

      <TableSkeleton rows={7} cols={4} />
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton />

      {/* Top Champion Card */}
      <div className="mb-4 rounded-sm border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-44 rounded-sm" />
        </div>
      </div>

      {/* Ranking Table */}
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}


