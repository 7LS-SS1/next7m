"use client";

import React, { useState } from "react";

interface CodeSnippetProps {
  code: string;
  title?: string;
}

/**
 * สnippet โค้ดพร้อมปุ่ม Copy แบบ Tailwind (ไม่พึ่ง CSS module)
 * - รองรับ title (แสดงด้านบนซ้าย)
 * - แสดงภาษา (badge) ด้านซ้ายของ title หากมี
 * - ปุ่ม Copy แสดงสถานะ Copied! ชั่วคราว
 */
const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="flex gap-3 min-w-xl items-center">
      <span className="w-1/10 mb-1 text-sm font-medium">{title} : </span>
      <div className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
        {/* Code block */}
        <div className="relative flex flex-row">
          <pre className="m-0 max-h-[480px] w-full overflow-auto p-4 text-[13px] leading-relaxed">
            <code className="block whitespace-pre text-white/90">{code}</code>
          </pre>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-2.5 py-1 text-xs hover:bg-white/10 active:scale-[0.98] transition"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <span className="i">✅</span>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <span className="i">📋</span>
                <span>Copy</span>
              </>
            )}
          </button>
          {/* Gradient fade bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default CodeSnippet;
