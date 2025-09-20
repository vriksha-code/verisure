import { Sidebar, SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import VeriSureDashboard from '@/components/verisure-dashboard';

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1">
          <VeriSureDashboard />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
