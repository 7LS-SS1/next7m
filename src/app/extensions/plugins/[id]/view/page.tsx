import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@lib/db";
import { formatDateTime, timeAgo, humanEnum } from "@lib/format";
import CopyButton from "@components/CopyButton";

// Color styles for statuses (light/dark friendly)
const statusStyle: Record<string, string> = {
  QUEUED:
    "bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700",
  PROCESSING:
    "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800/50",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800/50",
  FAILED:
    "bg-rose-100 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800/50",
};

const baseSelect = {
  id: true,
  name: true,
  version: true,
  vendor: true,
  pluginType: true,
  category: true,
  content: true,
  iconUrl: true,
  fileUrl: true,
  recommended: true,
  featured: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  processedAt: true,
  error: true,
} as const;

export default async function PluginViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next.js 15 dynamic params

  const plugin = await getPlugin(id);
  if (!plugin) notFound();

  const {
    name,
    version,
    vendor,
    pluginType,
    category,
    content,
    iconUrl,
    fileUrl,
    recommended,
    featured,
    slug,
    createdAt,
    updatedAt,
    status,
    processedAt,
    error,
  } = plugin;

  const rawUrl = (fileUrl ?? "").trim();
  const statusClass = statusStyle[status] ?? statusStyle.QUEUED;

  const downloadUrl = rawUrl;

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6">
      {/* Back */}
      <div className="mb-4">
        <Link
          href="/extensions/plugins"
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-neutral-300 dark:ring-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          ← กลับไปหน้า Plugins
        </Link>
      </div>

      {/* Header Card */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm bg-white dark:bg-neutral-900 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Icon */}
          <div className="h-16 w-16 rounded-xl overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-700 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl">🧩</span>
            )}
          </div>

          {/* Title & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl font-semibold truncate">
                {name}
              </h1>
              {version && (
                <span className="px-2 py-0.5 rounded-md text-xs ring-1 ring-neutral-200 dark:ring-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
                  v{version}
                </span>
              )}
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusClass}`}
              >
                {humanEnum(status)}
              </span>
              {recommended && (
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200">
                  Recommended
                </span>
              )}
              {featured && (
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-fuchsia-100 text-fuchsia-800 ring-1 ring-fuchsia-200">
                  Featured
                </span>
              )}
            </div>

            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 flex flex-wrap items-center gap-x-4 gap-y-1">
              {vendor && (
                <span>
                  Vendor: <b>{vendor}</b>
                </span>
              )}
              {pluginType && (
                <span>
                  Type: <b>{pluginType}</b>
                </span>
              )}
              {category && (
                <span>
                  Category: <b>{category}</b>
                </span>
              )}
              {slug && (
                <span className="inline-flex items-center gap-1">
                  Slug:{" "}
                  <code className="px-1.5 py-0.5 text-xs bg-neutral-50 dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700 rounded">
                    {slug}
                  </code>
                  <CopyButton value={slug} label="คัดลอก" />
                </span>
              )}
            </div>
          </div>

          {/* ACTION: Big Download Button */}
          <div className="mt-2 md:mt-0">
            {downloadUrl ? (
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg hover:scale-105 transform transition"
              >
                ⬇️ ดาวน์โหลดปลั๊กอิน
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 cursor-not-allowed"
              >
                ไม่มีไฟล์สำหรับดาวน์โหลด
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick info grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-xs uppercase font-medium text-neutral-500 dark:text-neutral-400">
            สร้างเมื่อ
          </div>
          <div className="mt-1 text-sm">
            {formatDateTime(createdAt)}{" "}
            <span className="text-neutral-500 dark:text-neutral-400">
              ({timeAgo(createdAt)})
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-xs uppercase font-medium text-neutral-500 dark:text-neutral-400">
            อัปเดตล่าสุด
          </div>
          <div className="mt-1 text-sm">
            {formatDateTime(updatedAt)}{" "}
            <span className="text-neutral-500 dark:text-neutral-400">
              ({timeAgo(updatedAt)})
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="text-xs uppercase font-medium text-neutral-500 dark:text-neutral-400">
            เวลาประมวลผล
          </div>
          <div className="mt-1 text-sm">
            {processedAt ? (
              <>
                {formatDateTime(processedAt)}{" "}
                <span className="text-neutral-500 dark:text-neutral-400">
                  ({timeAgo(processedAt)})
                </span>
              </>
            ) : (
              <span className="text-neutral-500 dark:text-neutral-400">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Content & Status */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <h2 className="text-base font-semibold">รายละเอียด</h2>
          {content ? (
            <div className="mt-2 prose max-w-none prose-p:leading-relaxed">
              <p className="whitespace-pre-wrap">{content}</p>
            </div>
          ) : (
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">
              ยังไม่มีรายละเอียด
            </p>
          )}
          {downloadUrl && (
            <div className="mt-5">
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow hover:opacity-95"
              >
                ⬇️ ดาวน์โหลดปลั๊กอิน
              </a>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                สำหรับผู้เริ่มต้น: คลิกปุ่มเพื่อดาวน์โหลดไฟล์
                แล้วติดตั้งปลั๊กอินในระบบของคุณ
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <h2 className="text-base font-semibold">สถานะ</h2>
          <ul className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 space-y-2">
            <li className="flex items-center justify-between">
              <span>สถานะปัจจุบัน</span>
              <span className={`px-2 py-0.5 rounded text-xs ${statusClass}`}>
                {humanEnum(status)}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Recommended</span>
              <span className="font-medium">{recommended ? "Yes" : "No"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Featured</span>
              <span className="font-medium">{featured ? "Yes" : "No"}</span>
            </li>
          </ul>

          {error && (
            <details className="mt-3 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200 open:ring-1 open:ring-rose-200 dark:open:ring-rose-800/60">
              <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">
                รายละเอียดข้อผิดพลาด
              </summary>
              <pre className="px-3 py-3 text-xs overflow-x-auto">{error}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

async function getPlugin(id: string) {
  // รองรับทั้ง id (cuid) หรือ slug
  const byId = await prisma.plugin.findUnique({
    where: { id },
    select: baseSelect,
  });
  if (byId) return byId;

  return prisma.plugin.findUnique({
    where: { slug: id },
    select: baseSelect,
  });
}
