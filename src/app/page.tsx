import { Sidebar, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import CertiScanDashboard from '@/components/certiscan-dashboard';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1">
          <CertiScanDashboard />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}