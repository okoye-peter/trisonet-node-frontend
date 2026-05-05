'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/features/authSlice';
import { useFundPatronGroupMutation, useLazyCheckPatronFundingStatusQuery } from '@/store/api/patronApi';
import { ROLES } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Wallet, Copy, CheckCircle2, Clock, Building2, Hash, ArrowRight,
    AlertCircle, Loader2, ShieldCheck, AlertTriangle, Mail, BadgeCheck,
    Lock, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PagaVirtualAccountDetails } from '@/types';

type Stage = 'amount' | 'account' | 'polling' | 'success' | 'timeout';

export default function PatronPaymentPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector((s) => s.auth);

    function handleLogout() {
        dispatch(logout());
        router.replace('/login');
    }

    const [stage, setStage] = useState<Stage>('amount');
    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState('');
    const [virtualAccount, setVirtualAccount] = useState<PagaVirtualAccountDetails | null>(null);
    const [fundingData, setFundingData] = useState<{ reference: string; amount: number } | null>(null);

    const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [fundPatronGroup, { isLoading: initiating }] = useFundPatronGroupMutation();
    const [checkStatus] = useLazyCheckPatronFundingStatusQuery();

    const plan = user?.patronPlan ?? null;
    const min = plan?.minAmount ?? 1000;
    const max = plan?.maxAmount ?? Infinity;

    // Auth & activation guards
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }
        if (user?.role !== ROLES.PATRON) {
            router.replace('/dashboard');
            return;
        }
        if (user?.patronActivated) {
            router.replace('/patron/dashboard');
        }
    }, [isAuthenticated, user, router]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearTimeout(pollingRef.current);
        };
    }, []);

    function validateAmount(value: string): boolean {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
            setAmountError('Please enter a valid amount.');
            return false;
        }
        if (num < min) {
            setAmountError(`Minimum amount for your plan is ₦${min.toLocaleString()}.`);
            return false;
        }
        if (isFinite(max) && num > max) {
            setAmountError(`Maximum amount for your plan is ₦${max.toLocaleString()}.`);
            return false;
        }
        setAmountError('');
        return true;
    }

    async function handleInitiate() {
        if (!validateAmount(amount)) return;
        try {
            const res = await fundPatronGroup({ amount: parseFloat(amount) }).unwrap();
            if (res.data) {
                setVirtualAccount(res.data.account_detail);
                setFundingData({ reference: res.data.reference, amount: res.data.amount });
                setStage('account');
                toast.success('Virtual account generated!');
            }
        } catch (err: unknown) {
            const e = err as { data?: { message?: string } };
            toast.error(e.data?.message || 'Failed to generate virtual account. Please try again.');
        }
    }

    function handleConfirmTransfer() {
        if (!fundingData) return;
        setStage('polling');

        const startTime = Date.now();
        const duration = 2 * 60 * 1000;
        let delay = 5000;

        const poll = async () => {
            if (Date.now() - startTime > duration) {
                setStage('timeout');
                return;
            }
            try {
                const res = await checkStatus(fundingData.reference).unwrap();
                if (res.data?.status === 'success' || res.data?.status === 'completed') {
                    setStage('success');
                    return;
                }
            } catch {
                // continue polling on error
            }
            delay = Math.min(delay * 1.5, 30000);
            pollingRef.current = setTimeout(poll, delay);
        };

        poll();
    }

    function copyToClipboard(text: string, label: string) {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    }

    if (!isAuthenticated || !user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-white to-[#ede9fe] flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8 relative">
                    <button
                        onClick={handleLogout}
                        className="absolute right-0 top-0 flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6639ff] shadow-lg shadow-[#6639ff]/30 mb-4">
                        <Lock className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-[#040021] tracking-tight">Activate Your Account</h1>
                    <p className="text-sm text-zinc-500 font-medium mt-1">
                        Complete your initial deposit to unlock the patron dashboard.
                    </p>
                </div>

                {/* Plan summary card */}
                {plan && (
                    <div className="mb-6 p-4 rounded-2xl bg-white border border-[#6639ff]/20 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <BadgeCheck className="w-4 h-4 text-[#6639ff]" />
                            <span className="text-xs font-black text-[#6639ff] uppercase tracking-widest">Your Plan</span>
                        </div>
                        <p className="text-base font-black text-[#040021] mb-3">{plan.name}</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-100">
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Min Deposit</p>
                                <p className="text-xs font-black text-zinc-800">₦{plan.minAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-100">
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Max Deposit</p>
                                <p className="text-xs font-black text-zinc-800">₦{plan.maxAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-[#6639ff]/5 rounded-xl p-2.5 border border-[#6639ff]/20">
                                <p className="text-[9px] text-[#6639ff] font-bold uppercase tracking-wider mb-0.5">Returns</p>
                                <p className="text-xs font-black text-[#6639ff]">{plan.earningPercentage ?? '—'}%</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/80 overflow-hidden border border-zinc-100">
                    <div className="bg-[#6639ff] px-8 py-6">
                        <p className="text-white font-black text-xl tracking-tight">Activation Payment</p>
                        <p className="text-white/60 text-xs font-medium uppercase tracking-widest mt-1">
                            Secure transfer
                        </p>
                    </div>

                    <div className="p-8">
                        <AnimatePresence mode="wait">

                            {/* ── Stage: amount entry ── */}
                            {stage === 'amount' && (
                                <motion.div
                                    key="amount"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                            Deposit Amount (₦)
                                        </Label>
                                        <div className="relative">
                                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={18} />
                                            <Input
                                                type="text"
                                                placeholder={plan ? `₦${plan.minAmount.toLocaleString()} – ₦${plan.maxAmount.toLocaleString()}` : 'Enter amount'}
                                                className="h-14 rounded-2xl bg-zinc-50 border-none pl-12 pr-4 font-black text-xl text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-2 focus-visible:ring-[#6639ff]/30"
                                                value={amount ? `₦${Number(amount).toLocaleString()}` : ''}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\D/g, '');
                                                    setAmount(rawValue);
                                                    setAmountError('');
                                                }}
                                            />
                                        </div>
                                        {amountError && (
                                            <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                                                <AlertCircle size={12} /> {amountError}
                                            </p>
                                        )}
                                        {plan && (
                                            <p className="text-[10px] text-zinc-400 font-bold">
                                                Allowed range: ₦{plan.minAmount.toLocaleString()} – ₦{plan.maxAmount.toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
                                                Transfer exactly the amount shown to ensure instant processing.
                                            </p>
                                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
                                                Note: A service charge of ₦50,000 applies to this activation.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleInitiate}
                                        disabled={initiating || !amount}
                                        className="w-full h-14 rounded-2xl bg-[#6639ff] hover:bg-[#5229db] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#6639ff]/20 transition-all active:scale-95"
                                    >
                                        {initiating ? (
                                            <><Loader2 size={16} className="mr-2 animate-spin" /> Generating Account…</>
                                        ) : (
                                            <>Generate Virtual Account <ArrowRight size={16} className="ml-2" /></>
                                        )}
                                    </Button>
                                </motion.div>
                            )}

                            {/* ── Stage: virtual account details ── */}
                            {stage === 'account' && virtualAccount && fundingData && (
                                <motion.div
                                    key="account"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-1">
                                        <div className="h-12 w-12 rounded-full bg-[#6639ff]/10 flex items-center justify-center mx-auto mb-2">
                                            <CheckCircle2 size={24} className="text-[#6639ff]" />
                                        </div>
                                        <h4 className="font-black text-zinc-900 text-xl tracking-tight">Account Generated</h4>
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Pay via Bank Transfer</p>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-zinc-50 space-y-5">
                                        <div
                                            className="space-y-1 cursor-pointer group"
                                            onClick={() => copyToClipboard(virtualAccount.account_number, 'Account number')}
                                        >
                                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
                                                <Hash size={10} /> Account Number
                                            </Label>
                                            <div className="flex items-center justify-between">
                                                <p className="font-black text-zinc-900 text-3xl tracking-tighter">{virtualAccount.account_number}</p>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white group-hover:scale-110 transition-transform">
                                                    <Copy size={15} className="text-zinc-400" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-start pt-4 border-t border-zinc-200">
                                            <div className="space-y-4">
                                                <div className="space-y-0.5">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                        <Building2 size={10} /> Bank Name
                                                    </Label>
                                                    <p className="font-black text-zinc-900 text-sm uppercase">{virtualAccount.bank_name}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                                        <BadgeCheck size={10} /> Account Name
                                                    </Label>
                                                    <p className="font-black text-zinc-900 text-sm">{virtualAccount.account_name}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-0.5 text-right">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center justify-end gap-1.5">
                                                    <Clock size={10} /> Expires
                                                </Label>
                                                <p className="font-black text-rose-500 text-sm">{virtualAccount.expiry_date}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-200">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mb-1">
                                                <Wallet size={10} /> Amount to Pay
                                            </Label>
                                            <p className="font-black text-[#6639ff] text-2xl tracking-tighter">₦{fundingData.amount.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleConfirmTransfer}
                                        className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        I Have Made the Transfer
                                    </Button>
                                </motion.div>
                            )}

                            {/* ── Stage: polling ── */}
                            {stage === 'polling' && (
                                <motion.div
                                    key="polling"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    className="py-12 text-center space-y-6"
                                >
                                    <div className="relative inline-flex">
                                        <div className="h-24 w-24 rounded-full border-4 border-[#6639ff]/10 border-t-[#6639ff] animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 size={32} className="text-[#6639ff] animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-black text-zinc-900 text-2xl tracking-tight">Verifying Payment</h4>
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed px-6">
                                            Confirming your transfer — this may take up to 2 minutes. Do not close this page.
                                        </p>
                                    </div>
                                    <div className="bg-[#6639ff]/5 border border-[#6639ff]/10 px-5 py-3 rounded-2xl inline-block">
                                        <p className="text-[10px] font-black text-[#6639ff] uppercase tracking-widest animate-pulse">
                                            Polling Transaction Status…
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Stage: success ── */}
                            {stage === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-12 text-center space-y-6"
                                >
                                    <div className="h-24 w-24 rounded-full bg-[#6639ff] text-white flex items-center justify-center mx-auto shadow-2xl shadow-[#6639ff]/30">
                                        <ShieldCheck size={48} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-black text-zinc-900 text-3xl tracking-tight">Account Activated!</h4>
                                        <p className="text-sm text-zinc-500 font-medium px-8">
                                            Your payment was confirmed. Your patron account is now active.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => router.replace('/patron/dashboard')}
                                        className="w-full h-14 rounded-2xl bg-[#6639ff] hover:bg-[#5229db] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#6639ff]/20 transition-all"
                                    >
                                        Go to Dashboard <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </motion.div>
                            )}

                            {/* ── Stage: timeout ── */}
                            {stage === 'timeout' && (
                                <motion.div
                                    key="timeout"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-10 text-center space-y-5"
                                >
                                    <div className="h-20 w-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                                        <AlertTriangle size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-black text-zinc-900 text-2xl tracking-tight">Verification Delayed</h4>
                                        <p className="text-sm text-zinc-500 font-medium px-6">
                                            Your payment is being processed but confirmation is taking longer than expected.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-left">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed mb-1">
                                            Reference number:
                                        </p>
                                        <p className="text-xs font-black text-zinc-900 select-all break-all">{fundingData?.reference}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setStage('amount')}
                                            className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-widest border-zinc-200"
                                        >
                                            Try Again
                                        </Button>
                                        <Button
                                            onClick={() => window.open('mailto:support@trisonet.com')}
                                            className="flex-1 h-12 rounded-xl bg-zinc-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest"
                                        >
                                            <Mail size={14} className="mr-1.5" /> Contact Support
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
