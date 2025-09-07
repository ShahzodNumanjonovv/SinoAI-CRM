// app/(dashboard)/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1">
        <Topbar />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}