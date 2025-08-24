"use client";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-3 lg:p-6">{children}</main>
      </div>
    </div>
  );
}