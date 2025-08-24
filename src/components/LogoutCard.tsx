"use client";

type LogoutCardProps = {
  expanded?: boolean;        // true = แสดงการ์ดเต็ม | false = ไอคอนอย่างเดียว
  balance?: string;          // แสดงยอดคงเหลือ (optional)
  onDeposit?: () => void;    // กดปุ่มฝาก (optional)
  onLogout?: () => void;     // override action logout (optional)
};

export default function LogoutCard({
  expanded = true,
  balance = "$0.00",
  onDeposit,
  onLogout,
}: LogoutCardProps) {
  const handleLogout = () => {
    if (onLogout) return onLogout();
    // TODO: แทนที่ด้วย action จริง เช่น POST /api/logout
    window.location.href = "/login";
  };

  if (!expanded) {
    // โหมด "ย่อ" → ไอคอนอย่างเดียว (เต็มความกว้าง ปุ่มใหญ่ กดง่าย)
    return (
      <button
        onClick={handleLogout}
        className="grid h-12 w-full place-items-center rounded-xl hover:bg-white/5"
        title="Logout"
        aria-label="Logout"
      >
        <svg className="h-6 w-6" viewBox="0 0 18 16" fill="none" aria-hidden>
          <path
            d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  // โหมด "ขยาย" → การ์ดเต็ม (ดำ-ทอง)
  return (
    <div className="rounded-xl bg-white/[0.06] p-3">
      {/* <div className="text-sm text-white/70">ยอดคงเหลือ</div>
      <div className="mt-1 text-2xl font-bold">{balance}</div>
      <button
        className="w-full mt-3 rounded-xl px-3 py-2 text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-95"
        onClick={onDeposit}
      >
        ฝากเงิน
      </button> */}

      <button
        onClick={handleLogout}
        className="mt-2 w-full rounded-xl px-3 py-2 text-sm border border-white/10 hover:bg-white/10"
        aria-label="Logout"
        title="Logout"
      >
        ออกจากระบบ
      </button>
    </div>
  );
}