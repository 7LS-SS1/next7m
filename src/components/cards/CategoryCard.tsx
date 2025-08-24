// src/components/cards/CategoryCard.tsx
import Link from "next/link";

type Props = {
  title: string;
  desc?: string;
  href?: string;
  emoji?: string;          // ใช้ emoji หรือตัวอักษรแทนไอคอน
  rightSlot?: React.ReactNode; // เผื่ออนาคตใส่ป้าย/Badge
  className?: string;
};

export default function CategoryCard({
  title,
  desc,
  href = "#",
  emoji = "🏷️",
  rightSlot,
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={`card p-4 hover:scale-[1.01] transition group ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 grid place-items-center rounded-xl bg-white/10 text-xl">
            {emoji}
          </div>
          <div>
            <div className="font-semibold">{title}</div>
            {desc ? <div className="text-sm text-white/70">{desc}</div> : null}
          </div>
        </div>
        {rightSlot ?? (
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[rgb(var(--accent-from))] to-[rgb(var(--accent-to))] opacity-70 group-hover:opacity-100" />
        )}
      </div>
    </Link>
  );
}