"use client";
import { useEffect, useState } from "react";

export default function StatusProbe({ url }: { url: string }) {
  const [code, setCode] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setErr(null);
    try {
      const r = await fetch(`/domains/api/check-status?url=${encodeURIComponent(url)}`, { cache: "no-store" });
      const j = await r.json();
      if (j?.ok && typeof j.status === "number") setCode(j.status);
      else setErr(j?.error || "unknown");
    } catch (e: any) {
      setErr(e?.message || "fetch_error");
    }
  }

  useEffect(() => {
    run();
  }, [url]);

  const classBy = (n?: number | null) => {
    if (n == null) return "bg-gray-600/20 text-gray-200";
    if (n >= 200 && n < 300) return "bg-green-600/20 text-green-400";
    if (n >= 300 && n < 400) return "bg-yellow-600/20 text-yellow-400";
    if (n >= 400 && n < 500) return "bg-orange-600/20 text-orange-300";
    return "bg-red-600/20 text-red-400";
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${classBy(code)}`}>
        {code ?? (err ? "ERR" : "…")}
      </span>
      <button aria-label="โหลดใหม่" type="button" onClick={run} className="text-xs opacity-70 hover:opacity-100 underline">
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
        </svg>
      </button>
    </div>
  );
}