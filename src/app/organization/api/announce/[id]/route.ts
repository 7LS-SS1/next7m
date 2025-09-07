import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function wantsJSON(req: Request) {
  const accept = req.headers.get("accept") || "";
  const fetchMode = req.headers.get("sec-fetch-mode") || "";
  const requestedWith = req.headers.get("x-requested-with") || "";
  return (
    accept.includes("application/json") ||
    fetchMode === "cors" ||
    requestedWith.toLowerCase() === "fetch"
  );
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const id = ctx?.params?.id;
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  }

  try {
    const fd = await req.formData();
    const title = (fd.get("title") as string | null)?.trim() || "";
    const content = (fd.get("content") as string | null) ?? "";
    const type = (fd.get("type") as string | null) ?? undefined;
    const teamId = (fd.get("teamId") as string | null) || undefined;
    const redirectTo = (fd.get("redirectTo") as string | null) || undefined;

    if (!title) {
      return NextResponse.json({ ok: false, error: "ต้องใส่หัวข้อ" }, { status: 400 });
    }

    const data: any = { title, content };
    if (type) data.type = type;
    if (teamId !== undefined) data.teamId = teamId === "" ? null : teamId;

    const a = await prisma.announcement.update({
      where: { id },
      data,
      select: { id: true },
    });

    revalidatePath("/organization/announce");
    const to = redirectTo || `/organization/announce/${a.id}/view`;

    if (wantsJSON(req)) {
      return NextResponse.json({ ok: true, id: a.id, redirect: to }, { status: 200 });
    }
    return NextResponse.redirect(new URL(to, req.url), { status: 303 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx?.params?.id;
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  }

  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/organization/announce");
    return NextResponse.json({ ok: true, status: "deleted" });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "delete failed" },
      { status: 500 }
    );
  }
}