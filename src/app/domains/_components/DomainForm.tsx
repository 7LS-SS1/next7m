"use client";

import React, { useEffect, useMemo, useState } from "react";

type Option = { id: string; name?: string; address?: string };
type Props = {
  hosts: { id: string; name: string }[];
  emails: { id: string; address: string }[];
  teams: { id: string; name: string }[];
  /**
   * ใช้ตอนหน้าแก้ไข ส่งค่าเริ่มต้นเข้ามา
   * key ชื่อเดียวกับ name ของ input (ดูด้านล่าง)
   */
  defaults?: Partial<{
    domainType: "Money" | "NS" | "PBN";
    domainName: string;
    domainMail: string; // email id
    hostId: string;
    hostMail: string; // email id
    cloudflare: "true" | "false";
    cloudflareMail: string; // email id
    teamId: string;
    wordpress: "true" | "false";
    active: "true" | "false";
    status: "200" | "300" | "301" | "400" | "404" | "500";
    redirect: "true" | "false";
    redirectUrl: string;
    registeredAt: string;
    expiresAt: string;
  }>;
  /**
   * เปลี่ยนปลายทางได้เวลานำไปใช้หน้าแก้ไข
   * เช่น "/domains/api/update"
   */
  action?: string;
};

export default function DomainForm({
  hosts,
  emails,
  teams,
  defaults,
  action = "/domains/api/create",
}: Props) {
  // สถานะที่ต้องใช้ควบคุม UI
  const [redirect, setRedirect] = useState<"true" | "false">(defaults?.redirect ?? "false");

  // วันที่จดและวันหมดอายุ
  // เก็บรูปแบบเป็น YYYY-MM-DD เพื่อให้ส่งผ่าน form ได้ตรงไปตรงมา
  const [registeredAt, setRegisteredAt] = useState<string>(() => {
    // รองรับทั้งค่าเริ่มต้นจาก defaults หรือเปล่า
    return defaults?.registeredAt ?? "";
  });
  const [expiresAt, setExpiresAt] = useState<string>(() => {
    return defaults?.expiresAt ?? "";
  });

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

  // คำนวนวันหมดอายุอัตโนมัติเมื่อวันที่จดเปลี่ยน
  useEffect(() => {
    if (registeredAt) {
      setExpiresAt(calcPlusOneYear(registeredAt));
    } else {
      setExpiresAt("");
    }
  }, [registeredAt]);

  // สร้าง option ที่อ่านง่ายใน UI
  const emailOptions = useMemo(
    () => emails.map((e) => ({ id: e.id, label: e.address })),
    [emails]
  );
  const hostOptions = useMemo(
    () => hosts.map((h) => ({ id: h.id, label: h.name })),
    [hosts]
  );
  const teamOptions = useMemo(
    () => teams.map((t) => ({ id: t.id, label: t.name })),
    [teams]
  );

  return (
    <form
      method="post"
      action={action}
      className="card max-w-4xl rounded-2xl border border-white/10 bg-[rgb(var(--card))]/60 p-6 backdrop-blur"
    >
      {/* Header */}
      <header className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">เพิ่ม Domain ใหม่</h2>
          <p className="text-sm text-white/60">
            ระบุรายละเอียดโดเมน, โฮสต์, ทีม และคอนฟิกสำคัญให้ครบถ้วน
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="reset"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
          >
            ล้างฟอร์ม
          </button>
          <button
            type="submit"
            className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95"
          >
            บันทึก Domain
          </button>
        </div>
      </header>

      {/* Section: พื้นฐาน */}
      <Section title="ข้อมูลพื้นฐาน">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Domain Type" required hint="กำหนดประเภทการใช้งานของโดเมน">
            <select
              name="domainType"
              defaultValue={defaults?.domainType ?? "Money"}
              className="input"
              required
            >
              <option value="Money">Money</option>
              <option value="NS">NS</option>
              <option value="PBN">PBN</option>
            </select>
          </Field>

          <Field
            label="Domain Name"
            required
            hint="ตัวอย่าง: example.com (ไม่ต้องใส่ http:// หรือ https://)"
          >
            <input
              name="domainName"
              placeholder="example.com"
              defaultValue={defaults?.domainName ?? ""}
              className="input"
              required
              autoComplete="off"
              inputMode="url"
            />
          </Field>

          <Field label="วันที่จด (Registration Date)" required hint="กำหนดวันที่เริ่มต้นถือครองโดเมน">
            <input
              type="date"
              name="registeredAt"
              value={registeredAt}
              onChange={(e) => setRegisteredAt((e.target as HTMLInputElement).value)}
              className="input"
              required
            />
          </Field>

          <Field label="วันหมดอายุ (Expires At)" required hint="คำนวณอัตโนมัติ +1 ปีจากวันที่จด">
            <input
              type="date"
              name="expiresAt"
              value={expiresAt}
              // readOnly
              disabled
              className="input bg-white/5"
              required
            />
          </Field>
        </div>
      </Section>

      <Divider />

      {/* Section: อีเมล & โฮสติ้ง */}
      <Section title="อีเมล & โฮสติ้ง">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Domain Mail" hint="บัญชีอีเมลหลักของโดเมน">
            <Select name="domainMail" options={emailOptions} defaultValue={defaults?.domainMail} />
          </Field>

          <Field label="Host" required hint="เลือกผู้ให้บริการโฮสต์ของโดเมน">
            <Select name="hostId" options={hostOptions} defaultValue={defaults?.hostId} required />
          </Field>

          <Field label="Host Mail" hint="บัญชีอีเมลที่ใช้กับผู้ให้บริการโฮสต์">
            <Select name="hostMail" options={emailOptions} defaultValue={defaults?.hostMail} />
          </Field>

          <Field label="Team" hint="ทีมที่รับผิดชอบโดเมน">
            <Select name="teamId" options={teamOptions} defaultValue={defaults?.teamId} />
          </Field>
        </div>
      </Section>

      <Divider />

      {/* Section: Cloudflare & Status */}
      <Section title="ความปลอดภัย & สถานะ">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="ใช้ Cloudflare" hint="ป้องกันและเพิ่มประสิทธิภาพด้วย Cloudflare">
            <select
              name="cloudflare"
              defaultValue={defaults?.cloudflare ?? "false"}
              className="input"
            >
              <option value="true">ใช้</option>
              <option value="false">ไม่ใช้</option>
            </select>
          </Field>

          <Field label="Cloudflare Mail" hint="บัญชีอีเมลจัดการ Cloudflare (ถ้ามี)">
            <Select
              name="cloudflareMail"
              options={emailOptions}
              defaultValue={defaults?.cloudflareMail}
            />
          </Field>

          <Field label="WordPress Install" hint="โดเมนนี้ติดตั้ง WordPress หรือไม่">
            <select
              name="wordpress"
              defaultValue={defaults?.wordpress ?? "false"}
              className="input"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>

          <Field label="Active" hint="สถานะการใช้งานของโดเมน">
            <select
              name="active"
              defaultValue={defaults?.active ?? "true"}
              className="input"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </Field>

          <Field label="HTTP Status Code" hint="สถานะของปลายทางโดเมน">
            <select
              name="status"
              defaultValue={defaults?.status ?? "200"}
              className="input"
            >
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="301">301</option>
              <option value="400">400</option>
              <option value="404">404</option>
              <option value="500">500</option>
            </select>
          </Field>
        </div>
      </Section>

      <Divider />

      {/* Section: Redirect */}
      <Section title="Redirect">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="เปิดการ Redirect" hint="ถ้า Yes ต้องกรอก URL ปลายทาง">
            <select
              name="redirect"
              value={redirect}
              onChange={(e) => setRedirect((e.target as HTMLSelectElement).value as "true" | "false")}
              className="input"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </Field>

          <Field
            label="Redirect URL"
            hint="ตัวอย่าง: https://target.example.com"
            disabled={redirect !== "true"}
            required={redirect === "true"}
          >
            <input
              name="redirectUrl"
              placeholder="https://example.com"
              defaultValue={defaults?.redirectUrl ?? ""}
              className="input"
              type="url"
              disabled={redirect !== "true"}
              required={redirect === "true"}
              inputMode="url"
            />
          </Field>
        </div>
      </Section>

      {/* Footer Actions (ซ้ำ เพื่อกดบันทึกได้จากท้ายฟอร์ม) */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="reset"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
        >
          ล้างฟอร์ม
        </button>
        <button
          type="submit"
          className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95"
        >
          บันทึก Domain
        </button>
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
    <div className={disabled ? "opacity-60" : undefined}>
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