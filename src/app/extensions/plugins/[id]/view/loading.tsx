export default function Loading() {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-6 space-y-4">
      <div className="animate-pulse rounded-xl border p-6 bg-white/10">
        <div className="h-6 w-2/3 bg-white/10/30 rounded" />
        <div className="mt-3 h-4 w-1/3 bg-white/10/30 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border p-4 bg-white/10">
            <div className="h-4 w-1/2 bg-white/10/30 rounded" />
            <div className="mt-2 h-4 w-2/3 bg-white/10/30 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 animate-pulse rounded-xl border p-5 bg-white/10 h-52" />
        <div className="animate-pulse rounded-xl border p-5 bg-white/10 h-52" />
      </div>
    </div>
  );
}