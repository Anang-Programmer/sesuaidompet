
/* =========================================
   SESUAIDOMPET — LOADING SKELETON
========================================= */

const SKELETON_BASE =
  'animate-pulse rounded-xl bg-gradient-to-r from-[#e8f0e9] via-[#f4f8f4] to-[#e8f0e9]';

/* =========================================
   SKELETON DASAR
========================================= */
export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`${SKELETON_BASE} ${className}`}
    />
  );
}

/* =========================================
   PAGE HEADER
========================================= */
export function PageHeaderSkeleton({ hasAction = true }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-28 rounded-lg" />
        <Skeleton className="h-8 w-48 max-w-full sm:w-64" />
        <Skeleton className="h-3.5 w-full max-w-md" />
      </div>

      {hasAction && (
        <Skeleton className="h-10 w-full rounded-xl sm:w-36" />
      )}
    </div>
  );
}

/* =========================================
   STAT CARD
========================================= */
export function StatCardSkeleton() {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[20px] border border-[#e1ebe2] bg-white p-4 shadow-[0_5px_18px_rgba(30,70,40,0.025)]">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-20 max-w-full" />
        <Skeleton className="h-6 w-16 max-w-full rounded-lg" />
        <Skeleton className="h-2.5 w-28 max-w-full rounded-lg" />
      </div>
    </div>
  );
}

/* =========================================
   TABLE SKELETON
========================================= */
export function TableSkeleton({
  rows = 5,
  cols = 5,
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#e1ebe2] bg-white shadow-[0_5px_18px_rgba(30,70,40,0.025)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e6eee7] p-4">
        <Skeleton className="h-4 w-40 max-w-[55%]" />
        <Skeleton className="h-8 w-24 shrink-0 rounded-xl" />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="flex items-center gap-5 border-b border-[#e6eee7] bg-[#f6faf6] px-4 py-3">
            {Array.from({ length: cols }).map((_, index) => (
              <Skeleton
                key={index}
                className={`h-3 shrink-0 ${
                  index === 0
                    ? 'w-10'
                    : index === 1
                      ? 'w-40'
                      : 'w-24'
                }`}
              />
            ))}
          </div>

          <div className="divide-y divide-[#edf2ed]">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex items-center gap-5 px-4 py-4"
              >
                {Array.from({ length: cols }).map((__, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className={`h-3 shrink-0 ${
                      colIndex === 0
                        ? 'w-8'
                        : colIndex === 1
                          ? 'w-48'
                          : colIndex === cols - 1
                            ? 'w-16'
                            : 'w-20'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   DASHBOARD
========================================= */
export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton hasAction={false} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="rounded-[24px] border border-[#e1ebe2] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-64 max-w-full" />
            <Skeleton className="h-3.5 w-full max-w-lg" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>

          <Skeleton className="hidden h-28 w-28 shrink-0 rounded-[24px] sm:block" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[20px] border border-[#e1ebe2] bg-white p-4"
          >
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="mt-4 h-4 w-32 max-w-full" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================
   PROSES PERHITUNGAN
========================================= */
export function CalculationSkeleton() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-[22px] border border-[#e1ebe2] bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-full max-w-xs" />
              </div>
            </div>

            <Skeleton className="h-10 w-full rounded-xl" />

            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((__, item) => (
                <Skeleton
                  key={item}
                  className="h-10 rounded-xl"
                />
              ))}
            </div>

            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ))}
      </div>

      <TableSkeleton rows={5} cols={6} />
    </div>
  );
}

/* =========================================
   BANDINGKAN SMARTPHONE
========================================= */
export function CompareSkeleton() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-3 rounded-[22px] border border-[#e1ebe2] bg-white p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-full rounded-xl" />

          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-14 w-full rounded-xl"
            />
          ))}
        </div>

        <div className="space-y-3 rounded-[22px] border border-[#e1ebe2] bg-white p-4">
          <Skeleton className="h-4 w-48" />

          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-40 min-w-[210px] flex-1 rounded-2xl"
              />
            ))}
          </div>

          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>

      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}

/* =========================================
   HASIL DAN RANKING
========================================= */
export function ResultsSkeleton() {
  return (
    <div className="space-y-5">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="space-y-4 rounded-[24px] border border-[#e1ebe2] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-40 max-w-full" />
            <Skeleton className="h-6 w-64 max-w-full" />
            <Skeleton className="h-3 w-36 max-w-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-[68px] rounded-xl"
            />
          ))}
        </div>
      </div>

      <TableSkeleton rows={6} cols={5} />

      <div className="rounded-[22px] border border-[#e1ebe2] bg-white p-5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-3 h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}
