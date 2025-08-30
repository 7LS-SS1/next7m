"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function LivePreview({
  initialUrl,
  defaultInterval = 15000,
   viewportWidth = 1280,        // 👈 ความกว้างหน้าใน iframe (px)
   viewportHeight,              // (ไม่ใส่จะคำนวณจาก aspect)
   aspect = 16 / 10,
}: {
  initialUrl: string;
  defaultInterval?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  aspect?: number;
}) {
  const [url, setUrl] = useState<string>(initialUrl);
  const [auto, setAuto] = useState<boolean>(false);
  const [intervalMs, setIntervalMs] = useState<number>(defaultInterval);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const [last, setLast] = useState<number | null>(null);
  const [blocked, setBlocked] = useState<boolean>(false);
  

  const bustUrl = useMemo(() => {
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : undefined);
    // ถ้าผู้ใช้พิมพ์โดเมนเปล่า ให้เติม https:// ให้อัตโนมัติ
    if (!/^https?:/i.test(url)) return `https://${url}`;
    // เพิ่ม timestamp กัน cache
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}_ts=${Date.now()}`;
  }, [url, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
    setLast(Date.now());
    setBlocked(false);
  }, []);

  useEffect(() => {
    if (!auto) return;
    timerRef.current = window.setInterval(reload, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [auto, intervalMs, reload]);

  // ถ้าโดน X-Frame-Options ปิดกั้น เรา detect โดยตั้ง timeout: ถ้า iframe onLoad ไม่ถูกเรียกในเวลาหนึ่ง ให้แจ้งเตือน
  useEffect(() => {
    const t = window.setTimeout(() => setBlocked(true), 8000);
    return () => window.clearTimeout(t);
  }, [reloadKey]);

  return (
    <div className="grid gap-3">
      {/* Controls */}
      {/* <div className="card p-3 flex flex-col md:flex-row items-start md:items-end gap-2">
        <div className="flex-1 min-w-0">
          <label className="text-sm opacity-70">URL</label>
          <input
            className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 outline-none"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="text-sm opacity-70">Auto refresh</label>
          <div className="mt-1 flex items-center gap-2">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
            <input
              type="number"
              className="w-28 rounded-xl bg-white/5 px-3 py-2 outline-none"
              value={intervalMs}
              min={3000}
              step={1000}
              onChange={(e) => setIntervalMs(Math.max(3000, Number(e.target.value) || defaultInterval))}
            />
            <span className="text-sm opacity-70">ms</span>
          </div>
        </div>
        <button onClick={reload} className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/10">
          รีเฟรช
        </button>
        <a
          href={/^https?:/i.test(url) ? url : `https://${url}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/10"
        >
          เปิดแท็บใหม่
        </a>
      </div> */}

      {/* Preview */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-white/5 px-3 py-2 text-xs flex items-center justify-between">
          <div className="truncate">แสดงตัวอย่าง: {/^https?:/i.test(url) ? url : `https://${url}`}</div>
          <div className="opacity-70">{last ? new Date(last).toLocaleTimeString() : "—"}</div>
        </div>
        <div className="relative">
            <div className="relative overflow-auto">
                {/* กำหนดขนาดหน้าใน iframe ตาม viewportWidth x viewportHeight */}
                <div className="relative">
                {/* container ใช้ aspect 16:5 */}
                <div className="aspect-[16/10.5] w-full">
                    <iframe
                    key={reloadKey}
                    src={bustUrl}
                    className="w-full h-full"
                    style={{
                        width: "100%",       // iframe กินเต็มกรอบ
                        height: "100%",      // iframe สูงเต็มตาม aspect container
                    }}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    referrerPolicy="no-referrer"
                    onLoad={() => setBlocked(false)}
                    />
                </div>
                </div>
            </div>
          {blocked && (
            <div className="absolute inset-0 grid place-items-center bg-black/60">
              <div className="text-center text-sm">
                <div className="mb-2">เว็บไซต์นี้อาจบล็อคการฝังผ่าน iframe (X-Frame-Options)</div>
                <div>
                  <a
                    className="underline decoration-dotted"
                    href={/^https?:/i.test(url) ? url : `https://${url}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    เปิดในแท็บใหม่แทน
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}