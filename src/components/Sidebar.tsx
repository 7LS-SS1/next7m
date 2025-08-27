"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import LogoutCard from "@/components/LogoutCard";

import Image from "next/image";
import Logo from "@/assets/icons/UFABET7M-MINI.png";

// =========================
// Types & Nav structure
// =========================
type NavItem = {
  title: string;
  emoji: string;
  href?: string; // leaf item has href
  children?: NavItem[]; // section item has children
};

const NAV: NavItem[] = [
  { href: "/dashboard", title: "Dashboard", emoji: "🏠" },
  { href: "/domains", title: "Domain", emoji: "🏆" },
  {
    title: "HOST",
    emoji: "🚀",
    children: [
      { href: "/hosts", title: "Overview", emoji: "📋" },
      { href: "/hosts/providers", title: "Host Providers", emoji: "🧩" },
      { href: "/hosts/types", title: "Host Types", emoji: "💠" },
    ],
  },
  {
    title: "Management",
    emoji: "👥",
    children: [
      { href: "/managements", title: "Overview", emoji: "📊" },
      { href: "/managements/teams", title: "Teams", emoji: "👤" },
      { href: "/managements/emails", title: "Emails", emoji: "👤" },
      { href: "/managements/projects", title: "Projects", emoji: "📁" },
    ],
  },
  {
    title: "Program/Plugin",
    emoji: "🧩",
    children: [
      { href: "/extensions", title: "Overview", emoji: "📊" },
      { href: "/extensions/programs", title: "Program", emoji: "💻" },
      { href: "/extensions/plugins", title: "Plugin", emoji: "🔌" },
    ],
  },

  // Setting
  { href: "/setting", title: "Setting", emoji: "⚙️" },
];

const W_EXPANDED = 240; // px
const W_COLLAPSED = 76; // px

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true); // desktop
  const [mobileOpen, setMobileOpen] = useState(false); // < lg
  const [open, setOpen] = useState<Record<string, boolean>>({}); // submenu open state

  // -------------------------
  // Helpers
  // -------------------------
  const norm = (p: string) => (p.endsWith("/") ? p.slice(0, -1) : p);
  const isActive = (href?: string) =>
    href
      ? norm(pathname) === norm(href) || pathname.startsWith(href + "/")
      : false;
  const sectionActive = (item: NavItem) =>
    !!item.children?.some((c) => isActive(c.href)) || isActive(item.href);

  const toggleSection = (key: string) =>
    setOpen((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("sb_open_" + key, next[key] ? "1" : "0");
      } catch {}
      return next;
    });

  // โหลดสถานะ + ฟังปุ่ม toggle กลางจาก Topbar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sb_expanded");
      if (saved != null) setExpanded(saved === "1");

      // restore section open states (set ครั้งเดียว)
      const initialOpen: Record<string, boolean> = {};
      for (const it of NAV) {
        if (it.children?.length) {
          const v = localStorage.getItem("sb_open_" + it.title);
          initialOpen[it.title] = v ? v === "1" : true;
        }
      }
      setOpen(initialOpen);
    } catch {}

    const onToggle = () => {
      if (window.matchMedia("(max-width:1023px)").matches) {
        setMobileOpen((v) => !v);
      } else {
        setExpanded((v) => {
          const nv = !v;
          try {
            localStorage.setItem("sb_expanded", nv ? "1" : "0");
          } catch {}
          return nv;
        });
      }
    };
    window.addEventListener("toggle-sidebar", onToggle);
    return () => window.removeEventListener("toggle-sidebar", onToggle);
  }, []);

  // ปิด drawer อัตโนมัติเมื่อเปลี่ยนเส้นทาง (มือถือ)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const width = useMemo(
    () => (expanded ? W_EXPANDED : W_COLLAPSED),
    [expanded]
  );

  return (
    <>
      {/* Overlay มือถือ */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 select-none
          border-r border-white/10 bg-[rgb(var(--card))]/95 backdrop-blur
          transition-[transform,width] duration-200
          -translate-x-full ${mobileOpen ? "translate-x-0" : ""} lg:translate-x-0
        `}
        style={{ width }}
      >
        {/* แถบบน */}
        <div className="hidden lg:flex items-center gap-3 px-1 pt-1 pb-2">
          <button
            onClick={() =>
              setExpanded((v) => {
                const nv = !v;
                localStorage.setItem("sb_expanded", nv ? "1" : "0");
                return nv;
              })
            }
            title="ย่อ/ขยายเมนู"
            aria-label="Toggle sidebar"
            className="grid size-9 place-items-center rounded-xl hover:bg-white/10"
          >
            <Image src={Logo} alt="icon" className="w-10" />
          </button>
          {expanded && <span className="font-bold">UFABET</span>}
        </div>

        {/* เมนู */}
        <nav className="mt-1 px-2" role="navigation" aria-label="Sidebar">
          {NAV.map((it) => {
            const hasChildren = !!it.children?.length;
            const active = sectionActive(it);

            if (!hasChildren) {
              return (
                <Link
                  key={it.title}
                  href={it.href || "#"}
                  className={`group flex items-center gap-3 rounded-xl px-0.5 py-0.5 mb-1 transition ${
                    active
                      ? "bg-white/[0.08] border border-white/10"
                      : "hover:bg-white/[0.06] border border-transparent"
                  }`}
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-lg">
                    {it.emoji}
                  </span>
                  {expanded && <span className="font-small">{it.title}</span>}
                </Link>
              );
            }

            // มี children → แสดงเป็น section
            const openNow = open[it.title] ?? true;

            return (
              <div key={it.title} className="group relative">
                {/* แถวหัวข้อ */}
                <button
                  type="button"
                  onClick={() => expanded && toggleSection(it.title)}
                  className={`w-full flex items-center justify-between rounded-xl px-0.5 py-0.5 mb-1 transition ${
                    active
                      ? "bg-white/[0.08] border border-white/10"
                      : "hover:bg-white/[0.06] border border-transparent"
                  }`}
                  aria-expanded={expanded ? openNow : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-lg">
                      {it.emoji}
                    </span>
                    {expanded && (
                      <span className="font-medium">{it.title}</span>
                    )}
                  </div>
                  {expanded && (
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 transition-transform ${openNow ? "rotate-90" : "rotate-0"}`}
                      aria-hidden
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>

                {/* Children: expanded mode → แสดงใต้หัวข้อ */}
                {expanded && openNow && (
                  <div className="ml-[52px] mb-1 grid gap-1">
                    {(it.children ?? []).map((c) => {
                      const childActive = isActive(c.href);
                      return (
                        <Link
                          key={c.href}
                          href={c.href!}
                          className={`flex items-center gap-2 rounded-lg px-0.5 py-0.5 text-sm ${
                            childActive
                              ? "bg-white/[0.10] border border-white/10"
                              : "hover:bg-white/[0.08] border border-transparent"
                          }`}
                        >
                          <span className="opacity-80">{c.emoji}</span>
                          <span className="truncate">{c.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Children: collapsed mode → flyout */}
                {!expanded && (
                  <div className="pointer-events-none absolute left-full top-0 ml-2 w-56 opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                    <div className="rounded-xl border border-white/10 bg-[rgb(var(--card))]/95 backdrop-blur p-2 shadow-xl">
                      <div className="px-2 pb-1 text-xs text-white/60">
                        {it.title}
                      </div>
                      {(it.children ?? []).map((c) => {
                        const childActive = isActive(c.href);
                        return (
                          <Link
                            key={c.href}
                            href={c.href!}
                            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                              childActive
                                ? "bg-white/[0.12]"
                                : "hover:bg-white/[0.08]"
                            }`}
                          >
                            <span className="opacity-80">{c.emoji}</span>
                            <span className="truncate">{c.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="absolute bottom-3 left-0 right-0 px-2">
          <LogoutCard
            expanded={expanded}
            balance="$0.00"
            onDeposit={() => {
              console.log("deposit clicked");
            }}
            onLogout={() => {
              window.location.href = "/login";
            }}
          />
        </div>
      </aside>

      {/* Spacer กันคอนเทนต์ชน (เดสก์ทอปเท่านั้น) */}
      <div className="hidden lg:block shrink-0" aria-hidden style={{ width }} />
    </>
  );
}
