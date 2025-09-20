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
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


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
        console.error("Failed to read from localStorage", error);
    }

    const unsubscribe = onSnapshot(collection(db, 'documents'), (snapshot) => {
        const apps = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            submittedAt: doc.data().submittedAt?.toDate() ?? new Date(),
        })) as Application[];
        setApplications(apps.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()));
    });

    return () => unsubscribe();
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

    const newApplicationStub: Omit<Application, 'id' | 'documentUrl'> = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      verificationTask: documentType === 'Other' && userQuery ? userQuery : `Verify as ${documentType}`,
      status: 'pending',
      submittedAt: new Date(),
      userName: userName,
    };

    // Show a pending card immediately
    const pendingAppId = `pending-${crypto.randomUUID()}`;
    setApplications((prev) => [{...newApplicationStub, id: pendingAppId, documentUrl: ''}, ...prev]);


    try {
        const storageRef = ref(storage, `documents/${userName}/${Date.now()}-${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const documentUrl = await getDownloadURL(uploadResult.ref);
        const docRef = await addDoc(collection(db, 'documents'), {
            ...newApplicationStub,
            documentUrl: documentUrl,
            status: 'analyzing',
            submittedAt: serverTimestamp(),
        });
        
        // At this point, onSnapshot will pick up the new 'analyzing' document.
        // We can remove the pending stub.
        setApplications(prev => prev.filter(app => app.id !== pendingAppId));

        // For image files, perform AI analysis
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const dataUri = reader.result as string;
                try {
                    const result: AnalyzeDocumentAndVerifyOutput = await analyzeDocumentAndVerify({
                        documentDataUri: dataUri,
                        documentType: documentType,
                        userQuery,
                    });

                    await updateDoc(doc(db, 'documents', docRef.id), {
                        status: result.verificationStatus,
                        reason: result.reason,
                        confidenceScore: result.confidenceScore,
                    });
                } catch (analysisError) {
                    console.error('Verification failed:', analysisError);
                     await updateDoc(doc(db, 'documents', docRef.id), {
                        status: 'rejected',
                        reason: 'An error occurred during AI analysis.',
                    });
                }
            };
            reader.onerror = async (error) => {
                console.error('File reading for analysis error:', error);
                await updateDoc(doc(db, 'documents', docRef.id), {
                    status: 'rejected',
                    reason: 'Could not read file for analysis.',
                });
            }
        } else {
            // For non-image files like PDFs, mark for manual review
             await updateDoc(doc(db, 'documents', docRef.id), {
                status: 'requires_manual_review',
                reason: 'File type requires manual verification.',
            });
        }
    } catch (error) {
        console.error('Upload failed:', error);
        setApplications(prev => prev.filter(app => app.id !== pendingAppId));
        toast({
          title: 'Upload Error',
          description: 'Could not upload the document. Please try again.',
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
