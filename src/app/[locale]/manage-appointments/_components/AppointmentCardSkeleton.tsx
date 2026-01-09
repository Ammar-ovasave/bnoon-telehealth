"use client";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className ?? ""}`} />;
}

export default function AppointmentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Appointment Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex flex-col md:flex-row items-center gap-3 mb-2 md:mb-0">
          {/* Status badge skeleton */}
          <Skeleton className="h-7 w-32 rounded-full" />
          {/* Confirmation number skeleton */}
          <Skeleton className="h-4 w-40" />
        </div>
        {/* Action buttons skeleton */}
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* Appointment Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Appointment Info */}
        <div className="space-y-4">
          {/* Section title */}
          <Skeleton className="h-6 w-40 mb-3" />
          <div className="space-y-3">
            {/* Date/Time row */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-[30px] w-[22px]" />
              <div className="flex-1">
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
            {/* Doctor row */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-[30px] w-[22px]" />
              <div className="flex-1">
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            {/* Service row */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-[30px] w-[22px]" />
              <div className="flex-1">
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            {/* Location row */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-[30px] w-[22px]" />
              <div className="flex-1">
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Patient Info */}
        <div className="space-y-4">
          {/* Section title */}
          <Skeleton className="h-6 w-44 mb-3" />
          <div className="space-y-3">
            {/* Full name */}
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-5 w-36" />
            </div>
            {/* Email */}
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-5 w-48" />
            </div>
            {/* Phone */}
            <div>
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-5 w-32" />
            </div>
            {/* Nationality */}
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
