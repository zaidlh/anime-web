import React from 'react';
import { cn } from '../lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-container-high", className)}
      {...props}
    />
  );
}

export function SkeletonPosterGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2 gap-y-6 md:gap-x-4 md:gap-y-8 pb-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[2/3] rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded mt-1" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] bg-surface-container-high animate-pulse flex items-center p-6 md:p-12 mb-8 md:mb-12">
      <div className="w-full max-w-2xl mt-auto z-10 flex flex-col gap-4">
        <Skeleton className="h-12 w-3/4 bg-surface-container-highest rounded" />
        <Skeleton className="h-4 w-full bg-surface-container-highest rounded mt-4" />
        <Skeleton className="h-4 w-5/6 bg-surface-container-highest rounded" />
        <div className="flex gap-4 mt-6">
          <Skeleton className="h-12 w-32 bg-primary/40 rounded-full" />
          <Skeleton className="h-12 w-32 bg-surface-container-highest rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonEpisodeGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="w-full aspect-video rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
