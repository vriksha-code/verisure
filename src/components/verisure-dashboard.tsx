
'use client';

import { ApplicationCard } from '@/components/application-card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

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
  confidenceScore?: number;
}

interface VeriSureDashboardProps {
  applications: Application[];
  onUploadClick: () => void;
}

export default function VeriSureDashboard({ applications, onUploadClick }: VeriSureDashboardProps) {
  const { isMobile } = useSidebar();
  
  const responsiveGridClasses = isMobile 
    ? "grid-cols-1"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

  return (
    <>
      {applications.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Issued Documents</h2>
            <Button variant="link">View All ({applications.length})</Button>
          </div>
          <div className={`grid ${responsiveGridClasses} gap-6`}>
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center py-20 px-6 bg-card border border-dashed rounded-lg max-w-lg mx-auto">
            <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 14-2 2 2 2"/><path d="m14 18 2-2-2-2"/></svg>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Applications to Show</h2>
            <p className="text-muted-foreground mb-6">
              Get started by uploading your first document for verification.
            </p>
            <Button onClick={onUploadClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
