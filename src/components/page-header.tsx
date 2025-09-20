import { Button } from '@/components/ui/button';
import { ShieldCheck, PlusCircle } from 'lucide-react';

interface PageHeaderProps {
  onUploadClick: () => void;
}

export function PageHeader({ onUploadClick }: PageHeaderProps) {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              CertiScan
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
