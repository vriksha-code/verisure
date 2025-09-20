
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
import { PlaceHolderImages } from '@/lib/placeholder-images';

const initialApplications: Application[] = [
  {
    id: '1',
    fileName: 'ankit_aadhaar.jpg',
    fileType: 'image/jpeg',
    fileSize: 120384,
    documentUrl: PlaceHolderImages[0].imageUrl,
    verificationTask: 'Verify as Aadhaar Card',
    status: 'verified',
    reason: 'All criteria met successfully.',
    submittedAt: new Date(Date.now() - 1000 * 60 * 5),
    confidenceScore: 0.98,
  },
  {
    id: '2',
    fileName: '10th_marksheet.png',
    fileType: 'image/png',
    fileSize: 80192,
    documentUrl: PlaceHolderImages[1].imageUrl,
    verificationTask: 'Verify as 10th Marksheet',
    status: 'rejected',
    reason: 'School name is not clearly visible.',
    submittedAt: new Date(Date.now() - 1000 * 60 * 30),
    confidenceScore: 0.45,
  },
  {
    id: '3',
    fileName: 'floor_plan_office.jpg',
    fileType: 'image/jpeg',
    fileSize: 204800,
    documentUrl: PlaceHolderImages[2].imageUrl,
    verificationTask: 'Verify as Floor Plan',
    status: 'requires_manual_review',
    reason: 'Fire exit sign is ambiguous and needs human verification.',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    confidenceScore: 0.72,
  },
];


export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // On component mount, check if user's name is in localStorage.
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

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
      <Sidebar collapsible="icon">
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full bg-background/80 backdrop-blur-sm">
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
