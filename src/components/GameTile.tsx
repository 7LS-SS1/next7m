type Props = { title: string; chip?: string };

export function GameTile({ title, chip = "ใหม่" }: Props) {
  return (
    <div className="scroll-item min-w-[160px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5">
        {/* placeholder ภาพเกม */}
        <div className="absolute inset-0 grid place-items-center text-5xl">🎮</div>
        <div className="absolute left-2 top-2 badge bg-[rgb(var(--accent))]/20 text-[10px]">{chip}</div>
      </div>
      <div className="mt-2 text-sm text-white/80 line-clamp-1">{title}</div>
    </div>
  );
}
