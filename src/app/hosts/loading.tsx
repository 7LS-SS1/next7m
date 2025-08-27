// src/app/hosts/loading.tsx
export default function LoadingHosts() {
  return (
    <div className="grid gap-4">
      {/* Header + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-7 w-48 rounded-xl bg-white/10 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-32 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-10 w-28 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/10 animate-pulse" />
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-white/5 h-10 w-full animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 px-3 py-3 border-t border-white/10">
            <div className="h-5 w-32 rounded bg-white/10 animate-pulse" />
            <div className="h-5 w-32 rounded bg-white/10 animate-pulse" />
            <div className="h-5 w-32 rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}