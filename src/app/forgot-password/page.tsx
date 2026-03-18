'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Loader2, Mail, Lock, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/components/auth/AuthLayout';
import api from '@/lib/axios';

const sendOtpSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
});

const resetPasswordSchema = z.object({
    email: z.string().email(),
    otp: z.string().min(4, { message: 'OTP must be at least 4 digits.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SendOtpFormValues = z.infer<typeof sendOtpSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'send-otp' | 'reset-password' | 'success'>('send-otp');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    const sendOtpForm = useForm<SendOtpFormValues>({
        resolver: zodResolver(sendOtpSchema),
        defaultValues: { email: '' },
    });

    const resetPasswordForm = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email: '', otp: '', password: '', confirmPassword: '' },
    });

    async function onSendOtp(values: SendOtpFormValues) {
        setIsLoading(true);
        try {
            await api.post('/password_reset/customers/send-otp', values);
            setEmail(values.email);
            resetPasswordForm.setValue('email', values.email);
            setStep('reset-password');
            toast.success('OTP sent to your email!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    }

    async function onResetPassword(values: ResetPasswordFormValues) {
        setIsLoading(true);
        try {
            await api.post('/password_reset/customers/reset-password', values);
            setStep('success');
            toast.success('Password reset successful!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    }

    if (step === 'success') {
        return (
            <AuthLayout title="Success!" description="Your password has been reset successfully.">
                <div className="flex flex-col items-center space-y-6 text-center">
                    <div className="rounded-full bg-green-100 p-3 text-green-600">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        You can now sign in with your new password.
                    </p>
                    <Button render={<Link href="/login" />} className="w-full">
                        Go to Login
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title={step === 'send-otp' ? 'Forgot Password?' : 'Reset Password'}
            description={step === 'send-otp'
                ? "No worries, we'll send you reset instructions."
                : `We've sent an OTP to ${email}`}
        >
            {step === 'send-otp' ? (
                <Form {...sendOtpForm}>
                    <form onSubmit={sendOtpForm.handleSubmit(onSendOtp)} className="space-y-4">
                        <FormField
                            control={sendOtpForm.control}
                            name="email"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="name@company.com" className="pl-10 h-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full h-10" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send OTP
                        </Button>
                        <Button variant="ghost" render={<Link href="/login" />} className="w-full h-10">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to login
                        </Button>
                    </form>
                </Form>
            ) : (
                <Form {...resetPasswordForm}>
                    <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                        <FormField
                            control={resetPasswordForm.control}
                            name="otp"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>OTP Code</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="123456" className="pl-10 h-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={resetPasswordForm.control}
                            name="password"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="password" placeholder="••••••••" className="pl-10 h-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={resetPasswordForm.control}
                            name="confirmPassword"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="password" placeholder="••••••••" className="pl-10 h-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full h-10" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reset Password
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full h-10"
                            onClick={() => setStep('send-otp')}
                        >
                            Change email
                        </Button>
                    </form>
                </Form>
            )}
        </AuthLayout>
    );
}
