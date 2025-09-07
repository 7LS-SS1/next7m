// src/app/domains/_components/LivePreview.tsx
"use client";

import * as React from "react";

/**
 * ป้องกัน Hydration mismatch:
 * - SSR: iframe.src ใช้ baseUrl คงที่ (ไม่มี _ts)
 * - Client: หลัง mount ค่อยเติม _ts ด้วย useEffect
 */
export default function LivePreview({
  initialUrl,
  viewportWidth = 1280,
  viewportHeight = 720,
}: {
  initialUrl: string;
  viewportWidth?: number;
  viewportHeight?: number;
}) {
  // สร้าง URL ที่ถูกต้องและ "คงที่" ทั้ง SSR/Client (ไม่มี _ts)
  const baseUrl = React.useMemo(() => normalizeUrl(initialUrl), [initialUrl]);

  // ให้ render แรกตรงกับ SSR: ใช้ baseUrl
  const [src, setSrc] = React.useState<string>(baseUrl);

  // หลัง mount ค่อยกัน cache ด้วย _ts (ฝั่ง Client เท่านั้น)
  React.useEffect(() => {
    try {
      const u = new URL(baseUrl);
      u.searchParams.set("_ts", String(Date.now()));
      setSrc(u.toString());
    } catch {
      setSrc(baseUrl);
    }
  }, [baseUrl]);

  // ปุ่มรีโหลด อัปเดต _ts เฉพาะ Client
  const reload = React.useCallback(() => {
    try {
      const u = new URL(baseUrl);
      u.searchParams.set("_ts", String(Date.now()));
      setSrc(u.toString());
    } catch {
      setSrc(baseUrl);
    }
  }, [baseUrl]);

  return (
    <div className="grid gap-3">
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <div className="truncate text-sm opacity-80">{baseUrl}</div>
          <button
            type="button"
            onClick={reload}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs hover:bg-white/10"
          >
            รีโหลด
          </button>
        </div>
        <div className="relative">
          {/* container ใช้ aspect 16:10.5 */}
          <div className="aspect-[16/10.5] w-full">
            <iframe
              src={src}
              className="w-full h-full"
              style={{ width: "100%", height: "100%" }}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeUrl(input: string): string {
  try {
    // เติม protocol ถ้าเป็นโดเมนเปล่า
    if (!/^https?:\/\//i.test(input)) return `https://${input}`;
    // ให้ URL constructor ตรวจความถูกต้อง (base เฉพาะกรณี relative)
    const u = new URL(
      input,
      typeof window !== "undefined" ? window.location.origin : undefined
    );
    return u.toString();
  } catch {
    return input;
  }
}