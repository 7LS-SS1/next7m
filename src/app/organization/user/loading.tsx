export default function Loading() {
  return (
    <main className="mx-auto w-[92%] max-w-5xl space-y-6 p-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-white/10" />
      <div className="h-11 w-full rounded-xl bg-white/10" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="h-24 rounded-2xl bg-white/10" />
        <div className="h-24 rounded-2xl bg-white/10" />
      </div>
    </main>
  )
}