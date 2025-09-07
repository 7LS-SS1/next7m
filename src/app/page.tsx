import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// src/app/page.tsx
import DashboardPage from "./dashboard/page";

export default async function Page() {
  const cookieStore = await cookies();
  const uid = cookieStore.get('uid')?.value;
  if (!uid) {
    redirect('/login');
  }
  return (
    <DashboardPage />
  );
}