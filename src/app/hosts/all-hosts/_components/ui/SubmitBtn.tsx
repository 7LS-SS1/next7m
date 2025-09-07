"use client";

import { useFormStatus } from "react-dom";
import { ToolbarButton } from "./ToolbarButton";

export function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <ToolbarButton type="submit" disabled={pending} aria-label={label} title={label}>
      {pending ? "กำลังบันทึก..." : label}
    </ToolbarButton>
  );
}