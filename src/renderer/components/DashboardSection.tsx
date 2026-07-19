import { Suspense, ReactNode } from 'react';

interface DashboardSectionProps {
  title?: string;
  fallback?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-7 bg-gray-200 rounded w-20" />
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-28 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSection({
  title,
  fallback,
  children,
  className = '',
}: DashboardSectionProps) {
  return (
    <Suspense
      fallback={
        fallback ?? (
          <div className={`animate-pulse ${className}`}>
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            <div className="card">
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

export { SectionSkeleton, KpiSkeleton, StatCardSkeleton, ActivitySkeleton };
