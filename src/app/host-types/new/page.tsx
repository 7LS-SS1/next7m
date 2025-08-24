import TypeForm from "../TypeForm";
import { createType } from "@/app/host-types/actions";

export const runtime = "nodejs";

export default function TypeNewPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">เพิ่ม Host Type</h1>
      <TypeForm action={createType} submitText="บันทึก" />
    </div>
  );
}