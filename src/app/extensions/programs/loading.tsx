// src/app/extensions/programs/loading.tsx
export default function LoadingPrograms() {
  return (
    <div className="grid gap-4">
      <div className="h-7 w-40 rounded bg-white/10 animate-pulse" />
      <div className="grid gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 flex gap-3">
            <div className="size-14 rounded-xl bg-white/10 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-4 w-1/3 bg-white/10 rounded animate-pulse" />
              <div className="mt-2 h-3 w-2/3 bg-white/10 rounded animate-pulse" />
              <div className="mt-3 h-8 w-40 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}