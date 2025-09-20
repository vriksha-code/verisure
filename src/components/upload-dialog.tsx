'use client';

import { useState, useRef } from 'react';
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
import { Upload } from 'lucide-react';

interface UploadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (file: File, verificationTask: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  verificationTask: z.string().min(10, 'Verification task must be at least 10 characters long.'),
  document: z
    .any()
    .refine((files) => files?.length == 1, 'An image is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

export function UploadDialog({ isOpen, onOpenChange, onSubmit }: UploadDialogProps) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationTask: 'Check if the document contains a valid signature.',
    }
  });

  const documentFile = watch('document');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('document', event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const processSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit(data.document[0], data.verificationTask);
    reset();
    setFilePreview(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setFilePreview(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(processSubmit)}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Select a document to analyze and provide the verification instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="document">Document</Label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <p className="pl-1">Click to upload a file</p>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
              </div>
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
                <p className="text-sm font-medium text-destructive">
                  {errors.document.message as string}
                </p>
              )}
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="verificationTask">Verification Task</Label>
              <Textarea
                id="verificationTask"
                placeholder="e.g., Check for a signature on the bottom right."
                {...register('verificationTask')}
              />
              {errors.verificationTask && (
                <p className="text-sm font-medium text-destructive">
                  {errors.verificationTask.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Analyzing...' : 'Submit for Analysis'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
