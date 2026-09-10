'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/features/authSlice';

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

const registerStoreGuestSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type RegisterStoreGuestFormValues = z.infer<typeof registerStoreGuestSchema>;

export default function RegisterStoreGuestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const inviteCode = searchParams.get('code') ?? '';

    const form = useForm<RegisterStoreGuestFormValues>({
        resolver: zodResolver(registerStoreGuestSchema),
        defaultValues: { name: '', email: '', phone: '', password: '' },
    });

    async function onSubmit(values: RegisterStoreGuestFormValues) {
        if (!inviteCode) {
            toast.error('This invite link is missing its code. Please use the link you were sent.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/store-guest/register', { ...values, inviteCode });
            const { user, accessToken, refreshToken } = res.data.data;
            dispatch(loginSuccess({ user, accessToken, refreshToken }));
            toast.success('Account created!');
            router.push('/shop');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to register. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Create your store account"
            description="You've been invited to shop on Trisonet. Create an account to browse and buy."
        >
            {!inviteCode && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    This link is missing an invite code — please use the link you were sent.
                </div>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#040021] font-semibold">Full Name</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <Input
                                            placeholder="John Doe"
                                            className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#040021] font-semibold">Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <Input
                                            placeholder="name@company.com"
                                            className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#040021] font-semibold">Phone Number</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <Input
                                            placeholder="+234..."
                                            className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#040021] font-semibold">Password</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-[#8f98a8] hover:text-[#040021] transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full h-12 bg-[#6639ff] hover:bg-[#5229db] text-white font-bold uppercase tracking-wider rounded-md transition-all shadow-lg shadow-[#6639ff]/20 mt-4"
                        disabled={isLoading || !inviteCode}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Create account <i className="text-xs fas fa-arrow-right"></i>
                            </span>
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center text-sm font-medium text-[#8f98a8] mt-8">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-[#6639ff] hover:underline underline-offset-4">
                    Sign In now
                </Link>
            </div>
        </AuthLayout>
    );
}
