// src/app/extensions/programs/new/page.tsx
// Server Component: เรียกใช้ฟอร์มจาก _components ให้โค้ดเบาและดูแลจุดเดียว

import ProgramForm from "@/app/extensions/programs/_components/ProgramForm";

export const dynamic = "force-dynamic"; // ให้หน้าใหม่ไม่ cache เวลา dev

export default function NewProgramPage() {
  return (
    <div className="grid gap-4 max-w-4xl">
      <h1 className="text-xl font-bold">เพิ่ม Program ใหม่</h1>
      <ProgramForm
        actionUrl="/extensions/programs/api/create"
        redirectTo="/extensions/programs"
      />
    </div>
  );
}
