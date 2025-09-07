"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { Field, baseInput } from "./ui/Field";
import { ToolbarButton } from "./ui/ToolbarButton";
import { SubmitBtn } from "./ui/SubmitBtn";
import { DatePickerField } from "./datePicker";

/** ================= Types ================= */
type Option = { id: string; label: string };

type Props = {
  mode: "create" | "update";
  action: string; // e.g. /hosts/all-hosts/api/{create|update}
  providers: Option[];
  emails: Option[];
  defaultValues?: {
    id?: string;
    title?: string;
    hostProviderId?: string | null;
    ip?: string | null;
    emailId?: string | null;
    createdAt?: string | Date | null;
    note?: string | null;
  };
};

function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const IPv4_PATTERN =
  String.raw`^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$`;

export default function FormNewHost({
  mode,
  action,
  providers,
  emails,
  defaultValues,
}: Props) {
  // Local states
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [hostProviderId, setHostProviderId] = useState(defaultValues?.hostProviderId ?? "");
  const [ip, setIp] = useState(defaultValues?.ip ?? "");
  const [emailId, setEmailId] = useState(defaultValues?.emailId ?? "");
  const [createdAt, setCreatedAt] = useState(toDateInputValue(defaultValues?.createdAt ?? new Date()));
  const [note, setNote] = useState(defaultValues?.note ?? "");

  // Derived
  const providerOptions = useMemo(() => providers, [providers]);
  const emailOptions = useMemo(() => emails, [emails]);

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const ipInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        window.history.length > 1 ? window.history.back() : (window.location.href = "/hosts/all");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Validate IP
  const ipValid = useMemo(() => new RegExp(IPv4_PATTERN).test(ip || ""), [ip]);

  return (
    <form
      ref={formRef}
      action={action}
      method="POST"
      className="grid gap-6"
      aria-label={mode === "create" ? "สร้างโฮสต์ใหม่" : "แก้ไขโฮสต์"}
      onSubmit={() => {
        if (!ipValid) {
          ipInputRef.current?.setCustomValidity("รูปแบบ IP ต้องเป็น IPv4 (0-255.x4)");
          ipInputRef.current?.reportValidity();
          setTimeout(() => ipInputRef.current?.setCustomValidity(""), 0);
        }
      }}
    >
      {mode === "update" && <input type="hidden" name="id" defaultValue={defaultValues?.id} />}

      <Card>
        <CardHeader
          title={mode === "create" ? "สร้าง All Host" : "แก้ไข All Host"}
          subtitle="บันทึกได้รวดเร็ว: กด ⌘/Ctrl+S เพื่อบันทึก, Esc เพื่อย้อนกลับ"
          right={
            <div className="flex items-center gap-2">
              <a href="/hosts/all-hosts" className="rounded-xl border border-white/20 px-3 py-2 hover:bg-white/10">ยกเลิก</a>
              <SubmitBtn label={mode === "create" ? "บันทึก" : "บันทึกการแก้ไข"} />
            </div>
          }
        />
        <CardBody>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ชื่อ (Title)" required>
              <input
                name="title"
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={baseInput}
                placeholder="ตั้งชื่อรายการโฮสต์"
                aria-required="true"
              />
            </Field>

            <Field label="Host Provider" required>
              <select
                name="hostProviderId"
                value={hostProviderId}
                onChange={(e) => setHostProviderId(e.target.value)}
                className={baseInput + " bg-transparent"}
                required
                aria-required="true"
              >
                <option value="" disabled>— เลือกผู้ให้บริการโฮสต์ —</option>
                {providerOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </Field>

            <Field
              label="IP Address"
              hint={!ip ? "รูปแบบ IPv4 เท่านั้น (x.x.x.x)" : ipValid ? "IP ถูกต้อง" : "IP ไม่ถูกต้อง"}
              required
            >
              <input
                ref={ipInputRef}
                name="ip"
                inputMode="numeric"
                pattern={IPv4_PATTERN}
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className={
                  baseInput +
                  " " +
                  (ip ? (ipValid ? "focus:ring-emerald-300 border-emerald-300" : "focus:ring-rose-300 border-rose-300") : "")
                }
                placeholder="เช่น 192.168.1.1"
                required
                aria-invalid={Boolean(ip) && !ipValid}
                title="กรุณากรอก IPv4 เช่น 203.0.113.10"
              />
            </Field>

            <Field label="อีเมล (ติดต่อ/แจ้งเตือน)" required>
              <select
                name="emailId"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className={baseInput + " bg-transparent"}
                required
                aria-required="true"
              >
                <option value="" disabled>— เลือกอีเมลจากฐานข้อมูล —</option>
                {emailOptions.map((em) => (
                  <option key={em.id} value={em.id}>{em.label}</option>
                ))}
              </select>
            </Field>

            <Field label="วันที่สร้าง" required>
              <DatePickerField name="createdAt" value={createdAt} onChange={setCreatedAt} />
            </Field>

            <div className="md:col-span-2">
              <Field label="หมายเหตุ">
                <textarea
                  name="note"
                  value={note ?? ""}
                  onChange={(e) => setNote(e.target.value)}
                  className={baseInput + " min-h-28"}
                  placeholder="บันทึกข้อมูลเพิ่มเติม (ไม่บังคับ)"
                />
              </Field>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sticky footer (mobile) */}
      <div className="sticky bottom-3 z-10 mx-auto w-full max-w-xl md:hidden">
        <div className="pointer-events-none mx-3 rounded-2xl bg-gradient-to-t from-[rgb(var(--card))]/80 to-transparent h-4 -mb-4" />
        <div className="flex justify-end gap-2 rounded-2xl border border-white/15 bg-[rgb(var(--card))]/90 p-2 shadow-sm backdrop-blur">
          <a href="/hosts/all" className="rounded-xl border border-white/20 px-3 py-2 hover:bg-white/10">ยกเลิก</a>
          <ToolbarButton type="submit">บันทึก</ToolbarButton>
        </div>
      </div>
    </form>
  );
}