import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { StatCard } from "@/components/cards/StatCard";
import FeatureCard from "@/components/cards/FeatureCard";
import { GameTile } from "@/components/GameTile";

import AnnouncementsCard from "@/components/cards/AnnouncementsCard";
import CategoryGrid, { CategoryItem } from "@/components/CategoryGrid";

export const metadata = { title: "Dashboard | Next7M" };

const hotGames = [
  "Gator Hunters",
  "Starlight",
  "Duck Luck",
  "Tanked",
  "Sweet Bomb",
  "Bonanza",
];

// เพิ่มรายการหมวดหมู่
const categories: CategoryItem[] = [
  { title: "คาสิโน",   desc: "สล๊อต ไลฟ์ ดีลเลอร์",    emoji: "🎰", href: "#casino"  },
  { title: "กีฬา",     desc: "ฟุตบอล, NFL, eSports",    emoji: "🏆", href: "#sports"  },
  { title: "ล็อตเตอรี่", desc: "หวยไทย/ต่างประเทศ",     emoji: "🎟️", href: "#lottery" },
  { title: "โปรโมชั่น", desc: "โบนัส & กิจกรรม",        emoji: "🎁", href: "#promo"   },
];

const announceItems = [
  { text: "อัปเดตระบบความปลอดภัยบัญชี — เปิด 2FA แล้ววันนี้", time: "15:32" },
  { text: "ทัวร์นาเมนต์สล็อตแจก $50,000 เริ่มคืนวันศุกร์", time: "เมื่อวาน" },
  { text: "เพิ่มเกมใหม่ 20 รายการจากค่ายยอดนิยม", time: "2 วันก่อน" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-dvh">
      <div className="container-page flex gap-4 pt-4">

        {/* MAIN */}
        <main className="flex-1 pb-10">
          {/* ใช้คอมโพเนนต์แทนโค้ดเดิม */}
          <AnnouncementsCard items={announceItems} className="mt-6" />

          {/* แบนเนอร์ */}
          <section className="card p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="text-2xl md:text-3xl font-extrabold">
                  อยู่ อย่าง ไม่ เสี่ยง
                </div>
                <p className="mt-2 text-white/70">
                  ลงทะเบียนและรับโบนัสสูงสุด{" "}
                  <span className="text-green-400 font-semibold">
                    US$20,000.00
                  </span>{" "}
                  ในคาสิโนหรือกีฬา
                </p>
                <div className="mt-4 flex gap-2">
                  <a href="#" className="btn-primary">
                    เข้าร่วมตอนนี้
                  </a>
                  <a
                    href="#"
                    className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 transition"
                  >
                    โปรโมชั่น
                  </a>
                </div>
              </div>
              <div className="grid gap-3 min-w-[240px]">
                <div className="flex gap-3">
                  <div className="flex-1 card p-3 text-center">
                    <div className="text-xs text-white/60">ผู้เล่นออนไลน์</div>
                    <div className="text-xl font-bold">19,284</div>
                  </div>
                  <div className="flex-1 card p-3 text-center">
                    <div className="text-xs text-white/60">เกมทั้งหมด</div>
                    <div className="text-xl font-bold">3,420+</div>
                  </div>
                </div>
                <div className="card p-3 text-center">
                  <div className="text-xs text-white/60">Token</div>
                  <div className="text-xl font-bold">$BC 0.00866</div>
                </div>
              </div>
            </div>
          </section>

          {/* หมวดหมู่หลัก */}
          <CategoryGrid items={categories} />

          
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mt-4">
            <StatCard label="กำไรวันนี้" value="$4,920" sub="+12%" emoji="💹" />
            <StatCard
              label="เดิมพันรวม"
              value="$52,310"
              sub="+3.2%"
              emoji="🧮"
            />
            <StatCard label="ผู้ใช้ใหม่" value="1,028" sub="+8%" emoji="🧑‍🤝‍🧑" />
            <StatCard label="อัตราชนะ" value="47%" sub="+1.1%" emoji="🎯" />
          </section>
        </main>
      </div>
    </div>
  );
}
