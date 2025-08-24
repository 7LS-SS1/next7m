// src/components/CategoryGrid.tsx
import FeatureCard from "./cards/FeatureCard";

export type CategoryItem = {
  title: string;
  desc?: string;
  href?: string;
  emoji?: string;
};

type Props = {
  items: CategoryItem[];
  className?: string;
  cols?: { base?: number; sm?: number; lg?: number }; // ปรับจำนวนคอลัมน์ได้
};

export default function CategoryGrid({
  items,
  className = "",
  cols = { base: 1, sm: 2, lg: 4 },
}: Props) {
  const base = cols.base ?? 1;
  const sm = cols.sm ?? 2;
  const lg = cols.lg ?? 4;

  return (
    <section
      className={`grid gap-3 mt-4 grid-cols-${base} sm:grid-cols-${sm} lg:grid-cols-${lg} ${className}`}
    >
      {items.map((it, i) => (
        <FeatureCard
          key={i}
          title={it.title}
          desc={it.desc}
          href={it.href}
          emoji={it.emoji}
        />
      ))}
    </section>
  );
}