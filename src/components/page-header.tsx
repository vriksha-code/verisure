import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface PageHeaderProps {
  onUploadClick: () => void;
}

export function PageHeader({ onUploadClick }: PageHeaderProps) {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
          </div>
          <Button onClick={onUploadClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>
    </header>
  );
}