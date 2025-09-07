"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Use a fixed locale to avoid SSR/CSR mismatch; we will also defer formatting until mounted.
const FIXED_LOCALE = "th-TH"; // or "th-TH-u-ca-buddhist" if you want Buddhist year (2568)

/** ================= Utils ================= */
function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(value?: string | Date | null) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  try {
    const fmt = new Intl.DateTimeFormat(FIXED_LOCALE, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return fmt.format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/** ================= Component ================= */
export function DatePickerField({
  name,
  value,
  onChange,
  placeholder = "เลือกวันที่",
}: {
  name: string;
  value: string; // yyyy-MM-dd
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const selected = useMemo(() => (value ? new Date(value) : undefined), [value]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click / Esc
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onDocKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if ((e.key === "Enter" || e.key === " ") && document.activeElement === btnRef.current) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "ArrowDown" && document.activeElement === btnRef.current) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative inline-block w-full">
      {/* Hidden field for form submit */}
      <input type="hidden" name={name} value={value} />

      {/* Button that looks like an input */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl border border-white/20 bg-transparent px-3 py-2 text-left outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/15 focus:border-white/30"
      >
        <span className={value ? "" : "text-white/40"}>
          {value ? (mounted ? formatDisplayDate(value) : value) : placeholder}
        </span>
        <span aria-hidden className="ml-2 select-none">📅</span>
      </button>

      {/* Popup Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="เลือกวันที่"
          className="absolute left-0 top-full z-50 mt-2 w-[320px] rounded-2xl border border-white/15 bg-[rgb(var(--card))]/95 p-3 shadow-xl backdrop-blur"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => {
              onChange(d ? toDateInputValue(d) : "");
              setOpen(false);
              // return focus to button
              setTimeout(() => btnRef.current?.focus(), 0);
            }}
            styles={{
              caption: { color: "white" },
              head: { color: "rgba(255,255,255,0.6)" },
              day: { borderRadius: 8 },
              nav: { color: "white" },
              months: { padding: 4 },
            }}
          />
        </div>
      )}
    </div>
  );
}