// src/components/cards/AnnouncementsCard.tsx
type Item = { text: string; time: string };

type Props = {
  title?: string;
  items: Item[];
  className?: string;
};

export default function AnnouncementsCard({
  title = "ข่าวสาร / ประกาศ",
  items,
  className = "",
}: Props) {
  return (
    <section className={`w-full lg:col-span-2 lg:row-span-2 mb-4 ${className}`}>
      <div className="lg:col-span-2 card p-5">
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <ul className="space-y-3 text-sm text-white/80">
          {items.map((it, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span>{it.text}</span>
              <span className="text-white/50">{it.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}