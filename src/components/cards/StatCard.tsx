type Props = { label: string; value: string; sub?: string; emoji?: string };

export function StatCard({ label, value, sub, emoji = "📈" }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="size-10 grid place-items-center rounded-xl bg-white/10 text-xl">{emoji}</div>
        {sub ? <div className="text-xs text-green-400">{sub}</div> : null}
      </div>
      <div className="mt-4 text-sm text-white/60">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}