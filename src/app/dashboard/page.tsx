
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
import { DashboardBackground } from '@/components/dashboard-background';


export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // On component mount, load data from localStorage.
    try {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
      }
      
      const storedApplications = localStorage.getItem('applications');
      if (storedApplications) {
        const parsedApplications = JSON.parse(storedApplications).map((app: any) => ({
            ...app,
            submittedAt: new Date(app.submittedAt), // Re-hydrate Date object
        }));
        setApplications(parsedApplications);
      }
    } catch (error) {
        console.error("Failed to read from localStorage", error);
        toast({
            title: "Error",
            description: "Could not load your saved data.",
            variant: "destructive",
        })
    }
  }, [toast]);

  // Persist applications to localStorage whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem('applications', JSON.stringify(applications));
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  }, [applications]);

  const handleFileSubmit = async (file: File, documentType: DocumentType, userQuery?: string) => {
    setIsUploadDialogOpen(false);

    const id = crypto.randomUUID();
    const newApplication: Application = {
      id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      documentUrl: '', // Will be filled after reading
      verificationTask: documentType === 'Other' && userQuery ? userQuery : `Verify as ${documentType}`,
      status: 'analyzing',
      submittedAt: new Date(),
    };

    setApplications((prev) => [newApplication, ...prev]);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const documentUrl = reader.result as string;
      
      // Update the specific application with the documentUrl
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, documentUrl } : app))
      );

      try {
        const result: AnalyzeDocumentAndVerifyOutput = await analyzeDocumentAndVerify({
          documentDataUri: documentUrl,
          documentType: documentType,
          userQuery,
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
       <DashboardBackground />
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
