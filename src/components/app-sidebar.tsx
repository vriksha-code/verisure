'use client';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Home, FileText, Search, HardDrive, Settings, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

export default function AppSidebar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  const navigateToDashboard = () => {
    router.push('/dashboard');
  }

  return (
    <>
      <SidebarHeader className="h-16">
        <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">VeriSure</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Home" isActive onClick={navigateToDashboard}>
              <Home />
              Home
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Issued Documents" onClick={navigateToDashboard}>
              <FileText />
              Issued Documents
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton tooltip="Search Documents" onClick={navigateToDashboard}>
              <Search />
              Search Documents
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton tooltip="Drive" onClick={navigateToDashboard}>
              <HardDrive />
              Drive
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Separator className="my-2 bg-sidebar-border" />
         <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" onClick={navigateToDashboard}>
              <Settings />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Ankit">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  Ankit
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                 <DropdownMenuItem>Profile</DropdownMenuItem>
                 <DropdownMenuItem>Settings</DropdownMenuItem>
                 <DropdownMenuItem onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" />
                   Logout
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           </SidebarMenuItem>
           <SidebarMenuItem>
             <div className="flex justify-center group-data-[collapsible=icon]:justify-start">
                <ThemeToggle />
             </div>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
