import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg dark:bg-bg-dark">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title="لوحة التحكم" />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
