// src/app/domains/api/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { DomainStatus } from "@prisma/client";

/* -----------------------------------------------------
 * Helpers
 * --------------------------------------------------- */
const toURL = (path: string, req: Request) => new URL(path, req.url);
const trim = (v: unknown) => (v == null ? "" : String(v).trim());
const toBool = (v: unknown) => {
  const s = trim(v).toLowerCase();
  return s === "true" || s === "1" || s === "on" || s === "yes";
};
const toDate = (v: unknown) => {
  const s = trim(v);
  if (!s) return undefined;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00.000Z` : s;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
};
const toInt = (v: unknown) => {
  const s = trim(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isInteger(n) ? (n as number) : undefined;
};
const toFloat = (v: unknown) => {
  let s = trim(v);
  if (!s) return undefined;
  // normalize Thai numerals ๐-๙ to 0-9
  const th = "๐๑๒๓๔๕๖๗๘๙";
  s = s
    .replace(/[฿\s]/g, "")            // remove currency symbol & spaces
    .replace(/[，]/g, ",");            // full-width comma to normal comma
  // map Thai digits
  s = s.replace(/[๐-๙]/g, (d) => String(th.indexOf(d)));
  // remove thousand separators (commas). Assume dot is decimal separator in our locale.
  s = s.replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? (n as number) : undefined;
};

const IPV4 = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;

const getFD = (fd: FormData, key: string): FormDataEntryValue | null =>
  fd.get(key) ?? fd.get(`1_${key}`) ?? null;
const hasFD = (fd: FormData, key: string): boolean =>
  fd.has(key) || fd.has(`1_${key}`);

const safe = (v: any) => {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const MODEL_FIELDS = new Set([
  "name",
  "note",
  "status",
  "expiresAt",
  "registeredAt",
  "activeStatus",
  "price",
  "cloudflareMailId",
  "domainMailId",
  "hostId",
  "hostMailId",
  "hostTypeId",
  "redirect",
  "teamId",
  "wordpressInstall",
  "ip",
]);

/* -----------------------------------------------------
 * POST /domains/api/update
 * Accepts multipart/form-data from DomainForm
 * --------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    const snapshot: Record<string, any> = {};
    for (const [k, val] of fd.entries()) {
      // avoid logging big blobs/files
      if (typeof val === "string") snapshot[k] = val;
      else snapshot[k] = `[${val.constructor?.name ?? "Blob"}]`;
    }
    // quick hint if fields are prefixed (e.g., "1_")
    const prefixed = Object.keys(snapshot).some((k) => k.startsWith("1_"));
    if (prefixed) console.warn("[domains.update] detected prefixed keys (e.g., '1_'). Using compatibility reader.");
    console.info("[domains.update] incoming form:", safe(snapshot));

    // id (required)
    const id = trim(getFD(fd, "id"));
    if (!id) {
      return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
    }
    console.info("[domains.update] target id:", id);

    // Build update payload (assign only provided fields)
    const data: Record<string, any> = {};
    const set = (k: string, v: any) => {
      if (v === undefined) return;
      if (!MODEL_FIELDS.has(k)) {
        console.warn("[domains.update] ignoring unknown key:", k);
        return;
      }
      data[k] = v;
    };

    // name (required in schema) -> update only if non-empty string
    const name = trim(getFD(fd, "name"));
    if (name) set("name", name);

    // note (nullable)
    if (hasFD(fd, "note")) {
      const s = trim(getFD(fd, "note"));
      set("note", s === "" ? null : s);
    }

    // status enum (PENDING | ACTIVE | INACTIVE)
    const statusRaw = trim(getFD(fd, "status"));
    if (statusRaw) {
      const upper = statusRaw.toUpperCase();
      if (["PENDING", "ACTIVE", "INACTIVE"].includes(upper)) {
        set("status", upper as DomainStatus);
      }
    }

    // Dates (non-nullable in schema, update only when provided)
    const registeredAt = toDate(getFD(fd, "registeredAt"));
    if (registeredAt) set("registeredAt", registeredAt);
    const expiresAt = toDate(getFD(fd, "expiresAt"));
    if (expiresAt) set("expiresAt", expiresAt);

    // Booleans (support __touched to allow false)
    if (hasFD(fd, "activeStatus") || hasFD(fd, "activeStatus__touched")) set("activeStatus", toBool(getFD(fd, "activeStatus")));
    if (hasFD(fd, "redirect") || hasFD(fd, "redirect__touched")) set("redirect", toBool(getFD(fd, "redirect")));
    if (hasFD(fd, "wordpressInstall") || hasFD(fd, "wordpressInstall__touched")) set("wordpressInstall", toBool(getFD(fd, "wordpressInstall")));

    // Price (nullable Float)
    // Use `price__touched` so empty input can explicitly clear to null
    if (hasFD(fd, "price") || hasFD(fd, "price__touched")) {
      const raw = getFD(fd, "price");
      const s = trim(raw);
      console.info("[domains.update] price/raw=", safe(raw), " touched=", hasFD(fd, "price__touched"));
      if (s === "") {
        set("price", null);
      } else {
        const f = toFloat(raw);
        if (f === undefined) {
          console.error("[domains.update] invalid price:", safe(raw));
          return NextResponse.redirect(toURL("/domains?toast=error&reason=invalid_price", req), { status: 303 });
        }
        set("price", f);
      }
    }

    // Nullable FKs (empty string -> null, missing -> not updated)
    if (hasFD(fd, "hostId")) set("hostId", trim(getFD(fd, "hostId")) || null);
    if (hasFD(fd, "hostTypeId")) set("hostTypeId", trim(getFD(fd, "hostTypeId")) || null);
    if (hasFD(fd, "teamId")) set("teamId", trim(getFD(fd, "teamId")) || null);
    if (hasFD(fd, "domainMailId")) set("domainMailId", trim(getFD(fd, "domainMailId")) || null);
    if (hasFD(fd, "hostMailId")) set("hostMailId", trim(getFD(fd, "hostMailId")) || null);
    if (hasFD(fd, "cloudflareMailId")) set("cloudflareMailId", trim(getFD(fd, "cloudflareMailId")) || null);

    // IP (nullable string) — allow clear to null, validate IPv4 when provided
    if (hasFD(fd, "ip")) {
      const ipRaw = getFD(fd, "ip");
      const ipStr = trim(ipRaw);
      if (ipStr === "") {
        set("ip", null);
      } else if (!IPV4.test(ipStr)) {
        console.error("[domains.update] invalid ip:", safe(ipRaw));
        return NextResponse.redirect(toURL("/domains?toast=error&reason=invalid_ip", req), { status: 303 });
      } else {
        set("ip", ipStr);
      }
    }

    // ถ้าเลือก Host (มี hostId ไม่ว่าง) แต่ไม่มี ip (ไม่ส่งมา หรือเป็นค่าว่าง) ให้แจ้งเตือน
    if (hasFD(fd, "hostId")) {
      const _host = trim(getFD(fd, "hostId"));
      const hasIpField = hasFD(fd, "ip");
      const ipVal = hasIpField ? trim(getFD(fd, "ip")) : "";
      if (_host && (!hasIpField || ipVal === "")) {
        console.error("[domains.update] hostId provided but ip missing/empty");
        return NextResponse.redirect(toURL("/domains?toast=error&reason=ip_required_when_host", req), { status: 303 });
      }
    }

    console.info("[domains.update] built payload: ", safe(data));
    // Verify keys & types against DB model expectations
    for (const [k, v] of Object.entries(data)) {
      if (!MODEL_FIELDS.has(k)) {
        console.error("[domains.update] payload contains non-model key:", k);
        return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
      }
      // lightweight type checks
      if ((k === "registeredAt" || k === "expiresAt") && !(v instanceof Date)) {
        console.error("[domains.update] invalid type for date field", k, typeof v);
        return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
      }
      if ((k === "activeStatus" || k === "redirect" || k === "wordpressInstall") && typeof v !== "boolean") {
        console.error("[domains.update] invalid boolean for", k, v);
        return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
      }
      if (["hostId","hostTypeId","teamId","domainMailId","hostMailId","cloudflareMailId"].includes(k)) {
        if (!(typeof v === "string" || v === null)) {
          console.error("[domains.update] invalid FK value for", k, v);
          return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
        }
      }
      if (k === "status" && !["PENDING","ACTIVE","INACTIVE"].includes(String(v))) {
        console.error("[domains.update] invalid enum for status:", v);
        return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
      }
      if (k === "price" && !(typeof v === "number" || v === null)) {
        console.error("[domains.update] invalid type for price:", v);
        return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
      }
      if (k === "ip" && !(typeof v === "string" || v === null)) {
        console.error("[domains.update] invalid type for ip:", v);
        return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
      }
    }
    if (Object.keys(data).length === 0) {
      console.warn("[domains.update] empty payload — no fields provided");
      return NextResponse.redirect(toURL("/domains?toast=error&reason=empty_payload", req), { status: 303 });
    }

    try {
      const result = await prisma.domain.update({ where: { id }, data: data as any });
      console.info("[domains.update] update success for id=", id);
      return NextResponse.redirect(toURL("/domains", req), { status: 303 });
    } catch (err: any) {
      // log prisma-like error shape
      console.error("[domains.update] prisma.update failed", {
        code: err?.code,
        message: err?.message,
        meta: err?.meta,
        stack: err?.stack,
      });
      return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
    }
  } catch (err: any) {
    console.error("[domains.update] handler crashed", {
      method: (req as any)?.method,
      url: (req as any)?.url,
      message: err?.message,
      stack: err?.stack,
    });
    const code = err?.code;
    if (code === "P2002") return NextResponse.redirect(toURL("/domains?toast=dupe", req), { status: 303 });
    if (code === "P2003") return NextResponse.redirect(toURL("/domains?toast=fk", req), { status: 303 });
    return NextResponse.redirect(toURL("/domains?toast=error", req), { status: 303 });
  }
}