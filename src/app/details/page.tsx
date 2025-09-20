'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  phone: z.string().regex(/^\d{10}$/, {
    message: 'Phone number must be 10 digits.',
  }),
  otp: z.string().optional(),
});

export default function DetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isOtpSent, setIsOtpSent] = React.useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = React.useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      otp: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isPhoneVerified) {
      toast({
        title: 'Verification Required',
        description: 'Please verify your phone number before continuing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      localStorage.setItem('userName', values.name);
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save your details. Please try again.",
        variant: "destructive",
      });
    }
  }

  function handleVerifyPhone() {
    const phone = form.getValues('phone');
    if (!/^\d{10}$/.test(phone)) {
       form.setError("phone", { type: "manual", message: "Please enter a valid 10-digit phone number to verify." });
       return;
    }

    setIsVerifying(true);
    toast({
      title: 'OTP Sent',
      description: `An OTP has been sent to ${phone}. (This is a demo, enter any 6 digits)`,
    });
    
    setTimeout(() => {
      setIsVerifying(false);
      setIsOtpSent(true);
    }, 1500);
  }

  function handleConfirmOtp() {
    const otp = form.getValues('otp');
    if (!otp || otp.length !== 6) {
      form.setError("otp", { type: "manual", message: "Please enter a valid 6-digit OTP." });
      return;
    }

    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      setIsPhoneVerified(true);
      setIsOtpSent(false); // Hide OTP field
       toast({
        title: 'Phone Verified',
        description: 'Your phone number has been successfully verified.',
        variant: 'default',
        className: 'bg-green-500 text-white',
      });
    }, 1500);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide your details to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ankit Kumar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="e.g., 9876543210"
                          {...field}
                           disabled={isPhoneVerified}
                        />
                      </FormControl>
                      {!isPhoneVerified && !isOtpSent && (
                        <Button type="button" variant="outline" onClick={handleVerifyPhone} disabled={isVerifying}>
                          {isVerifying ? 'Sending...' : 'Verify'}
                        </Button>
                      )}
                      {isPhoneVerified && (
                         <Button type="button" variant="outline" disabled className="bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300">
                          Verified
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {isOtpSent && (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter OTP</FormLabel>
                       <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="6-digit OTP"
                              maxLength={6}
                              {...field}
                            />
                          </FormControl>
                           <Button type="button" variant="outline" onClick={handleConfirmOtp} disabled={isVerifying}>
                              {isVerifying ? 'Confirming...' : 'Confirm OTP'}
                            </Button>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={!isPhoneVerified}>
                Continue to Dashboard
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
