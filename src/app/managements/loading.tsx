// src/app/managements/loading.tsx
export default function LoadingManagements() {
  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-7 w-56 rounded-xl bg-white/10 animate-pulse" />
        <div className="h-10 w-28 rounded-xl bg-white/10 animate-pulse" />
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/10 animate-pulse" />
        ))}
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-0 overflow-hidden">
            <div className="bg-white/5 h-10 w-full animate-pulse" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="grid grid-cols-3 gap-3 px-3 py-3 border-t border-white/10">
                <div className="h-5 w-32 rounded bg-white/10 animate-pulse" />
                <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
                <div className="h-5 w-24 rounded bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}