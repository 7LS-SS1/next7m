import ProgramForm from "@/app/extensions/programs/_components/ProgramForm";

export const dynamic = "force-dynamic";

export default function NewProgramPage() {
  return (
    <div className="grid gap-4 max-w-2xl">
      <h1 className="text-xl font-bold">เพิ่ม Program ใหม่</h1>
      <ProgramForm mode="new" actionHref="/extensions/programs/api/create" />
    </div>
  );
}
