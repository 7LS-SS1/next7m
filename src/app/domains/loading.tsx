// src/app/domains/loading.tsx
export default function LoadingDomains() {
  return (
    <div className="grid gap-4">
      {/* Header + Search (skeleton) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-7 w-40 rounded-xl bg-white/10 animate-pulse" />
        <div className="flex gap-2">
          <div className="flex gap-2">
            <div className="h-10 w-56 rounded-xl bg-white/10 animate-pulse" />
            <div className="h-10 w-24 rounded-xl bg-white/10 animate-pulse" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Table (skeleton) */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-white/5 h-10 w-full animate-pulse" />
        <div className="divide-y divide-white/10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 px-3 py-3">
              <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
              <div className="h-5 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-5 w-56 rounded bg-white/10 animate-pulse" />
              <div className="flex justify-end gap-2">
                <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
                <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}