

// Path: src/app/profile/loading.tsx

export default function Loading() {
  return (
    <main className="mx-auto w-[92%] max-w-5xl space-y-6 p-6 animate-pulse">
      <div className="h-8 w-40 rounded-lg bg-white/10" />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 rounded bg-white/10" />
              <div className="h-4 w-60 rounded bg-white/10" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="h-6 rounded bg-white/10" />
                <div className="h-6 rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-8 w-full rounded bg-white/10" />
          <div className="h-8 w-full rounded bg-white/10" />
          <div className="h-8 w-full rounded bg-white/10" />
        </div>
      </section>

      <section className="space-y-3">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="h-16 rounded-xl bg-white/10" />
          <div className="h-16 rounded-xl bg-white/10" />
        </div>
      </section>

      <section className="space-y-3">
        <div className="h-4 w-40 rounded bg-white/10" />
        <div className="h-24 rounded-xl bg-white/10" />
      </section>
    </main>
  )
}