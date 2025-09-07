

// src/app/dashboard/loading.tsx

export default function LoadingDashboard() {
  return (
    <main className="w-[95%] mx-auto p-4 lg:p-6 space-y-6">
      {/* Top summary skeleton */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-sm"
          >
            <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
            <div className="mt-4 h-8 w-32 rounded bg-white/10 animate-pulse" />
            <div className="mt-3 h-3 w-20 rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </section>

      {/* Charts / secondary cards skeleton */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
            <div className="h-8 w-24 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="mt-4 h-64 rounded-xl bg-white/5 animate-pulse" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="h-5 w-28 rounded bg-white/10 animate-pulse" />
          <ul className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-40 rounded bg-white/10 animate-pulse" />
                  <div className="mt-2 h-3 w-24 rounded bg-white/10 animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Table skeleton */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <div className="h-5 w-44 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="divide-y divide-white/5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 p-4">
              <div className="col-span-4 h-4 rounded bg-white/10 animate-pulse" />
              <div className="col-span-3 h-4 rounded bg-white/10 animate-pulse" />
              <div className="col-span-3 h-4 rounded bg-white/10 animate-pulse" />
              <div className="col-span-2 h-4 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}