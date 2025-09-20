import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Clock,
  FileText,
} from 'lucide-react';
import type { Application, ApplicationStatus } from './certiscan-dashboard';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationCardProps {
  application: Application;
}

const statusConfig: Record<
  ApplicationStatus,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    color: 'text-green-600',
    badgeVariant: 'secondary',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-destructive',
    badgeVariant: 'destructive',
  },
  requires_manual_review: {
    label: 'Manual Review',
    icon: AlertTriangle,
    color: 'text-amber-600',
    badgeVariant: 'outline',
  },
  analyzing: {
    label: 'Analyzing...',
    icon: Loader2,
    color: 'text-primary',
    badgeVariant: 'secondary',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-muted-foreground',
    badgeVariant: 'secondary',
  },
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { status, fileName, fileSize, documentUrl, verificationTask, reason, submittedAt } = application;
  const config = statusConfig[status];
  const Icon = config.icon;
  const isProcessing = status === 'analyzing' || status === 'pending';
  
  const timeAgo = formatDistanceToNow(submittedAt, { addSuffix: true });

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
            <CardTitle className="text-lg leading-tight break-all">{fileName}</CardTitle>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant={config.badgeVariant} className="flex-shrink-0 ml-2">
                            <Icon className={`mr-1 h-3 w-3 ${config.color} ${isProcessing ? 'animate-spin' : ''}`} />
                            {config.label}
                        </Badge>
                    </TooltipTrigger>
                    {reason && (
                        <TooltipContent>
                            <p>{reason}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </div>
        <CardDescription className="flex items-center text-xs">
            <FileText className="mr-1.5 h-3 w-3" />
            <span>{formatBytes(fileSize)}</span>
            <span className="mx-1.5">·</span>
            <time dateTime={submittedAt.toISOString()}>{timeAgo}</time>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center items-center py-4">
        {documentUrl ? (
          <Image
            src={documentUrl}
            alt={`Preview of ${fileName}`}
            width={300}
            height={200}
            className="rounded-md object-contain max-h-48 w-full"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-muted rounded-md">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="text-sm text-muted-foreground w-full">
            <p className="font-medium text-foreground mb-1">Verification Task:</p>
            <p className="italic line-clamp-2">"{verificationTask}"</p>
        </div>
      </CardFooter>
    </Card>
  );
}
