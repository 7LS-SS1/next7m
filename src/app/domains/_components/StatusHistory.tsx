

// src/app/domains/_components/StatusHistory.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Ping = { t: number; ok: boolean; status: number; ms: number; err?: string };

/**
 * แสดงกราฟ Sparkline ของ latency และตารางประวัติสถานะ (ดึงผลโดยตรงจาก /domains/api/check-status)
 * ใช้เฉพาะในหน้า View ของแต่ละโดเมน
 */
export default function StatusHistory({ url, interval = 360000, maxPoints = 2 }: { url: string; interval?: number; maxPoints?: number }) {
  const [events, setEvents] = useState<Ping[]>([]);
  const timerRef = useRef<number | null>(null);

  async function tick() {
    try {
      const r = await fetch(`/domains/api/check-status?url=${encodeURIComponent(url)}`, { cache: "no-store" });
      const j = await r.json();
      const now = Date.now();
      const next: Ping = {
        t: now,
        ok: !!j?.ok,
        status: typeof j?.status === "number" ? j.status : 0,
        ms: typeof j?.ms === "number" ? j.ms : 0,
        err: j?.error,
      };
      setEvents((prev) => [next, ...prev].slice(0, maxPoints));
    } catch (e: any) {
      const now = Date.now();
      setEvents((prev) => [{ t: now, ok: false, status: 0, ms: 0, err: e?.message || "fetch_error" }, ...prev].slice(0, maxPoints));
    }
  }

  useEffect(() => {
    tick();
    timerRef.current = window.setInterval(tick, interval);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [url, interval]);

  // เตรียมข้อมูลสำหรับกราฟ (ล่าสุดอยู่ซ้าย → reverse เพื่อวาดซ้าย→ขวา)
  const series = useMemo(() => [...events].reverse(), [events]);
  const maxLatency = useMemo(() => Math.max(100, ...series.map((p) => p.ms || 0)), [series]);

  const width = 640;
  const height = 100;
  const padding = 6;
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;

  const path = useMemo(() => {
    if (series.length === 0) return "";
    const stepX = plotW / Math.max(1, series.length - 1);
    const pts = series.map((p, i) => {
      const x = padding + i * stepX;
      const y = padding + plotH - (Math.min(p.ms || 0, maxLatency) / maxLatency) * plotH;
      return `${x},${y}`;
    });
    return `M ${pts[0]} L ${pts.slice(1).join(" ")}`;
  }, [series, plotW, plotH, padding, maxLatency]);

  const last = events[0];
  const avg = useMemo(() => {
    if (events.length === 0) return 0;
    const sum = events.reduce((s, p) => s + (p.ms || 0), 0);
    return Math.round(sum / events.length);
  }, [events]);

  const chip = (ok: boolean, status: number) => {
    const cls = !ok
      ? "bg-red-600/20 text-red-400"
      : status >= 200 && status < 300
      ? "bg-green-600/20 text-green-400"
      : status >= 300 && status < 400
      ? "bg-yellow-600/20 text-yellow-400"
      : status >= 400 && status < 500
      ? "bg-orange-600/20 text-orange-300"
      : "bg-red-600/20 text-red-400";
    return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{ok ? status : "ERR"}</span>;
  };

  return (
    <div className="card p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">Latency & ประวัติสถานะ</div>
        <div className="flex items-center gap-3 text-sm">
          <span className="opacity-70">ล่าสุด:</span>
          {last ? chip(last.ok, last.status) : <span className="opacity-60">-</span>}
          <span className="opacity-70">เฉลี่ย:</span>
          <span>{avg} ms</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="block">
          <rect x={0} y={0} width={width} height={height} className="fill-white/5" />
          <line x1={padding} y1={padding} x2={padding + plotW} y2={padding} className="stroke-white/10" />
          <line x1={padding} y1={padding + plotH / 2} x2={padding + plotW} y2={padding + plotH / 2} className="stroke-white/10" />
          <line x1={padding} y1={padding + plotH} x2={padding + plotW} y2={padding + plotH} className="stroke-white/10" />
          <path d={path} className="stroke-green-400 fill-none" strokeWidth={2} />
        </svg>
      </div>

      {/* History table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-white/5">
            <tr>
              <th className="p-2 text-left">เวลา</th>
              <th className="p-2 text-left">สถานะ</th>
              <th className="p-2 text-left">Latency</th>
              <th className="p-2 text-left">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={`${e.t}-${i}`} className="border-t border-white/10">
                <td className="p-2">{new Date(e.t).toLocaleTimeString()}</td>
                <td className="p-2">{chip(e.ok, e.status)}</td>
                <td className="p-2">{e.ms ? `${e.ms} ms` : "-"}</td>
                <td className="p-2">{e.err ?? "-"}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center opacity-60">ยังไม่มีข้อมูล</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}