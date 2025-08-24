"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// 👉 คุณมีโลโก้แล้วให้ปรับ path ให้ถูก
import Icon from "@/assets/icons/UFABET7M-MINI.png";

function dispatchToggleSidebar() {
  window.dispatchEvent(new Event("toggle-sidebar"));
}

export default function Topbar() {
  const [hasNotif, setHasNotif] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/10 bg-[rgb(var(--card))]/70 backdrop-blur"
      role="banner"
    >
      <div className="flex items-center gap-2 px-3 lg:px-5 h-14">
        

        {/* Center: Search */}
        <div className="flex-1 px-1">
          <div className="relative hidden md:block">
            <input
              ref={searchRef}
              type="search"
              name="q"
              placeholder="ค้นหา… (กด / เพื่อค้นหาเร็ว)"
              className="w-full rounded-xl bg-white/5 pl-9 pr-20 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/10"
            />
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white/60">
              🔎
            </span>
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] rounded border border-white/20 bg-white/5 px-2 py-0.5 text-white/70">
              /
            </kbd>
          </div>

          {/* Mobile search icon */}
          <button
            onClick={() => searchRef.current?.focus()}
            className="md:hidden grid size-9 place-items-center rounded-xl hover:bg-white/10"
            aria-label="ค้นหา"
            title="ค้นหา"
          >
            🔎
          </button>
        </div>

        {/* Right: Wallet, Deposit, Notif, User */}
        <div className="flex items-center gap-2">
          {/* Balance */}
          <div className="hidden sm:flex flex-col items-end leading-none">
            <span className="text-[11px] text-white/60">ยอดคงเหลือ</span>
            <span className="text-sm font-semibold tracking-wide">$0.00</span>
          </div>
          {/* Deposit */}
          <button
            className="hidden sm:inline-flex items-center rounded-xl px-3 py-2 text-sm text-black
                       bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95"
            onClick={() => (window.location.href = "/deposit")}
            aria-label="ฝากเงิน"
            title="ฝากเงิน"
          >
            ฝากเงิน
          </button>

          {/* Notifications */}
          <button
            className="relative grid size-9 place-items-center rounded-xl hover:bg-white/10"
            aria-label="การแจ้งเตือน"
            title="การแจ้งเตือน"
            onClick={() => setHasNotif(false)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6v-3a6 6 0 1 0-12 0v3l-2 2v1h16v-1l-2-2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {hasNotif && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 ring-2 ring-[rgb(var(--card))]" />
            )}
          </button>

          {/* User menu */}
          <details className="relative">
            <summary
              className="list-none grid size-9 place-items-center rounded-xl hover:bg-white/10 cursor-pointer"
              aria-haspopup="menu"
              aria-label="เมนูผู้ใช้"
              title="บัญชีของฉัน"
            >
              <span className="inline-grid size-6 place-items-center rounded-full bg-white/10 text-[11px]">
                U
              </span>
            </summary>
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[rgb(var(--card))]/95 backdrop-blur p-2 shadow-xl"
            >
              <div className="px-2 py-1.5 text-xs text-white/60">เข้าระบบแล้ว</div>
              <Link href="/profile" className="block rounded-lg px-2 py-1.5 hover:bg-white/10">
                โปรไฟล์
              </Link>
              <Link href="/settings" className="block rounded-lg px-2 py-1.5 hover:bg-white/10">
                ตั้งค่า
              </Link>
              <hr className="my-2 border-white/10" />
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-white/10 text-red-300"
              >
                ออกจากระบบ
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}