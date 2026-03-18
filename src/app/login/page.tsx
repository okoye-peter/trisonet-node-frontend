'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
import { useAppDispatch } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/features/authSlice';

const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: LoginFormValues) {
        setIsLoading(true);
        dispatch(loginStart());
        try {
            const response = await api.post('/auth/login', values);
            
            const { user, accessToken, refreshToken } = response.data.data;
            dispatch(loginSuccess({ user, accessToken, refreshToken }));
            toast.success('Successfully logged in!');
            router.push('/dashboard');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to login. Please check your credentials.';
            dispatch(loginFailure(message));
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Welcome back"
            description="Enter your credentials to access your account"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="name@company.com"
                                            className="pl-10 h-10 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-medium text-primary hover:underline underline-offset-4"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-10 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </form>
            </Form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
                    Sign up
                </Link>
            </div>
        </AuthLayout>
    );
}
