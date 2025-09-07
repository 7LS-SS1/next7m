"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
    status: string; // Prisma enum DomainStatus
    createdAt: string;
    updatedAt: string;
    expiresAt: string; // ISO yyyy-mm-dd
    registeredAt: string; // ISO yyyy-mm-dd
    activeStatus: boolean;
    price: number | null;

    cloudflareMailId: string | null;
    domainMailId: string | null;
    hostId: string | null;
    ip: string | null;
    hostMailId: string | null;
    hostTypeId: string | null;
    redirect: boolean;
    teamId: string | null;
    wordpressInstall: boolean;
  }>;
  action?: string | ((formData: FormData) => void | Promise<void>);
};

const IPV4 =
  /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;

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

  // --- Host & IP (from AllHost) ---
  const [hostId, setHostId] = useState<string>(defaults?.hostId ?? "");
  const [ip, setIp] = useState<string>(defaults?.ip ?? "");
  const [ipOptions, setIpOptions] = useState<{ id: string; ip: string; title: string }[]>([]);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState<string | null>(null);
  const [manualIp, setManualIp] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  // helper: เพิ่ม 1 ปีจากวันที่รูปแบบ YYYY-MM-DD
  function calcPlusOneYear(ymd: string): string {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-").map((v) => parseInt(v, 10));
    if (!y || !m || !d) return "";
    const base = new Date(Date.UTC(y, m - 1, d));
    const targetYear = y + 1;
    const target = new Date(Date.UTC(targetYear, m - 1, 1));
    const lastDay = new Date(Date.UTC(targetYear, m, 0)).getUTCDate();
    const day = Math.min(d, lastDay);
    target.setUTCDate(day);
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

  // โหลด IPs จาก AllHost ตาม Host ที่เลือก (รองรับ edit preload และ abort)
  useEffect(() => {
    setIpError(null);

    // reset เมื่อเปลี่ยน host
    setIpOptions([]);
    setIp("");
    setManualIp(false);

    if (!hostId) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIpLoading(true);
    fetch(`/api/hosts/${hostId}/ips`, { signal: controller.signal, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((res) => {
        const rows: { id: string; ip: string; title: string }[] = res?.data ?? [];
        // ถ้ามีค่า IP เดิมจาก defaults แต่ไม่อยู่ในลิสต์ → เติมเข้าไปเพื่อให้เลือกได้
        const current = (defaults?.hostId === hostId && defaults?.ip) ? defaults.ip : null;
        const exists = current ? rows.some((x) => x.ip === current) : false;
        const final = exists || !current ? rows : [{ id: "current", ip: current!, title: "ปัจจุบัน (จากข้อมูลเดิม)" }, ...rows];
        setIpOptions(final);
        // ถ้ายังไม่มี ip ให้ auto select อันแรก (หรือคงว่างถ้าไม่มีตัวเลือก)
        if (!ip && final.length > 0) setIp(final[0].ip);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setIpError("โหลดรายการ IP ไม่สำเร็จ");
      })
      .finally(() => {
        setIpLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostId]);

  const isServerAction = typeof action === "function";
  const formProps: React.FormHTMLAttributes<HTMLFormElement> = {
    action: action as any,
    className:
      "card max-w-4xl rounded-2xl border border-white/10 bg-[rgb(var(--card))]/60 p-6 backdrop-blur",
  };
  if (!isServerAction) {
    formProps.method = "post";
  }

  const ipIsValid = !ip || IPV4.test(ip); // ฟอร์มยังให้ submit ได้ ถ้าจะบังคับ ใช้ required ร่วม

  return (
    <form {...formProps}>
      {/* hidden meta for update & boolean touched flags */}
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <input type="hidden" name="activeStatus__touched" value="1" />
      <input type="hidden" name="redirect__touched" value="1" />
      <input type="hidden" name="wordpressInstall__touched" value="1" />

      {/* Canonical submission value */}
      <input type="hidden" name="ip" value={ip} />

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
          <button type="reset" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5" onClick={() => { setHostId(defaults?.hostId ?? ""); setIp(defaults?.ip ?? ""); }}>
            ล้างฟอร์ม
          </button>
          <button
            type="submit"
            className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95 disabled:opacity-60"
            disabled={Boolean(hostId) && (!ip || !ipIsValid)}
            title={Boolean(hostId) && (!ip || !ipIsValid) ? "กรุณาเลือก/กรอก IP ให้ถูกต้อง" : undefined}
          >
            {isEdit ? "บันทึก" : "สร้าง"}
          </button>
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
            <select
              title="Host"
              name="hostId"
              value={hostId}
              onChange={(e) => setHostId(e.target.value)}
              className="input"
            >
              <option value="">— เลือก —</option>
              {hostOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="IP (จาก AllHost)"
            hint={
              hostId
                ? ipLoading
                  ? "กำลังโหลด IP..."
                  : ipError
                    ? ipError
                    : ipOptions.length
                      ? undefined
                      : "ไม่มี IP สำหรับ Host นี้"
                : "กรุณาเลือก Host ก่อน"
            }
            required
          >
            {!manualIp ? (
              <div className="flex items-center gap-2">
                <select
                  title="IP"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="input flex-1"
                  disabled={!hostId || ipLoading || ipOptions.length === 0}
                  aria-invalid={Boolean(hostId) && !ipIsValid}
                >
                  <option value="">{ipLoading ? "กำลังโหลด..." : ipOptions.length ? "— เลือก —" : "ไม่มี IP"}</option>
                  {ipOptions.map((row) => (
                    <option key={`${row.id}-${row.ip}`} value={row.ip}>
                      {row.ip} {row.title ? `(${row.title})` : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
                  onClick={() => { setManualIp(true); }}
                >
                  ป้อนเอง
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  title="IP"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="input flex-1"
                  placeholder="เช่น 203.0.113.10"
                  inputMode="numeric"
                  pattern={IPV4.source}
                />
                <button
                  type="button"
                  className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
                  onClick={() => { setManualIp(false); setIp(""); }}
                >
                  เลือกจากลิสต์
                </button>
              </div>
            )}
            {Boolean(hostId) && !ipIsValid && (
              <p className="mt-1 text-xs text-red-400">รูปแบบ IP ต้องเป็น IPv4 (x.x.x.x)</p>
            )}
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
        <button
          type="reset"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
          onClick={() => {
            setHostId(defaults?.hostId ?? "");
            setIp(defaults?.ip ?? "");
            setManualIp(false);
            setIpOptions([]);
            setIpError(null);
          }}
        >
          ล้างฟอร์ม
        </button>
        <button
          type="submit"
          className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95 disabled:opacity-60"
          disabled={Boolean(hostId) && (!ip || !ipIsValid)}
          title={Boolean(hostId) && (!ip || !ipIsValid) ? "กรุณาเลือก/กรอก IP ให้ถูกต้อง" : undefined}
        >
          {isEdit ? "บันทึก" : "สร้าง"}
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