import { redirect } from "next/navigation";
import DashboardPage from "./dashboard/page";
import { getSession } from "@lib/auth-server";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <DashboardPage />;
}