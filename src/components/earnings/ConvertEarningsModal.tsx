'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useConvertCustomerEarningsMutation } from '@/store/api/walletApi';
import { toast } from 'sonner';
import { Loader2, TrendingUp, ArrowRight, Wallet, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    pin: z.string().length(4, "Sorry, that’s not your transaction PIM. Please check and try again."),
});

interface ConvertEarningsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    maxAmount: number;
    conversionRate: number;
    nextAllowedDate: string | null;
}

export default function ConvertEarningsModal({ 
    open, 
    onOpenChange, 
    maxAmount,
    conversionRate,
    nextAllowedDate
}: ConvertEarningsModalProps) {
    const [convertEarnings, { isLoading }] = useConvertCustomerEarningsMutation();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            pin: "",
        },
    });

    const watchAmount = form.watch("amount");
    const expectedGkwth = watchAmount ? Number(watchAmount) / conversionRate : 0;

    const isLocked = nextAllowedDate ? new Date(nextAllowedDate) > new Date() : false;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isLocked) {
            toast.error(`Next conversion available after ${new Date(nextAllowedDate!).toLocaleString()}`);
            return;
        }

        const amount = Number(values.amount);
        if (amount > maxAmount) {
            form.setError("amount", { message: `Limit exceeded. Max: ${maxAmount.toLocaleString()}` });
            return;
        }

        try {
            await convertEarnings({ amount, pin: values.pin }).unwrap();
            toast.success("Assets converted successfully");
            form.reset();
            onOpenChange(false);
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || "Conversion failed");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900">Convert Business Assets</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-zinc-500">
                        Convert your business assets into GKWTH.
                    </DialogDescription>
                </DialogHeader>

                {isLocked && (
                    <div className="flex items-start gap-3 p-4 mx-8 border rounded-2xl bg-amber-50 border-amber-100">
                        <Calendar className="text-amber-600 shrink-0 mt-0.5" size={16} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Cooldown Active</p>
                            <p className="text-[10px] font-bold text-amber-600/80 mt-0.5">
                                Next conversion: {new Date(nextAllowedDate!).toLocaleDateString()} at {new Date(nextAllowedDate!).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 pt-4 space-y-6">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between p-4 border rounded-3xl bg-zinc-50 border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-white shadow-sm rounded-2xl text-zinc-400">
                                        <TrendingUp size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Rate</p>
                                        <p className="text-sm font-black text-zinc-900">1 GKWTH = {conversionRate} Asset</p>
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Asset Amount to Convert</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input 
                                                    placeholder="0.00" 
                                                    {...field} 
                                                    disabled={isLocked}
                                                    className={cn(
                                                        "h-14 px-6 rounded-2xl bg-zinc-50 border-none focus-visible:ring-2 focus-visible:ring-zinc-900 font-black text-lg placeholder:text-zinc-300",
                                                        isLocked && "opacity-50 cursor-not-allowed"
                                                    )}
                                                />
                                                <div className="absolute flex items-center gap-2 -translate-y-1/2 right-6 top-1/2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Asset</span>
                                                    {!isLocked && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => form.setValue("amount", maxAmount.toString())}
                                                            className="text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:opacity-70 transition-opacity"
                                                        >
                                                            Max
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <div className="flex items-center justify-between px-1">
                                            <p className="text-[10px] font-bold text-zinc-400">Assets available for conversion to gkwth: {maxAmount.toLocaleString()}</p>
                                            <FormMessage className="text-[10px] font-black uppercase" />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Withdrawal Pin</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password"
                                                placeholder="••••" 
                                                {...field} 
                                                disabled={isLocked}
                                                className={cn(
                                                    "h-14 px-6 rounded-2xl bg-zinc-50 border-none focus-visible:ring-2 focus-visible:ring-zinc-900 font-black text-lg placeholder:text-zinc-300",
                                                    isLocked && "opacity-50 cursor-not-allowed"
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-black uppercase ml-1" />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-center py-2">
                                <div className="flex items-center justify-center w-8 h-8 border rounded-full bg-zinc-50 text-zinc-300 border-zinc-100">
                                    <ArrowRight className="rotate-90" size={14} />
                                </div>
                            </div>

                            <div className="relative p-6 overflow-hidden text-white rounded-3xl bg-zinc-900 group">
                                <div className="absolute transition-transform duration-500 -right-4 -top-4 text-white/5 group-hover:scale-110">
                                    <Wallet size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Expected GKWTH</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl font-black tracking-tighter">
                                            {expectedGkwth.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </h3>
                                        <span className="text-xs font-black tracking-widest uppercase text-zinc-500">GKWTH</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isLoading || isLocked}
                            className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : isLocked ? "Cooldown Active" : "Confirm Conversion"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
