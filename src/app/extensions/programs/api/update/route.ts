import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import slugify from "@lib/slugify";
import { z } from "zod";

export const runtime = "nodejs";

// ------- helpers -------
function isAcceptablePath(s: string) {
  return s.startsWith("/") || s.startsWith("./") || s.startsWith("uploads/") || s.startsWith("/uploads/");
}
const urlLoose = () =>
  z.preprocess((v) => {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s) return undefined; // optional
    // allow absolute http/https
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    // allow site-relative paths like /uploads/... or uploads/...
    if (isAcceptablePath(s)) return s;
    return undefined;
  }, z.string().optional());
async function ensureUniqueSlug(inputSlug: string, currentId: string) {
  let baseSlug = slugify(inputSlug || "").slice(0, 120);
  if (!baseSlug) {
    baseSlug = Date.now().toString();
  }
  let slug = baseSlug;
  const found = await prisma.program.findUnique({ where: { slug } });
  if (!found) return slug;
  if (found.id === currentId) return slug;
  // Try appending -2, -3, ..., -10
  for (let i = 2; i <= 10; ++i) {
    const trySlug = `${baseSlug}-${i}`;
    const exists = await prisma.program.findUnique({ where: { slug: trySlug } });
    if (!exists) return trySlug;
    if (exists.id === currentId) return trySlug;
  }
  // If still found, append a short random suffix
  const rand = Math.random().toString(36).slice(2, 7);
  return `${baseSlug}-${rand}`;
}

// helpers
const boolLoose = () =>
  z.preprocess((v) => {
    if (v === undefined || v === null) return undefined; // ให้ optional ผ่าน
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      const s = v.toLowerCase().trim();
      // รองรับค่าที่เบราว์เซอร์/ฟอร์มอาจส่งมา
      if (["true", "on", "1", "yes"].includes(s)) return true;
      if (["false", "off", "0", "no"].includes(s)) return false;
      // ถ้าส่งมาเป็นสตริงอื่นๆ ถือว่าไม่ถูกต้อง → ให้เป็น undefined ก็ได้
      return undefined;
    }
    return undefined;
  }, z.boolean().optional());

const schema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().trim().min(1, "ต้องระบุชื่อ"),
  version: z.string().trim().optional().nullable(),
  vendor: z.string().trim().optional().nullable(),
  category: z.string().trim().min(1),
  content: z.string().optional().nullable(),
  iconUrl: urlLoose(),
  fileUrl: urlLoose(),
  recommended: boolLoose(),   // << เปลี่ยนเป็น boolLoose()
  isRecommended: boolLoose(), // << เช่นเดียวกัน
  featured: boolLoose(),  
});

function toBool(v: unknown) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "on" || v === "1";
  return false;
}
const getStr = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

async function handleUpdate(req: Request) {
  try {
    const fd = await req.formData();

    const parsed = schema.safeParse({
      id: getStr(fd, "id") || undefined,
      slug: getStr(fd, "slug") || undefined,
      name: getStr(fd, "name"),
      version: getStr(fd, "version") || undefined,
      vendor: getStr(fd, "vendor") || undefined,
      category: getStr(fd, "category"),
      content: getStr(fd, "content") || undefined,
      iconUrl: getStr(fd, "iconUrl") || undefined,
      fileUrl: getStr(fd, "fileUrl") || undefined,
      recommended: fd.get("recommended"),
      isRecommended: fd.get("isRecommended"),
      featured: fd.get("featured"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // หาเป้าหมายจาก id หรือ slug
    const where = data.id
      ? { id: data.id }
      : data.slug
        ? { slug: data.slug }
        : null;

    if (!where) {
      return NextResponse.json(
        { ok: false, error: "ไม่พบรหัสสำหรับอัปเดต (id/slug)" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าข้อมูลเป้าหมายมีอยู่จริงหรือไม่
    const target = await prisma.program.findFirst({ where });
    if (!target) {
      return NextResponse.json(
        { ok: false, error: "ไม่พบข้อมูลสำหรับอัปเดต" },
        { status: 404 }
      );
    }

    // ใช้ ensureUniqueSlug
    const uniqueSlug = await ensureUniqueSlug(
      data.slug && data.slug.trim() ? data.slug : data.name,
      target.id
    );

    const updated = await prisma.program.update({
      where: { id: target.id },
      data: {
        name: data.name,
        version: data.version || null,
        vendor: data.vendor || null,
        category: data.category,
        content: data.content || null,
        iconUrl: data.iconUrl || null,
        fileUrl: data.fileUrl || null,
        recommended: toBool(data.recommended),
        isRecommended: toBool(data.isRecommended),
        featured: toBool(data.featured),
        slug: uniqueSlug,
      },
      select: { id: true, slug: true },
    });

    // ให้ client ทำ redirect เอง (ProgramForm ทำอยู่แล้ว)
    return NextResponse.json({
      ok: true,
      id: updated.id,
      slug: updated.slug,
      message: "อัปเดตสำเร็จ",
      status: "updated",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handleUpdate(req);
}

export async function PUT(req: Request) {
  return handleUpdate(req);
}

export async function PATCH(req: Request) {
  return handleUpdate(req);
}
