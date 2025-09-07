// src/app/domains/[id]/view/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@lib/db";
import StatusProbe from "../../_components/StatusProbe";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import StatusHistory from "../../_components/StatusHistory";
import LivePreview from "../../_components/LivePreview";
import WordpressQuickAdd from "../../_components/WordpressQuickAdd";
import CodeSnippet from "../../_components/CodeSnippet";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function Chip({
  text,
  tone = "gray",
}: {
  text: string;
  tone?: "green" | "cyan" | "gray" | "rose" | "yellow";
}) {
  const map: Record<string, string> = {
    green: "bg-green-600/20 text-green-400",
    cyan: "bg-cyan-600/20 text-cyan-400",
    gray: "bg-gray-600/20 text-gray-200",
    rose: "bg-rose-600/20 text-rose-300",
    yellow: "bg-yellow-600/20 text-yellow-300",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${map[tone]}`}
    >
      {text}
    </span>
  );
}

export default async function DomainViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // โปรเจคนี้ใช้ Dynamic APIs → ต้อง await params
  const { id } = await params;

  const domain = await prisma.domain.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      ip: true,
      note: true,
      status: true,
      activeStatus: true,
      price: true,
      redirect: true,
      wordpressInstall: true,
      registeredAt: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      team: { select: { id: true, name: true } },
      host: { select: { id: true, name: true } },
      hostType: { select: { id: true, name: true } },
      domainMail: { select: { id: true, address: true } },
      hostMail: { select: { id: true, address: true } },
      cloudflareMail: { select: { id: true, address: true } },
    },
  });

  if (!domain) return notFound();

  let wordpress: {
    id: string;
    user: string | null;
    url: string | null;
    passwordHash: string | null;
  } | null = null;
  try {
    const anyPrisma = prisma as any;
    const WP = anyPrisma.wordpress;
    if (WP?.findFirst) {
      wordpress = await WP.findFirst({
        where: { domainId: domain.id },
        select: { id: true, user: true, url: true, passwordHash: true },
      });
    }
  } catch {}

  const fmt = (d?: Date | null) =>
    d ? new Date(d).toISOString().slice(0, 10) : "-";

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/domains"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
          >
            ย้อนกลับ
          </Link>
          <h1 className="text-xl font-bold">{domain.name}</h1>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Link
            href={`https://${domain.name}`}
            className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
            target="_blank"
          >
            เปิด HTTPS
          </Link>
          <Link
            href={`http://${domain.name}`}
            className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
            target="_blank"
          >
            เปิด HTTP
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/domains/${domain.id}/edit`}
            className="flex items-center justify-center rounded-lg border border-white/10 w-24 h-9 hover:bg-white/10"
          >
            แก้ไข
          </Link>
          <form method="post" action="/domains/api/delete">
            <input type="hidden" name="id" value={domain.id} />
            <ConfirmSubmit
              confirmText={`ลบโดเมน \"${domain.name}\" ?`}
              className="flex items-center justify-center rounded-lg border border-white/10 w-24 h-9 hover:bg-white/10 text-rose-300"
            >
              ลบ
            </ConfirmSubmit>
          </form>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card p-4 flex flex-col gap-2">
          <label className="text-sm opacity-70">ชื่อโดเมน</label>
          <div className="text-lg font-medium">{domain.name}</div>
          {/* Live Preview */}
          {/* <LivePreview initialUrl={`https://${domain.name}`} /> */}
          {/* <LivePreview initialUrl={domain.name} viewportWidth={1280} aspect={16/4.5} /> */}
          <LivePreview
            initialUrl={`https://${domain.name}`}
            viewportWidth={1920}
            viewportHeight={1080}
          />
        </div>
        <div className="card p-4 flex flex-col gap-2">
          <label className="text-sm opacity-70">สถานะ</label>
          <div className="flex items-center gap-2">
            <Chip text={String(domain.status)} tone="green" />
            <div className="flex items-center gap-2">
              <span className="opacity-70 text-xs">Status :</span>
              <StatusProbe url={`https://${domain.name}`} />
            </div>
          </div>
          <hr className="border-t border-white/10 my-2" />
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-70">ทีมรับผิดชอบ</label>
            <div>
              <Chip text={domain.team?.name ?? "-"} tone="cyan" />
            </div>
          </div>
          <hr className="border-t border-white/10 my-2" />
          <label className="text-sm opacity-70">Host / Type</label>
          <div className="flex flex-wrap gap-2">
            <Chip text={domain.host?.name ?? "-"} tone="gray" />
            <Chip text={domain.hostType?.name ?? "-"} tone="gray" />
          </div>
          <hr className="border-t border-white/10 my-2" />
          <div className="w-full">
            {/* Latency & History */}
            <StatusHistory url={`https://${domain.name}`} />
          </div>
        </div>

        <div className="card p-4 flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="grid gap-3">
              <Item
                label="Cloudflare Mail"
                value={domain.cloudflareMail?.address ?? "-"}
              />
              <Item
                label="Domain Mail"
                value={domain.domainMail?.address ?? "-"}
              />
              <Item label="Host Mail" value={domain.hostMail?.address ?? "-"} />
              <Item label="IP" value={domain.ip ?? "-"} />
              <Item
                label="ลง WordPress"
                value={domain.wordpressInstall ? "Yes" : "No"}
              />
              <Item label="Redirect" value={domain.redirect ? "On" : "Off"} />
              <Item
                label="Active"
                value={domain.activeStatus ? "Active" : "Inactive"}
              />
            </div>
            <hr className="border-t border-white/10 my-2" />
            <div className="grid gap-3">
              <Item label="ลงทะเบียน" value={fmt(domain.registeredAt)} />
              <Item label="หมดอายุ" value={fmt(domain.expiresAt)} />
            </div>
            <hr className="border-t border-white/10 my-2" />
            <div>
              <div>
                <div className="text-sm font-medium mb-1">หมายเหตุ</div>
                <div className="rounded-xl border border-white/10 p-3 min-h-[64px]">
                  {domain.note || <span className="opacity-60">-</span>}
                </div>
              </div>
            </div>
            <div>
              <Item
                label="ราคาที่จด"
                value={
                  typeof domain.price === "number"
                    ? new Intl.NumberFormat("th-TH", {
                        maximumFractionDigits: 2,
                      }).format(domain.price) + " บาท"
                    : "-"
                }
              />
            </div>
            <hr className="border-t border-white/10 my-2" />
            <div className="grid gap-3">
              <Item label="สร้างเมื่อ" value={fmt(domain.createdAt)} />
              <Item label="อัปเดตล่าสุด" value={fmt(domain.updatedAt)} />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 min-h-[64px]">
        {!domain.wordpressInstall ? (
          <div className="grid gap-3">
            <div className="text-sm opacity-80">
              เพิ่ม WordPress ใหม่ให้โดเมนนี้
            </div>
            <WordpressQuickAdd domainId={domain.id} />
          </div>
        ) : wordpress ? (
          <div className="grid gap-3 max-w-xl">
            <div className="text-sm font-medium">ข้อมูล WordPress</div>
            <div className="grid gap-2">
              <CodeSnippet
                title="User"
                code={wordpress?.user ?? "-"}
              />
              <CodeSnippet
                title="Pass"
                code={wordpress?.passwordHash ?? "-"}
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="text-sm opacity-80">
              เปิดใช้ WordPress แล้ว แต่ยังไม่มีรายละเอียดในระบบ
            </div>
            <WordpressQuickAdd domainId={domain.id} />
          </div>
        )}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 shrink-0 text-sm opacity-70">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
