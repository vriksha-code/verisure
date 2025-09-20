
'use client';

import { useState } from 'react';
import { Sidebar, SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import VeriSureDashboard from '@/components/verisure-dashboard';
import { PageHeader } from '@/components/page-header';
import { UploadDialog } from '@/components/upload-dialog';
import type { Application } from '@/components/verisure-dashboard';
import { analyzeDocumentAndVerify } from '@/ai/flows/analyze-document-and-verify';
import type { AnalyzeDocumentAndVerifyOutput } from '@/ai/flows/analyze-document-and-verify';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFileSubmit = async (file: File, verificationTask: string) => {
    setIsUploadDialogOpen(false);

    const id = crypto.randomUUID();
    const newApplication: Application = {
      id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      documentUrl: '', // Will be filled after reading
      verificationTask,
      status: 'analyzing',
      submittedAt: new Date(),
    };

    setApplications((prev) => [newApplication, ...prev]);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const documentUrl = reader.result as string;
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, documentUrl } : app))
      );

      try {
        const result: AnalyzeDocumentAndVerifyOutput = await analyzeDocumentAndVerify({
          documentDataUri: documentUrl,
          verificationTask: verificationTask,
        });

        setApplications((prev) =>
          prev.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status: result.verificationStatus,
                  reason: result.reason,
                  confidenceScore: result.confidenceScore,
                }
              : app
          )
        );
      } catch (error) {
        console.error('Verification failed:', error);
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status: 'rejected',
                  reason: 'An error occurred during analysis.',
                }
              : app
          )
        );
        toast({
          title: 'Analysis Error',
          description: 'Could not analyze the document. Please try again.',
          variant: 'destructive',
        });
      }
    };
    reader.onerror = (error) => {
      console.error('File reading error:', error);
      setApplications(prev => prev.filter(app => app.id !== id));
      toast({
          title: 'File Error',
          description: 'Could not read the uploaded file.',
          variant: 'destructive',
        });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full bg-background">
          <PageHeader onUploadClick={() => setIsUploadDialogOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className='mb-8'>
              <h1 className="text-2xl font-semibold">Welcome, Ankit!</h1>
              <p className="text-muted-foreground">VeriSure 'Issued Documents' are at par with original documents as per IT ACT, 2000</p>
            </div>
            <VeriSureDashboard 
              applications={applications} 
              onUploadClick={() => setIsUploadDialogOpen(true)}
            />
          </main>
          <UploadDialog
            isOpen={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
            onSubmit={handleFileSubmit}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
