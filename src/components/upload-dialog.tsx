'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Camera, ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DocumentType } from '@/ai/flows/analyze-document-and-verify';

interface UploadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (file: File, documentType: DocumentType, userQuery?: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  documentType: z.enum([
    "Aadhaar Card",
    "10th Marksheet",
    "12th Marksheet",
    "Compliance Certificate",
    "Floor Plan",
    "Other"
  ]),
  userQuery: z.string().optional(),
  document: z
    .any()
    .refine((files) => files?.[0], 'An image is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
}).refine(data => {
    if (data.documentType === 'Other') {
        return !!data.userQuery && data.userQuery.length >= 10;
    }
    return true;
}, {
    message: 'Verification task must be at least 10 characters long for "Other" document type.',
    path: ['userQuery'],
});

type FormValues = z.infer<typeof formSchema>;

type UploadStep = 'select' | 'camera' | 'preview';

export function UploadDialog({ isOpen, onOpenChange, onSubmit }: UploadDialogProps) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>('select');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    control,
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: 'Aadhaar Card',
    }
  });

  const documentType = watch('documentType');

  useEffect(() => {
    if (uploadStep === 'camera' && isOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [uploadStep, isOpen, toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('document', event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
        setUploadStep('preview');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            setValue('document', dataTransfer.files);
            setFilePreview(canvas.toDataURL('image/jpeg'));
            setUploadStep('preview');
          }
        }, 'image/jpeg');
      }
    }
  };

  const processSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit(data.document[0], data.documentType as DocumentType, data.userQuery);
    closeDialog();
  };
  
  const closeDialog = () => {
    reset();
    setFilePreview(null);
    setUploadStep('select');
    setHasCameraPermission(null);
    onOpenChange(false);
  }

  const renderContent = () => {
    switch (uploadStep) {
      case 'select':
        return (
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button variant="outline" type="button" className="h-24 flex-col" onClick={() => setUploadStep('camera')}>
              <Camera className="h-8 w-8 mb-2" />
              Take Photo
            </Button>
            <Button variant="outline" type="button" className="h-24 flex-col" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-8 w-8 mb-2" />
              Upload File
            </Button>
            <Input
              id="document"
              type="file"
              className="hidden"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              {...register('document')}
              onChange={handleFileChange}
              ref={fileInputRef}
            />
             {errors.document && (
                <p className="text-sm font-medium text-destructive col-span-2">
                  {errors.document.message as string}
                </p>
              )}
          </div>
        );
      case 'camera':
        return (
          <div className="pt-4">
            <div className="relative">
              <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
              {hasCameraPermission === false && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser to use this feature.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <Button type="button" size="lg" className="rounded-full w-16 h-16" onClick={handleCapture} disabled={!hasCameraPermission}>
                <Camera className="h-8 w-8" />
              </Button>
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="pt-4">
            {filePreview && (
              <img src={filePreview} alt="Preview" className="max-h-60 mx-auto rounded-lg object-contain" />
            )}
             {errors.document && (
                <p className="text-sm font-medium text-destructive mt-2 text-center">
                  {errors.document.message as string}
                </p>
              )}
            <div className="flex justify-center gap-4 mt-4">
              <Button type="button" variant="outline" onClick={() => { setFilePreview(null); setUploadStep('select'); setValue('document', null); }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button type="submit" >
                <Check className="mr-2 h-4 w-4" />
                Confirm
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(processSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {uploadStep !== 'select' && (
                 <Button type="button" variant="ghost" size="icon" className="mr-2 h-7 w-7" onClick={() => { setUploadStep('select'); setFilePreview(null); }}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              Upload Document
            </DialogTitle>
            {uploadStep === 'select' && 
              <DialogDescription>
                Capture a photo of your document or upload an existing file.
              </DialogDescription>
            }
          </DialogHeader>
          
          <div className="grid w-full gap-1.5 mt-4 pt-4 border-t">
            <Label htmlFor="documentType">Document Type</Label>
            <Controller
                control={control}
                name="documentType"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a document type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                            <SelectItem value="10th Marksheet">10th Marksheet</SelectItem>
                            <SelectItem value="12th Marksheet">12th Marksheet</SelectItem>
                            <SelectItem value="Compliance Certificate">Compliance Certificate</SelectItem>
                            <SelectItem value="Floor Plan">Floor Plan</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.documentType && (
              <p className="text-sm font-medium text-destructive">
                {errors.documentType.message}
              </p>
            )}
          </div>

          {documentType === 'Other' && (
            <div className="grid w-full gap-1.5 mt-4">
              <Label htmlFor="userQuery">Verification Task</Label>
              <Textarea
                id="userQuery"
                placeholder="e.g., Check for a signature on the bottom right."
                {...register('userQuery')}
              />
              {errors.userQuery && (
                <p className="text-sm font-medium text-destructive">
                  {errors.userQuery.message}
                </p>
              )}
            </div>
          )}
          
          {renderContent()}

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || uploadStep !== 'preview'}>
              {isSubmitting ? 'Analyzing...' : 'Submit for Analysis'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
