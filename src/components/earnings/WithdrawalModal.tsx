'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Wallet as WalletIcon,
    Loader2,
    CheckCircle2,
    Building2,
    ShieldCheck,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useInitiateWithdrawalMutation } from '@/store/api/withdrawalApi';
import { useGetUserBankQuery } from '@/store/api/bankApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Wallet } from '@/types';

const withdrawalSchema = z.object({
    amount: z.number().min(100, 'Minimum withdrawal amount is ₦100'),
    pin: z.string().length(4, 'PIN must be 4 digits'),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

interface WithdrawalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    earningWallet: Wallet | undefined;
}

export function WithdrawalModal({ open, onOpenChange, earningWallet }: WithdrawalModalProps) {
    const [isSuccess, setIsSuccess] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: bankResponse, isLoading: isLoadingBank } = useGetUserBankQuery();
    const [initiateWithdrawal, { isLoading: isSubmitting }] = useInitiateWithdrawalMutation();

    const maxWithdrawal = earningWallet ? earningWallet.amount * 0.5 : 0;

    const form = useForm<WithdrawalFormValues>({
        resolver: zodResolver(withdrawalSchema),
        defaultValues: {
            amount: 0,
            pin: '',
        },
    });

    useEffect(() => {
        if (!open) {
            form.reset();
            // Reset success state after modal is closed to avoid flash
            const timer = setTimeout(() => setIsSuccess(false), 300);
            return () => clearTimeout(timer);
        }
    }, [open, form]);

    const onSubmit = async (values: WithdrawalFormValues) => {
        if (!earningWallet || !user) return;

        if (values.amount > maxWithdrawal) {
            toast.error(`You can only withdraw up to 50% of your balance (Max: ₦${maxWithdrawal.toLocaleString()})`);
            return;
        }

        if (!bankResponse?.data) {
            toast.error('Bank details not found. Please update your profile.');
            return;
        }

        try {
            await initiateWithdrawal({
                amount: values.amount,
                bank_name: bankResponse.data.name,
                bank_code: bankResponse.data.uuid,
                account_name: user.name,
                account_number: user.accountNumber || '',
                wallet: earningWallet.id?.toString() || '',
                withdrawal_pin: values.pin
            }).unwrap();

            setIsSuccess(true);
            toast.success('Withdrawal initiated successfully');
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Withdrawal failed');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-[500px] rounded-3xl md:rounded-[2rem] border-none shadow-2xl overflow-hidden p-0 bg-white dark:bg-zinc-950">
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="withdrawal-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-6 md:p-8 space-y-6"
                        >
                            <DialogHeader>
                                <DialogTitle className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-3 italic">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 rotate-3">
                                        <WalletIcon size={24} strokeWidth={2.5} />
                                    </div>
                                    Withdraw Funds
                                </DialogTitle>
                                <DialogDescription className="font-bold text-zinc-500 text-sm mt-2">
                                    Transfer your earnings directly to your registered bank account.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Withdrawal Policy Note */}
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex items-start gap-3">
                                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                <p className="text-xs font-bold text-amber-900/80 dark:text-amber-400/80 leading-relaxed">
                                    <span className="text-amber-600 uppercase tracking-wider block mb-1 font-black">Important Policy</span>
                                    You can only withdraw <span className="text-amber-600 font-black italic">50% of your total balance</span>. 
                                    Furthermore, withdrawals are limited to a <span className="text-amber-600 font-black italic">7-day interval</span> from your last withdrawal.
                                </p>
                            </div>

                            {/* Bank Details Preview */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Destination Bank</Label>
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-emerald-600">
                                        <Building2 size={20} />
                                    </div>
                                    <div className="flex-1">
                                        {isLoadingBank ? (
                                            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
                                        ) : (
                                            <>
                                                <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                                                    {bankResponse?.data?.name || 'N/A'}
                                                </p>
                                                <p className="text-xs font-bold text-zinc-500">
                                                    {user?.accountNumber || 'Account not set'}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount</Label>
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                                Max: ₦{maxWithdrawal.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-lg group-focus-within:text-emerald-500 transition-colors italic">₦</span>
                                            <Input
                                                type="number"
                                                {...form.register('amount', { valueAsNumber: true })}
                                                className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pl-10 pr-4 font-black text-xl text-zinc-900 dark:text-zinc-100 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transaction PIN</Label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10 group-focus-within:text-emerald-500 transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <Input
                                                type="password"
                                                maxLength={4}
                                                {...form.register('pin')}
                                                placeholder="****"
                                                className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pl-11 pr-4 font-black tracking-[0.5em] text-xl focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !bankResponse?.data}
                                    className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 group italic"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    ) : (
                                        <>
                                            Withdraw Funds
                                            <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-zinc-950"
                        >
                            <div className="bg-emerald-500 p-10 text-white text-center relative overflow-hidden">
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                                    className="relative z-10 flex flex-col items-center"
                                >
                                    <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md">
                                        <CheckCircle2 size={48} className="text-white" />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic">Withdrawal Sent!</h2>
                                    <p className="text-emerald-100 font-bold mt-2 opacity-90">Your request is being processed.</p>
                                </motion.div>
                                <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute -top-20 -left-20 h-64 w-64 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
                            </div>

                            <div className="p-8 space-y-8 bg-zinc-50/50 dark:bg-zinc-900/20">
                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Withdrawal Amount</p>
                                    <h3 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 italic">
                                        ₦{form.getValues('amount').toLocaleString()}
                                    </h3>
                                </div>

                                <div className="p-5 rounded-[1.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800 pb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</span>
                                        <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                                            <Loader2 size={10} className="animate-spin" /> Pending Approval
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Destination</span>
                                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
                                            {bankResponse?.data?.name}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-lg shadow-xl transition-all active:scale-95 italic"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Close Window
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
