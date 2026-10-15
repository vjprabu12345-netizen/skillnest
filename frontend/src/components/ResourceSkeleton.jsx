import React from 'react';

export default function ResourceSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-card rounded-2xl overflow-hidden border border-slate-800 animate-pulse flex flex-col"
        >
          {/* Thumbnail skeleton */}
          <div className="h-44 bg-slate-800/60 w-full" />

          {/* Content skeleton */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="h-5 bg-slate-800 rounded w-3/4" />
              <div className="h-3.5 bg-slate-800/60 rounded w-full" />
              <div className="h-3.5 bg-slate-800/60 rounded w-4/5" />
              <div className="flex gap-2 pt-2">
                <div className="h-4 bg-slate-800/40 rounded w-16" />
                <div className="h-4 bg-slate-800/40 rounded w-16" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <div className="h-4 bg-slate-800 rounded w-20" />
              <div className="h-4 bg-slate-800 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
