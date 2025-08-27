// src/components/ConfirmDeleteModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title?: string;
  warning?: string;

  /** ชื่อ resource ที่ต้องพิมพ์ให้ตรง เช่น "7ls-ss1s-projects/next7m" */
  resourceName?: string;
  /** label ด้านบนช่องพิมพ์ชื่อ */
  resourceLabel?: string;

  /** กำหนดให้พิมพ์วลีเพื่อยืนยันเพิ่มเติม (เช่น "delete my project") */
  requirePhrase?: boolean;
  phraseText?: string;
  phraseLabel?: string;

  /** ปุ่มยืนยัน (ค่าเริ่มต้น: Delete) */
  confirmText?: string;
  /** ปุ่มยกเลิก (ค่าเริ่มต้น: Cancel) */
  cancelText?: string;

  /** ฟังก์ชันลบจริง (ควรเป็น async) */
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  title = "Delete Program",
  warning = "Warning: การกระทํานี้ไม่สามารถย้อนกลับได้ โปรดยืนยันการดำเนินการ.",
  resourceName,
  resourceLabel = "กรอกชื่อโปรแกรมเพื่อดำเนินการต่อ:",
  requirePhrase = true,
  phraseText = "Delete",
  phraseLabel = "ยืนยันการลบ, พิมพ์ delete ด้านล่าง :",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
}: Props) {
  const [nameInput, setNameInput] = useState("");
  const [phraseInput, setPhraseInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // reset ทุกครั้งที่เปิด
  useEffect(() => {
    if (open) {
      setNameInput("");
      setPhraseInput("");
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  // ปิดเมื่อกด ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // ปิดเมื่อคลิกนอกกล่อง
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onOpenChange(false);
  };

  const canConfirm =
    !submitting &&
    (!resourceName || nameInput.trim() === resourceName) &&
    (!requirePhrase || phraseInput.trim().toLowerCase() === phraseText.toLowerCase());

  const submit = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ใส่ผ่าน portal เพื่อซ้อนทับทั้งหน้า
  const content = !open ? null : (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[rgb(var(--card))]/95 p-0 shadow-2xl"
      >
        <div className="px-5 pt-5 pb-4">
          <h2 id="confirm-delete-title" className="text-xl font-semibold">
            {title}
          </h2>

          <p className="mt-3 text-sm text-white/80">
            โปรแกรมนี้จะถูกลบพร้อมกับการตั้งค่า ตัวแปรสภาพแวดล้อม ฟังก์ชันแบบไร้เซิร์ฟเวอร์ และ การตั้งค่าทั้งหมด
          </p>

          <div className="mt-4 rounded-lg border border-red-900/40 bg-red-900/30 px-3 py-2 text-sm text-red-300">
            <strong className="font-semibold">Warning:</strong> {warning}
          </div>

          {resourceName && (
            <div className="mt-5">
              <p className="text-sm text-white/70">
                {resourceLabel}{" "}
                <span className="font-semibold text-white/90">{resourceName}</span>
              </p>
              <input
                className="mt-2 w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/10"
                placeholder={resourceName}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
          )}

          {requirePhrase && (
            <div className="mt-4">
              <p className="text-sm text-white/70">{phraseLabel}</p>
              <input
                className="mt-2 w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/10"
                placeholder={phraseText}
                value={phraseInput}
                onChange={(e) => setPhraseInput(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-red-300">{error}</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3">
          <button
            type="button"
            className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white/10"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canConfirm}
            className="inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-black font-semibold enabled:hover:brightness-95 disabled:opacity-50"
          >
            {submitting ? "Deleting…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  // ป้องกัน SSR mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(content, document.body);
}