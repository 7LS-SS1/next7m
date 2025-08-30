"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  hosts?: { id: string; name: string }[];
  hostTypes?: { id: string; name: string }[];
  emails?: { id: string; address: string }[];
  teams?: { id: string; name: string }[];

  defaults?: Partial<{
    id: string;
    name: string;
    note: string | null;
    status: string; // Prisma enum DomainStatus (ใช้ string เพื่อความเข้ากันได้)
    createdAt: string;
    updatedAt: string;
    expiresAt: string; // ISO yyyy-mm-dd
    registeredAt: string; // ISO yyyy-mm-dd
    activeStatus: boolean;
    price: number | null;
    
    cloudflareMailId: string | null;
    domainMailId: string | null;
    hostId: string | null;
    hostMailId: string | null;
    hostTypeId: string | null;
    redirect: boolean;
    teamId: string | null;
    wordpressInstall: boolean;
  }>;
  action?: string | ((formData: FormData) => void | Promise<void>);
};

export default function DomainForm({
  hosts = [],
  hostTypes = [],
  emails = [],
  teams = [],
  defaults,
  action = "/domains/api/create",
}: Props) {
  const isEdit = Boolean(defaults?.id);
  const todayYMD = new Date().toISOString().slice(0, 10);
  const initialRegistered = defaults?.registeredAt ?? todayYMD;
  const [registeredAt, setRegisteredAt] = useState<string>(initialRegistered);
  const [expiresAt, setExpiresAt] = useState<string>(
    defaults?.expiresAt ?? calcPlusOneYear(initialRegistered)
  );

  // helper: เพิ่ม 1 ปีจากวันที่รูปแบบ YYYY-MM-DD
  function calcPlusOneYear(ymd: string): string {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-").map((v) => parseInt(v, 10));
    if (!y || !m || !d) return "";
    const base = new Date(Date.UTC(y, m - 1, d));
    // เพิ่ม 1 ปีแบบคงวัน/เดือน ถ้าข้าม (เช่น 29 ก.พ.) ให้ถอยมาวันสุดท้ายของเดือน
    const targetYear = y + 1;
    const target = new Date(Date.UTC(targetYear, m - 1, 1));
    // วันสูงสุดของเดือนปลายทาง
    const lastDay = new Date(Date.UTC(targetYear, m, 0)).getUTCDate();
    const day = Math.min(d, lastDay);
    target.setUTCDate(day);
    // สร้างเป็น YYYY-MM-DD
    const yy = target.getUTCFullYear();
    const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(target.getUTCDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  }

  // สร้าง option ที่อ่านง่ายใน UI
  const emailOptions = useMemo(
    () => emails.map((e) => ({ id: e.id, label: e.address })),
    [emails]
  );
  const hostOptions = useMemo(
    () => hosts.map((h) => ({ id: h.id, label: h.name })),
    [hosts]
  );
  const hostTypeOptions = useMemo(
    () => hostTypes.map((ht) => ({ id: ht.id, label: ht.name })),
    [hostTypes]
  );
  const teamOptions = useMemo(
    () => teams.map((t) => ({ id: t.id, label: t.name })),
    [teams]
  );

  const isServerAction = typeof action === "function";
  const formProps: React.FormHTMLAttributes<HTMLFormElement> = {
    action: action as any,
    className:
      "card max-w-4xl rounded-2xl border border-white/10 bg-[rgb(var(--card))]/60 p-6 backdrop-blur",
  };
  if (!isServerAction) {
    formProps.method = "post";
  }

  return (
    <form {...formProps}>
      {/* hidden meta for update & boolean touched flags */}
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <input type="hidden" name="activeStatus__touched" value="1" />
      <input type="hidden" name="redirect__touched" value="1" />
      <input type="hidden" name="wordpressInstall__touched" value="1" />

      {/* Header */}
      <header className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{isEdit ? "แก้ไข Domain" : "สร้าง Domain"}</h2>
          <p className="text-sm text-white/60">ปรับรายละเอียดให้สอดคล้องกับฐานข้อมูล</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/domains"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
          >
            ย้อนกลับ
          </Link>
          <button type="reset" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">ล้างฟอร์ม</button>
          <button type="submit" className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95">{isEdit ? "บันทึก" : "สร้าง"}</button>
        </div>
      </header>

      {/* Section: ข้อมูลพื้นฐาน */}
      <Section title="ข้อมูลพื้นฐาน">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Field label="Domain Name" required hint="ตัวอย่าง: example.com (ไม่ต้องใส่ http/https)">
              <input
                name="name"
                placeholder="example.com"
                defaultValue={defaults?.name ?? ""}
                className="input"
                required
                autoComplete="off"
                inputMode="url"
              />
            </Field>
          </div>
          <Field label="วันที่จด (registeredAt)" required>
            <input
              type="date"
              name="registeredAt"
              value={registeredAt}
              onChange={(e) => {
                const v = (e.target as HTMLInputElement).value;
                setRegisteredAt(v);
                setExpiresAt(v ? calcPlusOneYear(v) : "");
              }}
              className="input"
              required
            />
          </Field>

          <Field label="วันหมดอายุ (expiresAt)" required hint="คำนวณอัตโนมัติ +1 ปี (แก้ไขได้)">
            <input
              type="date"
              name="expiresAt"
              value={expiresAt}
              onChange={(e) => setExpiresAt((e.target as HTMLInputElement).value)}
              className="input"
              required
              disabled
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="ราคาที่จด (บาท)">
              <input
                type="number"
                step="0.01"
                name="price"
                defaultValue={
                  typeof defaults?.price === "number" ? String(defaults.price) : ""
                }
                className="input"
                inputMode="decimal"
              />
            </Field>
          </div>
        </div>
      </Section>

      <Divider />

      {/* Section: อีเมล & โฮสติ้ง */}
      <Section title="อีเมล & โฮสติ้ง">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Domain Mail">
            <Select name="domainMailId" options={emailOptions} defaultValue={defaults?.domainMailId ?? undefined} />
          </Field>

          <Field label="Host">
            <Select name="hostId" options={hostOptions} defaultValue={defaults?.hostId ?? undefined} />
          </Field>

          <Field label="Host Type">
            <Select name="hostTypeId" options={hostTypeOptions} defaultValue={defaults?.hostTypeId ?? undefined} />
          </Field>

          <Field label="Host Mail">
            <Select name="hostMailId" options={emailOptions} defaultValue={defaults?.hostMailId ?? undefined} />
          </Field>

          <Field label="Cloudflare Mail">
            <Select name="cloudflareMailId" options={emailOptions} defaultValue={defaults?.cloudflareMailId ?? undefined} />
          </Field>

          <Field label="Team">
            <Select name="teamId" options={teamOptions} defaultValue={defaults?.teamId ?? undefined} />
          </Field>
        </div>
      </Section>

      <Divider />

      {/* Section: ค่าคอนฟิก */}
      <Section title="คอนฟิก">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Active Status">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="activeStatus" defaultChecked={Boolean(defaults?.activeStatus)} />
              <span>ใช้งานอยู่</span>
            </label>
          </Field>

          <Field label="WordPress Install">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="wordpressInstall" defaultChecked={Boolean(defaults?.wordpressInstall)} />
              <span>ติดตั้ง WordPress</span>
            </label>
          </Field>

          <Field label="เปิด Redirect">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="redirect"
                defaultChecked={Boolean(defaults?.redirect)}
              />
              <span>Redirect</span>
            </label>
          </Field>
        </div>
      </Section>

      <Divider />

      {/* Section: หมายเหตุ */}
      <Section title="หมายเหตุ">
        <div className="flex flex-col gap-2">
          <textarea
            name="note"
            defaultValue={defaults?.note ?? ""}
            className="input h-24 resize-none"
            placeholder="หมายเหตุอื่นๆ เช่น จดกับใคร, ใครเป็นผู้ดูแล, ใครเป็นผู้ติดต่อ ฯลฯ"
          />
        </div>
      </Section>
      {/* Footer Actions */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <Link
          href="/domains"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
        >
          ย้อนกลับ
        </Link>
        <button type="reset" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">ล้างฟอร์ม</button>
        <button type="submit" className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95">{isEdit ? "บันทึก" : "สร้าง"}</button>
      </div>
    </form>
  );
}

/* --------------------------------- Helpers -------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Divider() {
  return <hr className="my-4 border-white/10" />;
}

function Field({
  label,
  required,
  hint,
  disabled,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={disabled ? "opacity-60" : undefined }>
      <label className="mb-1 block text-sm font-medium">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
    </div>
  );
}

function Select({
  name,
  options,
  defaultValue,
  required,
}: {
  name: string;
  options: { id: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <select
      title={name}
      name={name}
      defaultValue={defaultValue}
      className="input"
      required={required}
    >
      <option value="">— เลือก —</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}