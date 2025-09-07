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

// ====== Types ======
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
  redirectTo?: string; // path สำหรับ redirect หลังบันทึกสำเร็จ (ค่าเริ่มต้น: "/extensions/plugins")
};

// ====== Helpers ======
function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-medium tracking-wide text-white/70 mb-1">
      {children}
      {required && <span className="text-amber-400"> *</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-white/45">{children}</p>;
}

export default function PluginForm({
  defaults,
  actionUrl,
  redirectTo = "/extensions/plugins",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pickedIcon, setPickedIcon] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>(defaults?.fileUrl ?? "");
  const [iconUrl, setIconUrl] = useState<string>(defaults?.iconUrl ?? "");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);
  const [descLen, setDescLen] = useState(defaults?.content?.length ?? 0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    // อย่าส่งไฟล์ดิบ ป้องกัน 413 บน Vercel Functions
    fd.delete("file");
    fd.delete("icon");
    // ส่ง URL แทน
    if (fileUrl) fd.set("fileUrl", fileUrl);
    if (iconUrl) fd.set("iconUrl", iconUrl);

    if (!fileUrl) {
      setLoading(false);
      toast.error("กรุณาอัปโหลดไฟล์ปลั๊กอินก่อนบันทึก");
      return;
    }

    try {
      const res = await fetch(actionUrl, { method: "POST", body: fd });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.ok === false) {
        throw new Error(
          payload?.message || payload?.error || "บันทึกไม่สำเร็จ"
        );
      }
      toast.success("บันทึกสำเร็จ 🎉");
      form.reset();
      setPickedFile(null);
      setPickedIcon(null);
      setDescLen(0);

      // ย้ายไปหน้า list พร้อมส่งพารามิเตอร์ให้หน้า list แสดง toast อีกครั้ง (กรณีมี ToastMount อ่านค่าจาก searchParam)
      const url = new URL(redirectTo, window.location.origin);
      // แนบสเตตัสแบบสั้น ๆ ให้ Toaster ด้าน list ตัดสินใจข้อความ
      url.searchParams.set("toast", payload?.status ?? "created"); // created/updated
      // แนบข้อความก็ได้ (optional)
      if (payload?.message) url.searchParams.set("msg", payload.message);

      router.push(url.pathname + "?" + url.searchParams.toString());
      router.refresh(); // ให้ list รีโหลดข้อมูลใหม่
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

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setPickedFile(f);
    if (!f) return;
    try {
      setUploadingFile(true);
      const url = await uploadToBlob(f);
      setFileUrl(url);
      toast.success("อัปโหลดไฟล์ปลั๊กอินสำเร็จ");
    } catch (err: any) {
      setFileUrl("");
      toast.error(err?.message || "อัปโหลดไฟล์ปลั๊กอินไม่สำเร็จ");
    } finally {
      setUploadingFile(false);
    }
  }

  async function onIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setPickedIcon(f);
    if (!f) return;
    try {
      setUploadingIcon(true);
      const url = await uploadToBlob(f);
      setIconUrl(url);
      toast.success("อัปโหลดไอคอนสำเร็จ");
    } catch (err: any) {
      setIconUrl("");
      toast.error(err?.message || "อัปโหลดไอคอนไม่สำเร็จ");
    } finally {
      setUploadingIcon(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setPickedFile(f);
  }

  // ====== Upload Helpers ======
  async function prepareUpload() {
    const res = await fetch("/api/upload/prepare", { method: "POST" });
    if (!res.ok) throw new Error("เตรียมอัปโหลดไม่สำเร็จ");
    const j = await res.json();
    if (!j?.url) throw new Error("ไม่สามารถออก URL สำหรับอัปโหลดได้");
    return j.url as string;
  }

  async function uploadToBlob(file: File) {
    const uploadUrl = await prepareUpload();
    const put = await fetch(uploadUrl, { method: "PUT", body: file });
    if (!put.ok) throw new Error("อัปโหลดไฟล์ไม่สำเร็จ");
    const meta = await put.json().catch(() => ({}));
    // รองรับทั้ง meta.url (ใหม่) หรือใช้ uploadUrl (กรณี lib ให้ URL final)
    return (meta?.url as string) || uploadUrl;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-[rgb(var(--card))]/70 p-5 backdrop-blur"
    >
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">
            สร้าง / แก้ไข Plugin
          </h2>
          <p className="text-xs text-white/50">
            กรอกข้อมูลให้ครบถ้วนเพื่อการค้นหาและติดตั้งที่ง่ายขึ้น
          </p>
        </div>
        <button
          type="submit"
          disabled={loading || uploadingFile || uploadingIcon}
          className="mt-2 sm:mt-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95 disabled:opacity-60"
          aria-label="บันทึก Plugin"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-20"
                ></circle>
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-80"
                ></path>
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
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
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
                defaultValue={defaults?.category ?? "Misc"}
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
          <div>
            <FieldLabel>อัปโหลด Plugin</FieldLabel>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={onPickFile}
              role="button"
              aria-label="อัปโหลดไฟล์ Plugin"
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
                    {(pickedFile.size / 1024 / 1024).toFixed(2)} MB
                    {uploadingFile ? " • กำลังอัปโหลด..." : fileUrl ? " • อัปโหลดแล้ว" : ""}
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
                    รองรับ .zip, .tar.gz, .rar, .7z
                  </span>
                </div>
              )}
            </div>
            <Hint>ไฟล์จะถูกอัปโหลดและเชื่อมโยงกับรายการนี้โดยอัตโนมัติ</Hint>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 truncate">
            <FieldLabel>อัปโหลดไอคอน</FieldLabel>
            <div className="flex items-center gap-4">
              <div className="grid place-items-center size-16 rounded-xl bg-white/10 overflow-hidden">
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
                  // แสดง icon เดิมถ้ามีค่าใน defaults
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
                    <span className="text-xs rounded-full border border-white/10 bg-white/10 px-2 py-0.5">
                      {pickedIcon.name}
                    </span>
                  )}
                  {pickedIcon && (
                    <button
                      type="button"
                      onClick={() => setPickedIcon(null)}
                      className="text-xs text-white/70 hover:text-white/90 underline"
                    >
                      ล้างรูป
                    </button>
                  )}
                </div>
                {uploadingIcon && <p className="text-[11px] text-white/60 mt-1">กำลังอัปโหลดไอคอน...</p>}
                {!uploadingIcon && iconUrl && <p className="text-[11px] text-emerald-400 mt-1">อัปโหลดไอคอนแล้ว</p>}
                <Hint>
                  รองรับ PNG / JPG / WEBP / SVG — <br /> ขนาดแนะนำ ≤ 512×512
                </Hint>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="recommended"
                defaultChecked={defaults?.recommended}
              />
              แนะนำ (Recommended)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={defaults?.featured}
              />
              แสดงในหน้าแรก (Featured)
            </label>
          </div>

          <div className="grid gap-2">
            <FieldLabel>ลิงก์ไอคอน (ถ้ามี)</FieldLabel>
            <input
              name="iconUrl"
              placeholder="https://.../icon.png"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
            />
            <FieldLabel>ลิงก์ไฟล์ (ถ้าอัปโหลดไว้ที่อื่น)</FieldLabel>
            <input
              name="fileUrl"
              placeholder="https://.../plugin.zip"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:ring-2 focus:ring-white/10"
            />
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={loading || uploadingFile || uploadingIcon}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95 disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-20"
                ></circle>
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-80"
                ></path>
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
