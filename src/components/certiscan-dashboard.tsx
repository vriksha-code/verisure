'use client';

import { useState } from 'react';
import { analyzeDocumentAndVerify } from '@/ai/flows/analyze-document-and-verify';
import type { AnalyzeDocumentAndVerifyOutput } from '@/ai/flows/analyze-document-and-verify';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';
import { UploadDialog } from '@/components/upload-dialog';
import { ApplicationCard } from '@/components/application-card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export type ApplicationStatus =
  | 'pending'
  | 'analyzing'
  | 'verified'
  | 'rejected'
  | 'requires_manual_review';

export interface Application {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentUrl: string; // data URI
  verificationTask: string;
  status: ApplicationStatus;
  reason?: string;
  submittedAt: Date;
}

export default function CertiScanDashboard() {
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
    <div className="w-full">
      <PageHeader onUploadClick={() => setIsUploadDialogOpen(true)} />
      <main className="container mx-auto px-4 py-8">
        {applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-card border border-dashed rounded-lg">
            <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 14-2 2 2 2"/><path d="m14 18 2-2-2-2"/></svg>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">No applications yet</h2>
            <p className="text-muted-foreground mb-6">
              Get started by uploading your first document for verification.
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        )}
      </main>
      <UploadDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSubmit={handleFileSubmit}
      />
    </div>
  );
}
