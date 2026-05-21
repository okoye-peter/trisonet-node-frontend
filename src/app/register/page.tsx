'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Phone, Hash, Key } from 'lucide-react';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import AuthLayout from '@/components/auth/AuthLayout';
import api from '@/lib/axios';

const registerSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    phone: z.string().min(6, { message: 'Please enter a valid phone number.' }),
    country: z.string().min(1, { message: 'Please select a country.' }),
    region_id: z.string().min(1, { message: 'Please select a region.' }),
    referral_id: z.string().optional(),
    activation_code: z.string().optional(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [regions, setRegions] = useState<{id: string; name: string}[]>([]);
    const [countries, setCountries] = useState<string[]>([]);

    const ref = searchParams.get('ref') || '';

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            username: '',
            email: '',
            phone: '',
            country: '',
            region_id: '',
            referral_id: ref,
            activation_code: '',
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [regionsRes, countriesRes] = await Promise.all([
                    api.get('/regions'),
                    api.get('/regions/countries')
                ]);
                setRegions(regionsRes.data?.data || []);
                setCountries(countriesRes.data?.data || []);
            } catch (error) {
                console.error('Failed to fetch regions or countries', error);
                toast.error('Failed to load regions and countries');
            }
        };
        fetchData();
    }, []);

    async function onSubmit(values: RegisterFormValues) {
        setIsLoading(true);
        try {
            await api.post('/auth/register', {
                name: values.name,
                username: values.username,
                email: values.email,
                phone: values.phone,
                country: values.country,
                region_id: values.region_id,
                referral_id: values.referral_id,
                activation_code: values.activation_code,
                password: values.password,
                confirm_password: values.confirmPassword,
            });
            toast.success('Registration successful! Please login.');
            router.push('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string, error?: string } } };
            const message = err.response?.data?.error || err.response?.data?.message || 'Failed to register. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Create account"
            description="Enter your details below to create your account"
        >
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
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#040021] font-semibold">Username</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <Input
                                            placeholder="johndoe"
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
                                            type="email"
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
                                            type="tel"
                                            placeholder="+2348000000000"
                                            className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#040021] font-semibold">Country</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            placeholder="Select Country"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            triggerClassName="h-11 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:border-[#6639ff] transition-all font-normal text-sm"
                                            items={countries.map((c) => ({ label: c, value: c }))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="region_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#040021] font-semibold">Region</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            placeholder="Select Region"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            triggerClassName="h-11 bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:border-[#6639ff] transition-all font-normal text-sm"
                                            items={regions.map((r) => ({ label: r.name, value: r.id.toString() }))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="referral_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#040021] font-semibold">Referral Username (Optional)</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Hash className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <Input
                                            placeholder="Referral Username"
                                            readOnly={!!ref}
                                            className={`pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all ${
                                                !!ref ? 'cursor-not-allowed opacity-70 bg-zinc-100' : ''
                                            }`}
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
                        name="activation_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#040021] font-semibold">Activation Code (Optional)</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Key className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <Input
                                            placeholder="1234-5678"
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
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#040021] font-semibold">Confirm Password</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-[#8f98a8] group-focus-within:text-[#6639ff] transition-colors" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full h-12 bg-[#6639ff] hover:bg-[#5229db] text-white font-bold uppercase tracking-wider rounded-md transition-all shadow-lg shadow-[#6639ff]/20 mt-4"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Create Account <i className="fas fa-arrow-right text-xs"></i>
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

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#6639ff]" /></div>}>
            <RegisterForm />
        </Suspense>
    );
}
