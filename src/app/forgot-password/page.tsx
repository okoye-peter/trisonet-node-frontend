'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Loader2, User, Lock, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
    username: z.string().min(1, { message: 'Please enter a valid username.' }),
});

const resetPasswordSchema = z.object({
    username: z.string().min(1, { message: 'Please enter a valid username.' }),
    otp: z.string().length(6, { message: 'OTP must be exactly 6 digits.' }),
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
    const [username, setUsername] = useState('');
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const sendOtpForm = useForm<SendOtpFormValues>({
        resolver: zodResolver(sendOtpSchema),
        defaultValues: { username: '' },
    });

    const resetPasswordForm = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { username: '', otp: '', password: '', confirmPassword: '' },
    });

    async function onSendOtp(values: SendOtpFormValues) {
        setIsLoading(true);
        try {
            await api.post('/password_reset/customers/send-otp', values);
            setUsername(values.username);
            resetPasswordForm.setValue('username', values.username);
            setStep('reset-password');
            toast.success('OTP sent to your username!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to send OTP.');
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
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    }

    if (!mounted) return null;

    if (step === 'success') {
        return (
            <AuthLayout title="Success!" description="Your password has been reset successfully.">
                <div className="flex flex-col items-center space-y-6 text-center py-4">
                    <div className="rounded-full bg-green-50 p-4 text-green-600 shadow-sm border border-green-100">
                        <CheckCircle2 className="h-16 w-16" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[#040021]">Ready to Sign In</h3>
                        <p className="text-sm text-[#8f98a8]">
                            Your security is our priority. You can now access your account with your new password.
                        </p>
                    </div>
                    <Button 
                        render={<Link href="/login" />}
                        className="w-full h-12 bg-[#6639ff] hover:bg-[#5229db] text-white font-bold uppercase tracking-wider rounded-md transition-all shadow-lg shadow-[#6639ff]/20"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Go to Login <i className="fas fa-arrow-right text-xs"></i>
                        </span>
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title={step === 'send-otp' ? 'Forgot Password?' : 'Reset Password'}
            description={step === 'send-otp'
                ? "No worries, we'll send you reset instructions to your email."
                : `We've sent a secure OTP code`}
        >
            {step === 'send-otp' ? (
                <Form {...sendOtpForm} key="send-otp-form">
                    <form onSubmit={sendOtpForm.handleSubmit(onSendOtp)} className="space-y-6">
                        <FormField
                            control={sendOtpForm.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#040021] font-semibold">Partnership Name</FormLabel>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter your partnership name" 
                                                className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all" 
                                                {...field} 
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-3">
                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-[#6639ff] hover:bg-[#5229db] text-white font-bold uppercase tracking-wider rounded-md transition-all shadow-lg shadow-[#6639ff]/20" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Send OTP <i className="fas fa-paper-plane text-xs"></i>
                                    </span>
                                )}
                            </Button>
                            <Button 
                                variant="ghost" 
                                render={<Link href="/login" />}
                                className="w-full h-11 text-[#8f98a8] hover:text-[#040021] font-semibold transition-colors"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to login
                                </span>
                            </Button>
                        </div>
                    </form>
                </Form>
            ) : (
                <Form {...resetPasswordForm} key="reset-password-form">
                    <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-6">
                        <FormField
                            control={resetPasswordForm.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#040021] font-semibold">OTP Code</FormLabel>
                                    <div className="relative group">
                                        <Key className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <FormControl>
                                            <Input 
                                                placeholder="123456" 
                                                maxLength={6}
                                                className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all" 
                                                {...field}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    field.onChange(val);
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={resetPasswordForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#040021] font-semibold">New Password</FormLabel>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all" 
                                                {...field} 
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={resetPasswordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#040021] font-semibold">Confirm New Password</FormLabel>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all" 
                                                {...field} 
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-3">
                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-[#6639ff] hover:bg-[#5229db] text-white font-bold uppercase tracking-wider rounded-md transition-all shadow-lg shadow-[#6639ff]/20" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Reset Password <i className="fas fa-check text-xs"></i>
                                    </span>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full h-11 text-[#8f98a8] hover:text-[#040021] font-semibold transition-colors"
                                onClick={() => setStep('send-otp')}
                            >
                                Change Username
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </AuthLayout>
    );
}
