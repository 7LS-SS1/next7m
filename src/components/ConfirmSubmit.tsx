"use client";

import * as React from "react";

type Props = {
  confirmText: string;
  className?: string;
  // เดิม: children เป็น required -> ปรับให้ optional
  children?: React.ReactNode;
};

export default function ConfirmSubmit({
  confirmText,
  className,
  children,
}: Props) {
  return (
    <button
      type="submit"
      className={className ?? "rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10 text-red-300"}
      onClick={(e) => {
        if (!confirm(confirmText)) {
          e.preventDefault();
        }
      }}
    >
      {/* ถ้าไม่มี children ให้แสดงปุ่มค่าเริ่มต้น */}
      {children ?? "ลบ"}
    </button>
  );
}