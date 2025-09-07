export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-rose-400">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-white/60">{hint}</span>}
    </label>
  );
}

export const baseInput =
  "rounded-xl border border-white/20 bg-transparent px-3 py-2 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/15 focus:border-white/30";