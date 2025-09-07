const buckets = new Map<string, { count: number; ts: number }>();
const WINDOW = 60_000; // 1 นาที
const MAX = 10;        // 10 ครั้ง/นาที/ไอพี

export function hit(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.ts > WINDOW) {
    buckets.set(ip, { count: 1, ts: now });
    return { allowed: true, remaining: MAX - 1 };
  }
  if (b.count >= MAX) return { allowed: false, remaining: 0 };
  b.count += 1;
  return { allowed: true, remaining: MAX - b.count };
}