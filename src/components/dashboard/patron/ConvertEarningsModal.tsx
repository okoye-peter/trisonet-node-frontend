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
import { useConvertPatronEarningsMutation } from '@/store/api/patronApi';
import { toast } from 'sonner';
import { Loader2, TrendingUp, ArrowRight, Wallet, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
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
    const [convertEarnings, { isLoading }] = useConvertPatronEarningsMutation();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
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
            form.setError("amount", { message: `Limit exceeded. Max: ${maxAmount.toFixed(2)}` });
            return;
        }

        try {
            await convertEarnings({ amount }).unwrap();
            toast.success("Assets converted successfully");
            form.reset();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error?.data?.message || "Conversion failed");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900">Convert Assets</DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium text-sm">
                        Convert up to 50% of your earnings into GKWTH every 7 days.
                    </DialogDescription>
                </DialogHeader>

                {isLocked && (
                    <div className="mx-8 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8 pt-4">
                        <div className="grid gap-4">
                            <div className="p-4 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-zinc-400 shadow-sm">
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
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Asset Amount to Convert (Max 50%)</FormLabel>
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
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
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
                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-[10px] font-bold text-zinc-400">Convertible Limit: {maxAmount.toLocaleString()}</p>
                                            <FormMessage className="text-[10px] font-black uppercase" />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-center py-2">
                                <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100">
                                    <ArrowRight className="rotate-90" size={14} />
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-zinc-900 text-white relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 text-white/5 transition-transform group-hover:scale-110 duration-500">
                                    <Wallet size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Expected GKWTH</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl font-black tracking-tighter">
                                            {expectedGkwth.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </h3>
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">GKWTH</span>
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
