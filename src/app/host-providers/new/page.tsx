import ProviderForm from "../ProviderForm";
import { createProvider } from "@/app/host-providers/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ProviderNewPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">เพิ่ม Provider</h1>
      <ProviderForm action={createProvider} submitText="บันทึก" />
    </div>
  );
}