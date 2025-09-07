"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/assets/icons/UFABET7M-MINI.png";

type Me = {
  ok: boolean;
  user: { id: string; email: string; name?: string | null; role: string } | null;
};

function initialsOf(nameOrEmail: string | null | undefined) {
  const t = (nameOrEmail || "").trim();
  if (!t) return "U";
  const parts = t.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  const s = t.includes("@") ? t.split("@")[0] : t;
  return (s[0] ?? "U").toUpperCase();
}

export default function Topbar() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await res.json()) as Me;
        if (alive) setMe(data);
      } catch {
        if (alive) setMe({ ok: false, user: null });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const user = me?.user || null;
  const displayName = user?.name || user?.email || "ผู้ใช้";
  const avatarText = initialsOf(displayName);

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/10 bg-[rgb(var(--card))]/70 backdrop-blur"
      role="banner"
    >
      <div className="flex items-center gap-2 px-3 lg:px-5 h-14">
        {/* Left: Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <Image src={Icon} alt="logo" width={22} height={22} className="rounded" />
          <span className="font-semibold tracking-wide">7M Console</span>
        </Link>

        {/* Center: Search */}
        <div className="flex-1 px-1">
          <div className="relative hidden md:block">
            <input
              type="search"
              name="q"
              placeholder="ค้นหา…"
              className="w-full rounded-xl bg-white/5 pl-9 pr-3 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
            />
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white/60">
              🔎
            </span>
          </div>
          <div className="md:hidden" />
        </div>

        {/* Right */}
        {!user ? (
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10">
              เข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-sm text-white/60">สิทธิ์</span>
            <span className="px-2 py-0.5 text-xs rounded-full border border-white/20 bg-white/5">
              {user.role}
            </span>

            <details className="relative">
              <summary
                className="list-none grid size-9 place-items-center rounded-xl hover:bg-white/10 cursor-pointer"
                aria-haspopup="menu"
                aria-label="เมนูผู้ใช้"
                title="บัญชีของฉัน"
              >
                <span className="inline-grid size-6 place-items-center rounded-full bg-white/10 text-[11px] font-semibold">
                  {avatarText}
                </span>
              </summary>
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-[rgb(var(--card))]/95 backdrop-blur p-3 shadow-xl"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 grid place-items-center text-sm font-semibold">
                    {avatarText}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{displayName}</div>
                    <div className="text-xs text-white/60 truncate">{user.email}</div>
                  </div>
                </div>

                <nav className="py-2 flex flex-col gap-1">
                  <Link href="/profile" className="px-2 py-1.5 rounded-lg hover:bg-white/10">
                    โปรไฟล์ของฉัน
                  </Link>
                  <Link href="/organization/user" className="px-2 py-1.5 rounded-lg hover:bg-white/10">
                    ผู้ใช้งานในองค์กร
                  </Link>
                  <Link href="/settings" className="px-2 py-1.5 rounded-lg hover:bg-white/10">
                    การตั้งค่า
                  </Link>
                </nav>

                <form method="POST" action="/api/auth/logout" className="pt-2 border-t border-white/10">
                  <button className="w-full px-2 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-red-300">
                    ออกจากระบบ
                  </button>
                </form>
              </div>
            </details>
          </div>
        )}
      </div>
    </header>
  );
}