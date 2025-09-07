"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ====== Options ======
const TYPES = ["UX/UI", "SEO", "Performance", "Security", "Other"] as const;
const CATEGORIES = [
  "Elementor",
  "Yoast SEO",
  "SSL",
  "Security",
  "Wordfence",
  "Misc.",
] as const;

type Props = {
  defaults?: {
    id?: string;
    name?: string;
    version?: string;
    vendor?: string;
    pluginType?: string;
    category?: string;
    content?: string;
    iconUrl?: string;
    fileUrl?: string;
    recommended?: boolean;
    featured?: boolean;
  };
  actionUrl: string; // `/extensions/plugins/api/create` หรือ `/extensions/plugins/api/update`
  redirectTo?: string; // path หลังบันทึกสำเร็จ (ค่าเริ่มต้น: "/extensions/plugins")
};

// ====== Helpers (UI) ======
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

// ====== Component ======
export default function PluginForm({
  defaults,
  actionUrl,
  redirectTo = "/extensions/plugins",
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // เก็บไฟล์ที่ “ลากมา” เพื่อโชว์ชื่อ/ขนาดเท่านั้น (จะไม่อัปโหลด)
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pickedIcon, setPickedIcon] = useState<File | null>(null);

  // ฟอร์มโหมด URL เท่านั้น
  const [fileUrl, setFileUrl] = useState<string>(defaults?.fileUrl ?? "");
  const [iconUrl, setIconUrl] = useState<string>(defaults?.iconUrl ?? "");

  const fileRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  const [descLen, setDescLen] = useState(defaults?.content?.length ?? 0);

  // ====== Submit ======
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const form = e.currentTarget;

    // ✅ validate ชื่อ + URL ไฟล์
    const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
    if (!nameInput?.value.trim()) {
      toast.error("กรอกชื่อปลั๊กอินก่อนบันทึก");
      nameInput?.focus();
      return;
    }
    // if (!fileUrl.trim()) {
    //   toast.error("กรุณาวางลิงก์ไฟล์ปลั๊กอิน (fileUrl) ก่อนบันทึก");
    //   return;
    // }

    setLoading(true);
    const fd = new FormData(form);

    // ❌ ไม่ส่งไฟล์ดิบขึ้น API
    fd.delete("file");
    fd.delete("icon");
    // ✅ ส่งเฉพาะ URL
    fd.set("fileUrl", fileUrl.trim());
    if (iconUrl.trim()) fd.set("iconUrl", iconUrl.trim());

    try {
      const res = await fetch(actionUrl, { method: "POST", body: fd });
      const payload = await res.json().catch(() => ({} as any));

      if (!res.ok || payload?.ok === false) {
        throw new Error(payload?.message || payload?.error || "บันทึกไม่สำเร็จ");
      }

      const createdId = (payload?.data?.id || payload?.program?.id || payload?.plugin?.id) as
        | string
        | undefined;

      toast.success("บันทึกสำเร็จ");
      form.reset();
      setPickedFile(null);
      setPickedIcon(null);
      setDescLen(0);

      const url = new URL(redirectTo, window.location.origin);
      url.searchParams.set("toast", payload?.status ?? "created");
      if (payload?.message) url.searchParams.set("msg", payload.message);
      router.push(url.pathname + "?" + url.searchParams.toString());
      router.refresh();

      // ถ้ายังมี flow ประมวลผลเบื้องหลังจาก URL ให้เรียกต่อ (optional)
      if (createdId) {
        fetch("/extensions/plugins/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: createdId }),
        }).catch(() => {});
      }
    } catch (err: any) {
      toast.error(err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  function onPickFile() {
    fileRef.current?.click();
  }

  function onPickIcon() {
    iconRef.current?.click();
  }

  // ====== DragDrop / File Picker (แสดงผลอย่างเดียว ไม่อัปโหลด) ======
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setPickedFile(f);
    if (f) {
      toast.message("เลือกไฟล์สำเร็จ", {
        description: "โหมด URL เท่านั้น: กรุณาวางลิงก์ไฟล์ในช่องด้านล่าง",
      });
    }
  }

  function onIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setPickedIcon(f);
    if (f) {
      toast.message("เลือกรูปไอคอนสำเร็จ", {
        description: "โหมด URL เท่านั้น: กรุณาวางลิงก์ไอคอนในช่องด้านล่าง (ถ้ามี)",
      });
    }
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);

    // รองรับลาก “ลิงก์ URL” เพื่อเติม fileUrl อัตโนมัติ
    const uri = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (uri && /^https?:\/\//i.test(uri.trim())) {
      setFileUrl(uri.trim());
      toast.success("เติม URL จากการลากลิงก์สำเร็จ");
      return;
    }

    // หากเป็นไฟล์ ให้แสดงชื่อ/ขนาดเป็น reference เฉย ๆ
    const f = e.dataTransfer.files?.[0] || null;
    setPickedFile(f);
    if (f) {
      toast.message("ลากไฟล์เข้ามาแล้ว", {
        description: "โหมด URL เท่านั้น: กรุณาวางลิงก์ไฟล์ในช่องด้านล่าง",
      });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card mx-auto w/full max-w-4xl rounded-2xl border border-white/10 bg-[rgb(var(--card))]/70 p-5 backdrop-blur"
    >
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">สร้าง / แก้ไข Plugin</h2>
          <p className="text-xs text-white/50">
            โหมด URL เท่านั้น — ยังมี Drag & Drop เพื่อช่วยระบุไฟล์/ลิงก์ แต่จะไม่อัปโหลดไฟล์อัตโนมัติ
          </p>
        </div>
        <button
          type="submit"
          disabled={loading || !fileUrl.trim()}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-4 py-2 text-sm text-black hover:brightness-95 disabled:opacity-60 sm:mt-0"
          aria-label="บันทึก Plugin"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-80" />
              </svg>
              กำลังบันทึก...
            </span>
          ) : (
            "บันทึก Plugin"
          )}
        </button>
      </div>

      {/* Divider */}
      <hr className="my-4 border-white/10" />

      {/* Grid 2 cols */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left column */}
        <section className="grid gap-4">
          <div>
            <FieldLabel required>ชื่อ</FieldLabel>
            <input
              name="name"
              placeholder="เช่น: Elementor Pro"
              defaultValue={defaults?.name}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:border-white/20 focus:ring-2 focus:ring-white/10"
              required
            />
            <Hint>ชื่อปลั๊กอินที่จะใช้แสดงผลในหน้า List / View</Hint>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>เวอร์ชัน</FieldLabel>
              <input
                name="version"
                placeholder="1.2.3"
                defaultValue={defaults?.version ?? ""}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
              />
              <Hint>ระบุถ้าต้องการติดตามการอัปเดต</Hint>
            </div>
            <div>
              <FieldLabel>ผู้พัฒนา (Vendor)</FieldLabel>
              <input
                name="vendor"
                placeholder="เช่น: Automattic"
                defaultValue={defaults?.vendor ?? ""}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>ประเภท (Type)</FieldLabel>
              <select
                name="pluginType"
                defaultValue={defaults?.pluginType ?? "WordPress"}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[rgb(var(--card))]">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>หมวดหมู่ (Category)</FieldLabel>
              <select
                name="category"
                defaultValue={defaults?.category ?? "Misc."}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[rgb(var(--card))]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <FieldLabel>คำอธิบาย</FieldLabel>
            <textarea
              name="content"
              placeholder="รายละเอียดเกี่ยวกับปลั๊กอิน วิธีใช้งาน หรือบันทึกเวอร์ชัน"
              defaultValue={defaults?.content ?? ""}
              rows={7}
              onChange={(e) => setDescLen(e.target.value.length)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-white/45">
              <span>รองรับทั้งข้อความธรรมดา / HTML สั้น ๆ</span>
              <span>{descLen} ตัวอักษร</span>
            </div>
          </div>
        </section>

        {/* Right column */}
        <section className="grid gap-4">
          {/* DragDrop กล่องใหญ่ — ไม่อัปโหลด แค่ช่วยรับไฟล์/URL */}
          <div>
            <FieldLabel>Drag & Drop / เลือกไฟล์ (ไม่อัปโหลดอัตโนมัติ)</FieldLabel>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={onPickFile}
              role="button"
              aria-label="drop zone"
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
                accept=".zip,.tar,.tar.gz,.tgz,.rar,.7z"
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
                    {(pickedFile.size / 1024 / 1024).toFixed(2)} MB • โหมด URL เท่านั้น
                  </span>
                  <span className="text-[11px] text-white/45">
                    วางลิงก์ไฟล์ในช่องด้านล่างเพื่อใช้งานจริง
                  </span>
                </div>
              ) : (
                <div className="grid gap-0.5">
                  <span className="text-sm font-medium">
                    ลาก “ไฟล์” เพื่อดูชื่อ/ขนาด หรือ “ลากลิงก์ URL” เพื่อเติมอัตโนมัติ
                  </span>
                  <span className="text-[11px] text-white/60">
                    รองรับ .zip, .tar.gz, .rar, .7z — *ไม่อัปโหลดไฟล์*
                  </span>
                </div>
              )}
            </div>
            <Hint>
              หากลาก “ลิงก์ URL” จากที่เก็บไฟล์ของคุณ จะเติมช่องด้านล่างให้อัตโนมัติ
            </Hint>
          </div>

          {/* ไอคอน */}
          <div className="truncate rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <FieldLabel>เลือกรูปไอคอน (ไม่อัปโหลดอัตโนมัติ)</FieldLabel>
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center overflow-hidden rounded-xl bg-white/10">
                {pickedIcon ? (
                  <img
                    src={URL.createObjectURL(pickedIcon)}
                    alt="icon preview"
                    className="h-10 w-10 object-contain"
                    onLoad={(e) =>
                      URL.revokeObjectURL((e.currentTarget as HTMLImageElement).src)
                    }
                  />
                ) : iconUrl ? (
                  <img src={iconUrl} alt="current icon" className="h-10 w-10 object-contain" />
                ) : defaults?.iconUrl ? (
                  <img src={defaults.iconUrl} alt="default icon" className="h-10 w-10 object-contain" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-white/60" aria-hidden>
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
                  {(pickedIcon || iconUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setPickedIcon(null);
                        setIconUrl("");
                        if (iconRef.current) iconRef.current.value = "";
                      }}
                      className="text-xs text-white/70 underline hover:text-white/90"
                    >
                      ล้างรูป
                    </button>
                  )}
                </div>
                <Hint>โหมด URL เท่านั้น: วางลิงก์ไอคอนด้านล่าง (ถ้ามี)</Hint>
              </div>
            </div>
          </div>

          {/* ช่องกรอก URL จริง */}
          <div className="grid gap-2">
            <FieldLabel>ลิงก์ไฟล์ปลั๊กอิน (fileUrl)</FieldLabel>
            <input
              name="fileUrl"
              placeholder="https://.../plugin.zip"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
            
            />
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 underline"
              >
                เปิดดูไฟล์
              </a>
            )}

            <FieldLabel>ลิงก์ไอคอน (iconUrl)</FieldLabel>
            <input
              name="iconUrl"
              placeholder="https://.../icon.png"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
            />
            {iconUrl && (
              <a
                href={iconUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 underline"
              >
                เปิดดูไอคอน
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="recommended" defaultChecked={defaults?.recommended} />
              แนะนำ (Recommended)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={defaults?.featured} />
              แสดงในหน้าแรก (Featured)
            </label>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={loading || !pickedFile }
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-4 py-2 text-sm text-black hover:brightness-95 disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-80" />
              </svg>
              กำลังบันทึก...
            </span>
          ) : (
            "บันทึก Plugin"
          )}
        </button>
      </div>
    </form>
  );
}