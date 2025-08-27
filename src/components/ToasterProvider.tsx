"use client";

import { Toaster } from "sonner";

export default function ToasterProvider() {
  return (
    <Toaster
      theme="dark"
      richColors
      expand
      closeButton
      position="bottom-right"
      duration={3000}
      toastOptions={{
        style: { backdropFilter: "blur(6px)" },
        classNames: {
          toast: "rounded-xl border border-white/10 bg-black/70 text-white",
          title: "font-medium",
          description: "text-white/80",
          actionButton: "rounded-lg",
          cancelButton: "rounded-lg",
        },
      }}
    />
  );
}