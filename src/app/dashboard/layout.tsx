import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      <Sidebar />
      <DashboardShell>
        <Topbar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 min-w-0 w-full overflow-x-hidden">
          {children}
        </main>
      </DashboardShell>
      <MobileNav />
    </div>
  );
}
