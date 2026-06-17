import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted-foreground/10 ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-32" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full bg-card rounded-2xl border border-border/50 overflow-hidden">
    <div className="border-b border-border/50 p-4 flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-8 w-32 rounded-full" />
    </div>
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-border/30">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4 h-[350px]">
    <div className="flex justify-between items-center">
      <div>
        <Skeleton className="h-5 w-40 mb-1" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
    <div className="flex-1 flex items-end gap-3 pb-4">
      <Skeleton className="h-[20%] w-full" />
      <Skeleton className="h-[45%] w-full" />
      <Skeleton className="h-[30%] w-full" />
      <Skeleton className="h-[75%] w-full" />
      <Skeleton className="h-[50%] w-full" />
      <Skeleton className="h-[80%] w-full" />
      <Skeleton className="h-[95%] w-full" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row gap-8">
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="w-32 h-32 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);
