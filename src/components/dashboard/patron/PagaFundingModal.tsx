'use client';

import { useState } from 'react';
import { useFundPatronGroupMutation, useLazyCheckPatronFundingStatusQuery } from '@/store/api/patronApi';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
    Wallet, 
    Copy, 
    CheckCircle2, 
    Clock, 
    Building2, 
    Hash, 
    ArrowRight,
    AlertCircle,
    Users,
    Loader2,
    ShieldCheck,
    AlertTriangle,
    Mail
} from 'lucide-react';
import { PagaVirtualAccountDetails } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PagaFundingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PagaFundingModal({ open, onOpenChange }: PagaFundingModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [virtualAccount, setVirtualAccount] = useState<PagaVirtualAccountDetails | null>(null);
    const [fundingData, setFundingData] = useState<{ reference: string, amount: number } | null>(null);
    const [status, setStatus] = useState<'entry' | 'account' | 'polling' | 'success' | 'timeout'>('entry');
    
    const [fundPatronGroup, { isLoading }] = useFundPatronGroupMutation();
    const [checkStatus] = useLazyCheckPatronFundingStatusQuery();

    const handleInitiate = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 1000) {
            toast.error('Please enter a valid amount (minimum ₦1,000)');
            return;
        }

        try {
            const response = await fundPatronGroup({ amount: numAmount }).unwrap();
            if (response.data) {
                setVirtualAccount(response.data.account_detail);
                setFundingData({
                    reference: response.data.reference,
                    amount: response.data.amount
                });
                setStatus('account');
                toast.success('Virtual account generated!');
            }
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || 'Failed to initiate funding');
        }
    };

    const handleConfirmTransfer = async () => {
        if (!fundingData) return;
        
        setStatus('polling');
        const startTime = Date.now();
        const duration = 2 * 60 * 1000; // 2 minutes
        let delay = 5000; // Start with 5 seconds

        const poll = async () => {
            if (Date.now() - startTime > duration) {
                setStatus('timeout');
                return;
            }

            try {
                const res = await checkStatus(fundingData.reference).unwrap();
                if (res.data?.status === 'success' || res.data?.status === 'completed') {
                    setStatus('success');
                    toast.success('Payment confirmed!');
                    return;
                }
            } catch (error) {
                console.error("Polling error:", error);
            }

            // Exponential backoff: increase delay by 1.5x each time, max 30s
            const nextDelay = Math.min(delay * 1.5, 30000);
            delay = nextDelay;
            setTimeout(poll, delay);
        };

        poll();
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state after a short delay to allow closing animation
        setTimeout(() => {
            setVirtualAccount(null);
            setAmount('');
            setFundingData(null);
            setStatus('entry');
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <DialogHeader className="relative z-10 text-left">
                        <DialogTitle className="text-3xl font-black tracking-tighter">Fund Patron Wallet</DialogTitle>
                        <DialogDescription className="text-emerald-100/70 font-medium text-xs uppercase tracking-widest mt-2">
                            Secure Transfer via Paga
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {status === 'entry' && (
                            <motion.div 
                                key="entry"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Funding Amount (₦)</Label>
                                    <div className="relative">
                                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                                        <Input 
                                            type="number"
                                            placeholder="100,000"
                                            className="h-14 rounded-2xl bg-zinc-50 border-none pl-12 pr-4 font-black text-xl text-zinc-900 placeholder:text-zinc-200 transition-all focus-visible:ring-2 focus-visible:ring-emerald-600/20"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold">
                                        Funds will be credited to your patronage wallet upon confirmation.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
                                        Transfer exactly the amount requested to ensure instant processing.
                                    </p>
                                </div>

                                <Button 
                                    onClick={handleInitiate}
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? 'Generating Account...' : 'Generate Virtual Account'} <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </motion.div>
                        )}

                        {status === 'account' && virtualAccount && (
                            <motion.div 
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2">
                                    <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <h4 className="font-black text-zinc-900 tracking-tighter text-xl">Account Generated</h4>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Pay via Bank Transfer</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 rounded-[2rem] bg-zinc-50 space-y-6">
                                        <div className="space-y-1 relative group cursor-pointer" onClick={() => copyToClipboard(virtualAccount.account_number, 'Account number')}>
                                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                                <Hash size={10} /> Account Number
                                            </Label>
                                            <div className="flex items-center justify-between">
                                                <p className="font-black text-zinc-900 text-3xl tracking-tighter">{virtualAccount.account_number}</p>
                                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white group-hover:scale-110 transition-transform">
                                                    <Copy size={16} className="text-zinc-400" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-start pt-4 border-t border-zinc-100">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                                    <Users size={10} /> Account Name
                                                </Label>
                                                <p className="font-black text-zinc-900 text-sm">{virtualAccount.account_name}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center justify-end gap-2">
                                                    <Clock size={10} /> Expiry Time
                                                </Label>
                                                <p className="font-black text-rose-500 text-sm">{virtualAccount.expiry_date}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1 pt-4 border-t border-zinc-100">
                                            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                                <Wallet size={10} /> Amount to Pay
                                            </Label>
                                            <p className="font-black text-emerald-600 text-2xl tracking-tighter">₦{fundingData?.amount.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl border border-dashed border-zinc-200 flex gap-3 items-center">
                                        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={14} className="text-zinc-400" />
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-500 leading-snug">
                                            Transfer exactly ₦{fundingData?.amount.toLocaleString()} to the account above. Your wallet will be credited automatically.
                                        </p>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleConfirmTransfer}
                                    className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                                >
                                    I Have Made the Transfer
                                </Button>
                            </motion.div>
                        )}

                        {status === 'polling' && (
                            <motion.div 
                                key="polling"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="py-12 text-center space-y-6"
                            >
                                <div className="relative inline-flex">
                                    <div className="h-24 w-24 rounded-full border-4 border-emerald-50 border-t-emerald-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 size={32} className="text-emerald-500 animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-zinc-900 text-2xl tracking-tighter">Processing Payment</h4>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed px-8">
                                        We are verifying your transfer. This may take up to 2 minutes. Please do not close this window.
                                    </p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 inline-block">
                                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest animate-pulse">
                                        Polling Transaction Status...
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-12 text-center space-y-6"
                            >
                                <div className="h-24 w-24 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200">
                                    <ShieldCheck size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-zinc-900 text-3xl tracking-tighter">Payment Successful</h4>
                                    <p className="text-sm text-zinc-500 font-medium px-8">
                                        Your patronage wallet has been credited successfully. You can now proceed with your activities.
                                    </p>
                                </div>
                                <Button 
                                    onClick={handleClose}
                                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all"
                                >
                                    Go to Dashboard
                                </Button>
                            </motion.div>
                        )}

                        {status === 'timeout' && (
                            <motion.div 
                                key="timeout"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-12 text-center space-y-6"
                            >
                                <div className="h-24 w-24 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                                    <AlertTriangle size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-zinc-900 text-2xl tracking-tighter">Verification Delayed</h4>
                                    <p className="text-sm text-zinc-500 font-medium px-8">
                                        Your payment is being processed but verification is taking longer than expected.
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 mx-8">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                                        If your wallet is not credited within 10 minutes, please contact support with your reference:
                                    </p>
                                    <p className="text-xs font-black text-zinc-900 mt-1 select-all">{fundingData?.reference}</p>
                                </div>
                                <div className="flex gap-4 px-8">
                                    <Button 
                                        variant="outline"
                                        onClick={handleClose}
                                        className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-widest border-zinc-200"
                                    >
                                        Close
                                    </Button>
                                    <Button 
                                        onClick={() => window.open('mailto:support@trisonet.com')}
                                        className="flex-1 h-12 rounded-xl bg-zinc-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest"
                                    >
                                        <Mail size={16} className="mr-2" /> Support
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
