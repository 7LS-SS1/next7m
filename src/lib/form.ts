// src/lib/form.ts
export const asTrim = (v: unknown) => (v == null ? undefined : v.toString().trim());
export const emptyToUndef = (v: unknown) => {
  const s = v == null ? "" : v.toString().trim();
  return s === "" ? undefined : s;
};

export function toBool(v: FormDataEntryValue | null | undefined): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.toLowerCase();
    return s === "1" || s === "true" || s === "on" || s === "yes";
  }
  return false;
}

export function toStr(v: FormDataEntryValue | null | undefined): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}