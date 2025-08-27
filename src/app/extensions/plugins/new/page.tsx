// src/app/extensions/plugins/new/page.tsx
import PluginForm from "../_components/PluginForm";

export default function NewPluginPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">เพิ่ม Plugin ใหม่</h1>
      <PluginForm actionUrl="/extensions/plugins/api/create" />
    </div>
  );
}