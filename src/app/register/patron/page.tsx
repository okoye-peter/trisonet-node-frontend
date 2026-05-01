'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Phone, Shield, TrendingUp, BadgeCheck } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import AuthLayout from '@/components/auth/AuthLayout';
import api from '@/lib/axios';

interface PatronPlan {
    id: string;
    name: string;
    minAmount: number;
    maxAmount: number;
    earningPercentage: number | null;
}

const registerPatronSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }),
    patronType: z.enum(['individual', 'group']),
    planId: z.string().min(1, { message: 'Please select a plan.' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterPatronFormValues = z.infer<typeof registerPatronSchema>;

export default function RegisterPatronPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [plans, setPlans] = useState<PatronPlan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<PatronPlan | null>(null);

    const form = useForm<RegisterPatronFormValues>({
        resolver: zodResolver(registerPatronSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            patronType: 'individual',
            planId: '',
        },
    });

    useEffect(() => {
        api.get('/auth/patron-plans')
            .then((res) => setPlans(res.data?.data ?? []))
            .catch(() => toast.error('Failed to load plans. Please refresh.'))
            .finally(() => setPlansLoading(false));
    }, []);

    function handlePlanChange(planId: string, onChange: (v: string) => void) {
        onChange(planId);
        setSelectedPlan(plans.find((p) => String(p.id) === planId) ?? null);
    }

    async function onSubmit(values: RegisterPatronFormValues) {
        setIsLoading(true);
        try {
            const res = await api.post('/auth/register/patron', {
                name: values.name,
                email: values.email,
                phone: values.phone,
                password: values.password,
                patronType: values.patronType,
                planId: values.planId,
            });
            const { user, accessToken, refreshToken } = res.data.data;
            dispatch(loginSuccess({ user, accessToken, refreshToken }));
            toast.success('Account created! Complete your activation payment.');
            router.push('/patron/payment');
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
            title="Become a Patron"
            description="Register as a Patron to start earning and managing your network."
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="patronType"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-[#040021] font-semibold">Select Patron Type</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="individual" className="sr-only peer" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-center p-4 border-2 border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 peer-data-checked:border-[#6639ff] peer-data-checked:bg-[#6639ff]/5 transition-all text-center min-h-[140px]">
                                                <Shield className="w-6 h-6 mb-2 text-zinc-500 peer-data-checked:text-[#6639ff]" />
                                                <span className="text-sm font-bold">Individual</span>
                                                <p className="text-[10px] text-zinc-400 mt-1 leading-tight font-medium">Operate independently.</p>
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="group" className="sr-only peer" />
                                            </FormControl>
                                            <FormLabel className="flex flex-col items-center justify-center p-4 border-2 border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 peer-data-checked:border-[#6639ff] peer-data-checked:bg-[#6639ff]/5 transition-all text-center min-h-[140px]">
                                                <TrendingUp className="w-6 h-6 mb-2 text-zinc-500 peer-data-checked:text-[#6639ff]" />
                                                <span className="text-sm font-bold">Group</span>
                                                <p className="text-[10px] text-zinc-400 mt-1 leading-tight font-medium">Form a collective. Requires selecting a plan and making a deposit based on the chosen tier.</p>
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="planId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[#040021] font-semibold">Patron Plan <span className="text-red-500">*</span></FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(v) => handlePlanChange(v, field.onChange)}
                                    disabled={plansLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6639ff] focus:ring-[#6639ff]/20 transition-all rounded-md text-sm">
                                            {selectedPlan ? (
                                                <span>{selectedPlan.name}</span>
                                            ) : (
                                                <span className="text-zinc-400">
                                                    {plansLoading ? 'Loading plans…' : 'Select a plan'}
                                                </span>
                                            )}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {plans.map((plan) => (
                                            <SelectItem key={String(plan.id)} value={String(plan.id)}>
                                                {plan.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />

                                {selectedPlan && (
                                    <div className="mt-3 p-4 rounded-xl bg-[#6639ff]/5 border border-[#6639ff]/20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <BadgeCheck className="w-4 h-4 text-[#6639ff]" />
                                            <span className="text-xs font-bold text-[#6639ff] uppercase tracking-wider">Plan Summary</span>
                                            
                                            <p className='ml-auto text-xs text-[#6639ff]'>with service charge of 50,000</p>
                                        </div>
                                        <p className="text-sm font-bold text-[#040021] mb-2">{selectedPlan.name}</p>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="p-2 bg-white border rounded-lg border-zinc-100">
                                                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-0.5">Min</p>
                                                <p className="text-xs font-bold text-zinc-800">₦{selectedPlan.minAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="p-2 bg-white border rounded-lg border-zinc-100">
                                                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-0.5">Max</p>
                                                <p className="text-xs font-bold text-zinc-800">₦{selectedPlan.maxAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-2 border border-[#6639ff]/20">
                                                <p className="text-[10px] text-[#6639ff] font-medium uppercase tracking-wider mb-0.5">Returns</p>
                                                <p className="text-xs font-bold text-[#6639ff]">{selectedPlan.earningPercentage ?? '—'}%</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </FormItem>
                        )}
                    />

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
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Register as Patron <i className="text-xs fas fa-arrow-right"></i>
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
