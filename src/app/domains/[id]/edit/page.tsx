import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DomainForm from "../../_components/DomainForm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateDomainSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อโดเมน"),
  note: z.string().optional().nullable(),

  // ทำให้ "" → undefined แล้วบังคับ enum (Prisma: ACTIVE | INACTIVE | PENDING)
  status: z
    .preprocess((v) => (v === "" || v == null ? undefined : v), z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional())
    .default("PENDING"),

  activeStatus: z.coerce.boolean().default(true),
  redirect: z.coerce.boolean().default(false),

  wordpressInstall: z.coerce.boolean().default(false),
  cloudflareMailId: z.preprocess((v) => (v === "" ? null : v), z.string().nullable().optional()),
  domainMailId: z.preprocess((v) => (v === "" ? null : v), z.string().nullable().optional()),
  hostId: z.preprocess((v) => (v === "" ? null : v), z.string().nullable().optional()),
  hostMailId: z.preprocess((v) => (v === "" ? null : v), z.string().nullable().optional()),
  hostTypeId: z.preprocess((v) => (v === "" ? null : v), z.string().nullable().optional()),
  teamId: z.preprocess((v) => (v === "" ? null : v), z.string().nullable().optional()),

  // DateTime ใน schema ไม่ nullable: อนุญาตใส่มาเพื่ออัปเดต, ถ้าไม่ใส่จะไม่อัปเดต
  expiresAt: z.preprocess((v) => (v ? v : undefined), z.coerce.date().optional()),
  registeredAt: z.preprocess((v) => (v ? v : undefined), z.coerce.date().optional()),
});

export default async function EditDomain({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Defensive DB fetch – prevent crash if Prisma not migrated or model missing
  let domain: any | null = null;
  try {
    domain = await prisma.domain.findUnique({ where: { id } });
  } catch (err) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-md border border-red-500/40 bg-red-950/20 p-4 text-red-200">
          <p className="font-medium">ไม่สามารถเชื่อมต่อฐานข้อมูลได้</p>
          <p className="text-sm opacity-80">
            โปรดตรวจสอบ Prisma migrate/generate และตาราง <code>Domain</code> ว่าพร้อมใช้งานแล้ว
          </p>
        </div>
      </div>
    );
  }

  if (!domain) return notFound();

  // โหลด options จาก Model: EmailAccount, HostProvider, HostType, Team
  type SimpleItem = { id: string; name?: string; address?: string };
  let hosts: SimpleItem[] = [];
  let hostTypes: SimpleItem[] = [];
  let emails: SimpleItem[] = [];
  let teams: SimpleItem[] = [];
  try {
    [hosts, hostTypes, emails, teams] = await Promise.all([
      prisma.hostProvider.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.hostType.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.emailAccount.findMany({ select: { id: true, address: true }, orderBy: { address: "asc" } }),
      prisma.team.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);
  } catch {}

  // แปลงวันที่จาก Date/ISO -> YYYY-MM-DD ให้ input[type=date]
  const toYMD = (v: unknown): string => {
    if (!v) return "";
    if (typeof v === "string") return v.slice(0, 10);
    try {
      return (v as Date).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const formDefaults = {
    ...domain,
    registeredAt: toYMD((domain as any).registeredAt),
    expiresAt: toYMD((domain as any).expiresAt),
  } as any;

  // Server Action: update by params.id (ไม่ต้องพึ่ง hidden id)
  async function updateDomain(formData: FormData) {
    "use server";

      const id = String(formData.get("id") || "");
      if (!id) {
        redirect(`/domains?toast=error`);
      }

    try {
      const raw = Object.fromEntries(formData.entries());

      // แปลงค่าที่คาดว่าเป็น boolean เมื่อ input type="checkbox" ไม่ส่งค่ามาจะเป็น undefined
      const normalised = {
        ...raw,
        activeStatus: Boolean(formData.get("activeStatus")),
        redirect: Boolean(formData.get("redirect")),
        wordpressInstall: Boolean(formData.get("wordpressInstall")),
      };

      // ใช้ .parse() เพื่อให้ Zod โยน error และได้ type ที่ชัดเจน
      const data = UpdateDomainSchema.parse(normalised);

      // ป้องกันการอัปเดต field ว่างให้เป็น null โดยไม่ตั้งใจ
      const cleanup = (v: unknown) => (v === "" ? null : v);

      const payload: Prisma.DomainUncheckedUpdateInput = {
        name: data.name,
        note: (data.note ?? undefined) as any, // "" ถูก preprocess ไปเป็น null/undefined แล้ว
        status: data.status as any,
        redirect: data.redirect,
        wordpressInstall: data.wordpressInstall,
        ...(data.expiresAt ? { expiresAt: data.expiresAt } : {}),
        ...(data.registeredAt ? { registeredAt: data.registeredAt } : {}),
      };
      (payload as any).activeStatus = data.activeStatus;
      // กำหนด FK ทีหลังแบบมีเงื่อนไข (เฉพาะเมื่อผู้ใช้ส่งค่าเข้ามา)
      if (data.cloudflareMailId !== undefined) (payload as any).cloudflareMailId = data.cloudflareMailId; // null = ล้างค่า
      if (data.domainMailId !== undefined) (payload as any).domainMailId = data.domainMailId;
      if (data.hostId !== undefined) (payload as any).hostId = data.hostId;
      if (data.hostMailId !== undefined) (payload as any).hostMailId = data.hostMailId;
      if (data.hostTypeId !== undefined) (payload as any).hostTypeId = data.hostTypeId;
      if (data.teamId !== undefined) (payload as any).teamId = data.teamId;

      await prisma.domain.update({ where: { id }, data: payload });

      // Revalidate และ Redirect ไปหน้า view พร้อม query สำหรับ Toast
      revalidatePath(`/domains/${id}`);
      revalidatePath(`/domains/${id}/view`);
      revalidatePath(`/domains`);
      redirect(`/domains`);
    } catch (e) {
      console.error("Domain update failed", e);
      redirect(`/domains?toast=error`);
    }
  }

  return (
    <DomainForm
      defaults={formDefaults}
      action={updateDomain}
      hosts={hosts as any}
      hostTypes={hostTypes as any}
      emails={emails as any}
      teams={teams as any}
    />
  );
}