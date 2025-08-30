// src/app/domains/loading.tsx
export default function LoadingDomains() {
  return (
    <div className="grid gap-4">
      {/* Header + Search (skeleton) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Title */}
        <div className="h-7 w-44 rounded-xl bg-white/10 animate-pulse" />

        {/* Right controls: search + filters + create */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <div className="h-10 w-64 rounded-xl bg-white/10 animate-pulse" />
            <div className="h-10 w-28 rounded-xl bg-white/10 animate-pulse" />
            <div className="h-10 w-28 rounded-xl bg-white/10 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Table (skeleton) */}
      <div className="card p-0 overflow-hidden">
        {/* Table header row */}
        <div className="grid grid-cols-6 gap-3 bg-white/5 px-3 py-2">
          <div className="h-5 w-24 rounded bg-white/10 animate-pulse" />
          <div className="h-5 w-28 rounded bg-white/10 animate-pulse" />
          <div className="h-5 w-24 rounded bg-white/10 animate-pulse" />
          <div className="h-5 w-24 rounded bg-white/10 animate-pulse" />
          <div className="h-5 w-20 rounded bg-white/10 animate-pulse" />
          <div className="h-5 w-16 rounded bg-white/10 animate-pulse justify-self-end" />
        </div>

        <div className="divide-y divide-white/10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-3 px-3 py-3 items-center">
              {/* Domain */}
              <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />

              {/* สถานะ + Status (2 chips stacked) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-12 rounded-full bg-green-400/30 animate-pulse" />
                  <div className="h-4 w-16 rounded-full bg-green-400/20 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-10 rounded-full bg-green-400/30 animate-pulse" />
                  <div className="h-4 w-10 rounded-full bg-white/10 animate-pulse" />
                </div>
              </div>

              {/* ทีม + Type */}
              <div className="flex flex-col gap-2">
                <div className="h-5 w-24 rounded-full bg-cyan-400/20 animate-pulse" />
                <div className="h-5 w-16 rounded-full bg-white/10 animate-pulse" />
              </div>

              {/* Host + Type */}
              <div className="flex flex-col gap-2">
                <div className="h-5 w-16 rounded-full bg-white/10 animate-pulse" />
                <div className="h-5 w-24 rounded-full bg-white/10 animate-pulse" />
              </div>

              {/* หมายเหตุ */}
              <div className="h-5 w-24 rounded bg-white/10 animate-pulse" />

              {/* Actions */}
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