"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RichText from "./RichText";

/** ====== Program Options ====== */
const CATEGORIES = ["Adobe", "Office", "Etc."] as const;

/** ====== Types ====== */
type Defaults = {
  id?: string;
  name?: string;
  version?: string;
  vendor?: string;
  category?: string;
  content?: string;
  iconUrl?: string;
  fileUrl?: string;
  recommended?: boolean;
  isRecommended?: boolean;
  featured?: boolean;
  slug?: string;
};

type Props = {
  mode: "new" | "edit";
  defaults?: Defaults;
  actionHref: string;
  idOrSlug?: string;
};

/** ====== UI Helpers ====== */
function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1 block text-xs font-medium tracking-wide text-white/70">
      {children}
      {required && <span className="text-amber-400"> *</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-white/45">{children}</p>;
}

export default function ProgramForm({
  mode,
  defaults,
  actionHref,
  idOrSlug,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pickedIcon, setPickedIcon] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [descLen, setDescLen] = useState<number>(() => {
    const html = defaults?.content ?? "";
    return html
      ? html
          .replace(/&lt;[^&gt;]*&gt;/g, "")
          .replace(/&amp;lt;[^&amp;gt;]*&amp;gt;/g, "")
          .replace(/<[^>]*>/g, "").length
      : 0;
  });

  function onPickFile() {
    fileRef.current?.click();
  }
  function onPickIcon() {
    iconRef.current?.click();
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setPickedFile(f);
  }
  function onIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setPickedIcon(f);
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setPickedFile(f);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      // ensure idOrSlug is present for edit mode
      const idOrSlugValue =
        (defaults?.slug || defaults?.id || idOrSlug || "").toString();
      if (!fd.get("idOrSlug") && idOrSlugValue) {
        fd.set("idOrSlug", idOrSlugValue);
      }

      // normalize checkboxes -> "true"/"false"
      const normBool = (name: string) => {
        const v = fd.get(name);
        const checked = v === "on" || v === "true" || v === "1";
        fd.set(name, checked ? "true" : "false");
      };
      normBool("recommended");
      normBool("featured");

      // optional URL/text fields: drop if empty to bypass URL validation
      ["iconUrl", "fileUrl", "vendor", "version", "content"].forEach((k) => {
        const val = (fd.get(k) as string) ?? "";
        if (!val || String(val).trim() === "") fd.delete(k);
      });

      // attach picked files if any (overrides existing)
      if (pickedFile) fd.set("file", pickedFile);
      if (pickedIcon) fd.set("icon", pickedIcon);

      const res = await fetch(actionHref, { method: "POST", body: fd });
      const data = await res
        .json()
        .catch(() => ({ ok: false, error: "Unexpected response" }));

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ||
          (typeof data === "string" ? data : "อัปโหลด/บันทึกไม่สำเร็จ");
        toast.error(msg);
        setSubmitting(false);
        return;
      }

      toast.success(mode === "edit" ? "บันทึกการแก้ไขสำเร็จ" : "สร้างรายการสำเร็จ");

      // compute target path
      const retIdOrSlug =
        data.slug ||
        data.id ||
        idOrSlugValue ||
        (defaults?.name ? defaults.name : "");

      if (mode === "edit" && retIdOrSlug) {
        router.push(`/extensions/programs/${encodeURIComponent(retIdOrSlug)}/view`);
      } else {
        router.push(`/extensions/programs`);
      }
      // ensure fresh data
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "เกิดข้อผิดพลาด");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-[rgb(var(--card))]/70 p-5 backdrop-blur"
    >
      <input type="hidden" name="id" value={defaults?.id || ""} />
      <input
        type="hidden"
        name="idOrSlug"
        value={(defaults?.slug || defaults?.id || idOrSlug || "").toString()}
      />

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold sm:text-lg">
            {mode === "edit" ? "แก้ไข Program" : "สร้าง Program"}
          </h2>
          <p className="text-xs text-white/50">
            กรอกข้อมูลให้ครบถ้วนเพื่อการค้นหาและดาวน์โหลดที่ง่ายขึ้น
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-4 py-2 text-sm text-black hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed sm:mt-0"
          aria-label="บันทึก Program"
        >
          {submitting ? "กำลังบันทึก..." : mode === "edit" ? "บันทึกการแก้ไข" : "บันทึก Program"}
        </button>
      </div>

      <hr className="my-4 border-white/10" />

      {/* Grid 2 cols */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left column */}
        <section className="grid gap-4">
          <div>
            <FieldLabel required>ชื่อ</FieldLabel>
            <input
              name="name"
              placeholder="เช่น: Adobe Photoshop"
              defaultValue={defaults?.name}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
              required
            />
            <Hint>ชื่อโปรแกรมที่จะใช้แสดงผลในหน้า List / View</Hint>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>เวอร์ชัน</FieldLabel>
              <input
                name="version"
                placeholder="25.1.0"
                defaultValue={defaults?.version ?? ""}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
              />
              <Hint>ระบุถ้าต้องการติดตามการอัปเดต</Hint>
            </div>
            <div>
              <FieldLabel>ผู้พัฒนา (Vendor)</FieldLabel>
              <input
                name="vendor"
                placeholder="เช่น: Adobe"
                defaultValue={defaults?.vendor ?? ""}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
              />
            </div>
          </div>

          <div>
            <FieldLabel>หมวดหมู่ (Category)</FieldLabel>
            <select
              name="category"
              required
              defaultValue={defaults?.category ?? "Etc."}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[rgb(var(--card))]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <FieldLabel>ลิงก์ไอคอน (ถ้ามี)</FieldLabel>
            <input
              name="iconUrl"
              placeholder="https://.../icon.png"
              defaultValue={defaults?.iconUrl ?? ""}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
            />
            <FieldLabel>ลิงก์ไฟล์ (ถ้าอัปโหลดไว้ที่อื่น)</FieldLabel>
            <input
              name="fileUrl"
              placeholder="https://.../setup.exe"
              defaultValue={defaults?.fileUrl ?? ""}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
            />
          </div>
        </section>

        {/* Right column */}
        <section className="grid gap-4">
          <div>
            <FieldLabel>อัปโหลดไฟล์โปรแกรม</FieldLabel>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={onPickFile}
              role="button"
              aria-label="อัปโหลดไฟล์ Program"
              className={`group rounded-2xl border border-dashed p-6 text-center transition ${
                dragOver
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-white/12 bg-white/[0.06] hover:bg-white/[0.08]"
              }`}
            >
              <input
                ref={fileRef}
                name="file"
                type="file"
                accept=".zip,.tar,.tar.gz,.tgz,.rar,.7z,.exe,.msi,.dmg"
                className="hidden"
                onChange={onFileChange}
              />

              <svg
                viewBox="0 0 24 24"
                className="mx-auto mb-3 h-9 w-9 text-white/70 group-hover:text-white"
                aria-hidden
              >
                <path
                  d="M12 16V4m0 0l-3 3m3-3l3 3M5 16v2a3 3 0 003 3h8a3 3 0 003-3v-2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {pickedFile ? (
                <div className="grid gap-1">
                  <div className="mx-auto max-w-full truncate rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs">
                    {pickedFile.name}
                  </div>
                  <span className="text-[11px] text-white/60">
                    {(pickedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="text-[11px] text-white/45">
                    คลิกเพื่อเลือกไฟล์ใหม่ หรือวางไฟล์ที่นี่
                  </span>
                </div>
              ) : (
                <div className="grid gap-0.5">
                  <span className="text-sm font-medium">
                    ลากวางไฟล์ที่นี่ หรือคลิกเพื่อเลือก
                  </span>
                  <span className="text-[11px] text-white/60">
                    รองรับ .zip, .exe, .msi, .dmg ฯลฯ
                  </span>
                </div>
              )}
            </div>
            <Hint>ไฟล์จะถูกอัปโหลดและเชื่อมโยงกับรายการนี้โดยอัตโนมัติ</Hint>
          </div>

          <div className="truncate rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <FieldLabel>อัปโหลดไอคอน</FieldLabel>
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center overflow-hidden rounded-xl bg-white/10">
                {pickedIcon ? (
                  <img
                    src={URL.createObjectURL(pickedIcon)}
                    alt="icon preview"
                    className="h-10 w-10 object-contain"
                    onLoad={(e) =>
                      URL.revokeObjectURL(
                        (e.currentTarget as HTMLImageElement).src
                      )
                    }
                  />
                ) : defaults?.iconUrl ? (
                  <img
                    src={defaults.iconUrl}
                    alt="current icon"
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 text-white/60"
                    aria-hidden
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={iconRef}
                  type="file"
                  name="icon"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={onIconChange}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onPickIcon}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
                  >
                    เลือกรูปไอคอน
                  </button>
                  {pickedIcon && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs">
                      {pickedIcon.name}
                    </span>
                  )}
                  {pickedIcon && (
                    <button
                      type="button"
                      onClick={() => setPickedIcon(null)}
                      className="text-xs underline text-white/70 hover:text-white/90"
                    >
                      ล้างรูป
                    </button>
                  )}
                </div>
                <Hint>รองรับ PNG / JPG / WEBP / SVG — ขนาดแนะนำ ≤ 512×512</Hint>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="recommended"
                defaultChecked={Boolean(
                  defaults?.recommended || defaults?.isRecommended
                )}
              />
              แนะนำ (Recommended)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={Boolean(defaults?.featured)}
              />
              แสดงในหน้าแรก (Featured)
            </label>
          </div>
        </section>
      </div>

      <hr className="my-4 border-white/10" />

      <div id="desc" className="grid gap-5">
        <FieldLabel>คำอธิบาย</FieldLabel>
        {/* RichText ต้องสร้าง hidden &lt;input name="content"&gt; ภายในด้วย */}
        <RichText
          name="content"
          defaultValue={defaults?.content ?? ""}
          placeholder="รายละเอียดโปรแกรม วิธีใช้งาน หรือบันทึกเวอร์ชัน"
          onChange={(html) => setDescLen(html.replace(/<[^>]*>/g, "").length)}
          minHeight={180}
        />
        <div className="mt-1 flex items-center justify-between text-[11px] text-white/45">
          <span>รองรับทั้งข้อความธรรมดา / HTML สั้น ๆ</span>
          <span>{descLen} ตัวอักษร</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-4 py-2 text-sm text-black hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "กำลังบันทึก..." : mode === "edit" ? "บันทึกการแก้ไข" : "บันทึก Program"}
        </button>
      </div>
    </form>
  );
}
