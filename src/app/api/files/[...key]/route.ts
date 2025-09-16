import { NextRequest } from "next/server";
import { join } from "node:path";
import { stat, readFile } from "node:fs/promises";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: { key: string[] } }) {
  const key = params.key.join("/");
  const abs = join(process.cwd(), "storage", key);
  try {
    const s = await stat(abs);
    const buf = await readFile(abs);
    return new Response(buf, {
      headers: {
        "Content-Length": s.size.toString(),
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}