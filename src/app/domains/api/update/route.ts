import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";

const LIST = "/domains";
const trim = (v: unknown) => (v == null ? undefined : v.toString().trim());
const empty = (v: unknown) => {
  const s = v == null ? "" : v.toString().trim();
  return s === "" ? undefined : s;
};

const Schema = z.object({
  id: z.preprocess(trim, z.string().min(1)),
  name: z.preprocess(trim, z.string().min(2).max(255)),
  note: z.preprocess(empty, z.string().max(500).optional()),
  status: z.preprocess(trim, z.enum(["ACTIVE", "INACTIVE"]).optional()),
});

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const p = Schema.safeParse({
      id: fd.get("id"),
      name: fd.get("name"),
      note: fd.get("note"),
      status: fd.get("status"),
    });
    if (!p.success) {
      return NextResponse.redirect(new URL(`${LIST}?toast=invalid&detail=ข้อมูลไม่ถูกต้อง`, req.url), { status: 303 });
    }

    const data: Record<string, any> = { name: p.data.name };
    if (p.data.note !== undefined) data.note = p.data.note;
    if (p.data.status) data.status = p.data.status;

    await prisma.domain.update({ where: { id: p.data.id }, data });
    revalidatePath(LIST);
    return NextResponse.redirect(new URL(`${LIST}?toast=updated&detail=อัปเดตสำเร็จ`, req.url), { status: 303 });
  } catch (e: any) {
    const detail = encodeURIComponent(e?.message ?? "อัปเดตไม่สำเร็จ");
    return NextResponse.redirect(new URL(`${LIST}?toast=error&detail=${detail}`, req.url), { status: 303 });
  }
}