"use client";

import * as React from "react";

export type AnnouncementItem = {
  id: string;
  text: string;
  time?: string;
  href?: string; // ลิงก์ไปอ่านฉบับเต็ม
};

export default function AnnouncementsCard({
  items = [],
  className = "",
}: {
  items: AnnouncementItem[];
  className?: string;
}) {
  const [read, setRead] = React.useState<Set<string>>(new Set());

  // โหลดสถานะที่อ่านแล้วจาก localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("announce:read");
      if (raw) setRead(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  function markRead(id: string) {
    setRead((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("announce:read", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-4xl font-bold text-yellow-500">ประกาศล่าสุด</h2>
        <span className="text-xs text-white/60">{items.length} รายการ</span>
      </div>

      <hr className="border-white/10 max-w-[97%] mt-4 mb-4 m-auto" />
      <div className="px-4 pb-4">
        <ul className="divide-y divide-white/5">
          {items.map((it) => {
            const unread = !read.has(it.id);
            const content = (
              <div className="flex items-center gap-3 px-4 py-3">
                {unread && (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-semibold text-black">
                    NEW
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium hover:underline">
                    {it.text}
                  </div>
                  {it.time && (
                    <div className="mt-0.5 text-xs text-white/60">
                      {it.time}
                    </div>
                  )}
                </div>
              </div>
            );

            return (
              <li key={it.id} className="hover:bg-white/[0.04]">
                {it.href ? (
                  <a
                    href={it.href}
                    onClick={() => markRead(it.id)}
                    className="block focus:outline-none"
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => markRead(it.id)}
                    className="block w-full text-left focus:outline-none"
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
