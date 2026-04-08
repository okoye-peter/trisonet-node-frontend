'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    CreditCard, 
    Zap, 
    Users, 
    Loader2, 
    CheckCircle2, 
    Copy, 
    AlertCircle
} from 'lucide-react';
import type { WardStats } from '@/types';
import { toast } from 'sonner';
import { useGenerateWardSlotVirtualAccountMutation, useVerifyWardSlotPurchaseMutation } from '@/store/api/walletApi';
import { useQueryClient } from '@tanstack/react-query';

interface SlotPurchaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stats: WardStats | undefined;
}

interface PaymentDetail {
    account_name: string;
    bank_name: string;
    account_number: string;
    amount: number;
    expiry_date: string;
}

export function SlotPurchaseModal({ open, onOpenChange, stats }: SlotPurchaseModalProps) {
    const [generateVirtualAccount, { isLoading: isGenerating }] = useGenerateWardSlotVirtualAccountMutation();
    const [verifyPurchase, { isLoading: isVerifying }] = useVerifyWardSlotPurchaseMutation();
    const queryClient = useQueryClient();
    
    const [type, setType] = useState<'limited' | 'unlimited'>('limited');
    const [quantity, setQuantity] = useState<number>(1);
    const [paymentDetail, setPaymentDetail] = useState<(PaymentDetail & { reference: string }) | null>(null);

    const pricePerSlot = stats?.pricePerSlot || 0;
    const unlimitedPrice = stats?.unlimitedSlotPrice || 0;

    const total = type === 'limited' ? quantity * pricePerSlot : unlimitedPrice;

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setPaymentDetail(null);
            setType('limited');
            setQuantity(1);
        }
        onOpenChange(newOpen);
    };


    const handlePurchase = async () => {
        try {
            const res = await generateVirtualAccount({
                type,
                quantity: type === 'limited' ? quantity : undefined
            }).unwrap();
            if (res.data) {
                setPaymentDetail({
                    ...res.data.account_detail,
                    reference: res.data.reference
                });
                toast.success('Virtual account generated successfully!');
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            const message = err?.data?.message || err.message || 'Failed to generate virtual account';
            toast.error(message);
        }
    };

    const handleVerify = async () => {
        if (!paymentDetail?.reference) return;

        const maxDuration = 90000; // 1 minute 30 seconds
        let elapsed = 0;
        let delay = 2000; // Start with 2 seconds
        const multiplier = 1.5;

        const poll = async () => {
            try {
                const res = await verifyPurchase({ reference: paymentDetail.reference }).unwrap();
                if (res.status === 'success' || res.success) {
                    toast.success('Payment verified successfully!');
                    queryClient.invalidateQueries({ queryKey: ['wardStats'] });
                    queryClient.invalidateQueries({ queryKey: ['wards'] }); // Assuming 'wards' is used by DataTable
                    handleOpenChange(false);
                    // Force a re-render/refresh of the page
                    window.location.reload();
                    return;
                }
            } catch (error: any) {
                // If 404, we continue polling
                if (error.status !== 404) {
                    console.error('Polling error:', error);
                }
            }

            if (elapsed >= maxDuration) {
                toast.info('Your payment is being processed. If you don\'t get your slot after 30 minutes, please contact admin.', {
                    duration: 10000,
                });
                handleOpenChange(false);
                return;
            }

            setTimeout(() => {
                elapsed += delay;
                delay = Math.min(delay * multiplier, 10000); // Caps at 10s
                poll();
            }, delay);
        };

        poll();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl overflow-y-auto p-0">
                {!paymentDetail ? (
                    <div className="p-6 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black tracking-tighter text-zinc-900 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Users size={20} strokeWidth={2.5} />
                                </div>
                                Purchase Slots
                            </DialogTitle>
                            <DialogDescription className="font-medium text-zinc-500">
                                Choose the type of ward slots you want to purchase. Unlimited slots grant you lifetime access for a fix price.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Slot Type</Label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none">
                                        {type === 'limited' ? <Users size={16} /> : <Zap size={16} className="text-amber-500" />}
                                    </div>
                                    <Select value={type} onValueChange={(v: 'limited' | 'unlimited' | null) => v && setType(v)}>
                                        <SelectTrigger className="h-14 w-full rounded-xl border-zinc-100 bg-zinc-50/50 pl-11 pr-4 font-bold text-zinc-900 focus:ring-indigo-500/10">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="limited">
                                                Limited Slots
                                            </SelectItem>
                                            <SelectItem value="unlimited">
                                                Unlimited Access
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price Per Slot</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₦</span>
                                        <Input 
                                            readOnly 
                                            value={type === 'limited' ? pricePerSlot.toLocaleString() : unlimitedPrice.toLocaleString()} 
                                            className="h-14 rounded-xl border-zinc-100 bg-zinc-50/50 pl-8 pr-4 font-bold text-zinc-900 focus:ring-0 cursor-default"
                                        />
                                    </div>
                                </div>

                                {type === 'limited' && (
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quantity</Label>
                                        <Input 
                                            type="number"
                                            min={1}
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="h-14 rounded-xl border-zinc-100 bg-white px-4 font-black text-indigo-600 focus:ring-indigo-500/10 text-xl"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl bg-linear-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                                <div className="absolute top-[-20px] right-[-20px] h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100/60">Total Amount Payable</p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold opacity-60">₦</span>
                                        <h3 className="text-4xl font-black tracking-tighter">
                                            {total.toLocaleString()}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button 
                                onClick={handlePurchase}
                                disabled={isGenerating}
                                className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-lg shadow-xl shadow-zinc-200 transition-all active:scale-95"
                            >
                                {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                                Generate Payment Account
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="p-0 overflow-hidden rounded-xl">
                        <div className="bg-emerald-500 p-8 text-white text-center relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/20 to-transparent" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className="text-2xl font-black tracking-tighter">Payment Account Ready</h2>
                                <p className="text-emerald-100 font-medium">Please transfer the exact amount below to the account provided.</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount to Transfer</p>
                                <h3 className="text-4xl font-black tracking-tighter text-zinc-900">₦{paymentDetail.amount.toLocaleString()}</h3>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold flex items-center gap-1 mx-auto w-fit px-3 py-1">
                                    <AlertCircle size={12} />
                                    Expires at {paymentDetail.expiry_date}
                                </Badge>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="group rounded-2xl bg-zinc-50 p-5 border border-zinc-100 hover:border-indigo-200 transition-all cursor-pointer" onClick={() => copyToClipboard(paymentDetail.account_number)}>
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Account Details</p>
                                        <Copy size={14} className="text-zinc-300 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-black tracking-tight text-zinc-900 selection:bg-indigo-100">{paymentDetail.account_number}</p>
                                        <p className="font-bold text-indigo-600">{paymentDetail.bank_name}</p>
                                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{paymentDetail.account_name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <Button 
                                    className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-70"
                                    onClick={handleVerify}
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Verifying Payment...
                                        </>
                                    ) : (
                                        'I Have Made the Payment'
                                    )}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="h-12 rounded-xl text-zinc-400 font-bold hover:text-zinc-600"
                                    onClick={() => setPaymentDetail(null)}
                                >
                                    Cancel and Change
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
