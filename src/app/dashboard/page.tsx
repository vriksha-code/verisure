'use client';

import { useState, useEffect } from 'react';
import { Sidebar, SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import VeriSureDashboard from '@/components/verisure-dashboard';
import { PageHeader } from '@/components/page-header';
import { UploadDialog } from '@/components/upload-dialog';
import type { Application } from '@/components/verisure-dashboard';
import { analyzeDocumentAndVerify } from '@/ai/flows/analyze-document-and-verify';
import type { AnalyzeDocumentAndVerifyOutput, DocumentType } from '@/ai/flows/analyze-document-and-verify';
import { useToast } from '@/hooks/use-toast';


export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
      }
    } catch (error) {
    }
  }, []);

  const handleFileSubmit = async (file: File, documentType: DocumentType, userQuery?: string) => {
    setIsUploadDialogOpen(false);

    if (!userName) {
      toast({
        title: "User Name Missing",
        description: "Please set your name before uploading documents.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;

      const newApplication: Application = {
        id: crypto.randomUUID(),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentUrl: dataUri,
        verificationTask: documentType === 'Other' && userQuery ? userQuery : `Verify as ${documentType}`,
        status: 'analyzing',
        submittedAt: new Date(),
        userName: userName,
      };

      setApplications((prev) => [newApplication, ...prev]);

      try {
        const result: AnalyzeDocumentAndVerifyOutput = await analyzeDocumentAndVerify({
          documentDataUri: dataUri,
          documentType: documentType,
          userQuery,
        });

        setApplications((prev) =>
          prev.map((app) =>
            app.id === newApplication.id
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
        setApplications((prev) =>
          prev.map((app) =>
            app.id === newApplication.id
              ? {
                  ...app,
                  status: 'rejected',
                  reason: 'An error occurred during AI analysis.',
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
      toast({
        title: 'File Read Error',
        description: 'Could not read the selected file.',
        variant: 'destructive',
      });
    };
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full">
          <PageHeader onUploadClick={() => setIsUploadDialogOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className='mb-8'>
              {userName ? (
                <div>
                  <h1 className="text-2xl font-semibold">Welcome, {userName}!</h1>
                  <p className="text-muted-foreground">VeriSure 'Issued Documents' are at par with original documents as per IT ACT, 2000</p>
                </div>
              ) : (
                 <div>
                  <h1 className="text-2xl font-semibold">Welcome!</h1>
                  <p className="text-muted-foreground">VeriSure 'Issued Documents' are at par with original documents as per IT ACT, 2000</p>
                </div>
              )}
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
