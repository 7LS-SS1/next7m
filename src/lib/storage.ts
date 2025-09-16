import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { join, dirname } from "node:path";

const STORAGE_ROOT = join(process.cwd(), "storage");

function ensureDir(p: string) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }

export async function saveBufferToStorage(buf: Buffer, ext: string = "") {
  ensureDir(STORAGE_ROOT);
  const sha256 = createHash("sha256").update(buf).digest("hex");
  const key = `plugins/${new Date().toISOString().slice(0,10)}_${randomBytes(6).toString("hex")}${ext ? (ext.startsWith(".")? ext : "."+ext) : ""}`;
  const abs = join(STORAGE_ROOT, key);
  ensureDir(dirname(abs));
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(abs);
    ws.on("finish", resolve);
    ws.on("error", reject);
    ws.end(buf);
  });
  return { key, abs, sha256 };
}

export function storageDownloadUrl(key: string) {
  return `/api/files/${encodeURIComponent(key)}`;
}