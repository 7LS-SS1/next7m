"use client";

import { useState } from "react";

export default function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {}
      }}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ring-1 ring-gray-300 hover:bg-gray-50"
      type="button"
    >
      {ok ? "✓ คัดลอกแล้ว" : label}
    </button>
  );
}