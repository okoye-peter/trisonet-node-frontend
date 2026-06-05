'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldOff, CreditCard, KeyRound, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useGeneratePukVirtualAccountMutation, useUnblockWithPukMutation } from '@/store/api/userApi';
import { useCurrencySymbol } from '@/hooks/useCurrencySymbol';

interface AccountDetail {
    account_name: string;
    bank_name: string;
    account_number: string;
    expires_at: string;
    amount: number;
    reference: string;
}

type Step = 'main' | 'bank_details' | 'puk';

interface BlockedAccountModalProps {
    isOpen: boolean;
    onSuccess: () => void;
    onLogout: () => void;
}

export default function BlockedAccountModal({ isOpen, onSuccess, onLogout }: BlockedAccountModalProps) {
    const currency = useCurrencySymbol();
    const [step, setStep] = useState<Step>('main');
    const [accountDetail, setAccountDetail] = useState<AccountDetail | null>(null);
    const [puk, setPuk] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const [generateVirtualAccount, { isLoading: isGenerating }] = useGeneratePukVirtualAccountMutation();
    const [unblockWithPuk, { isLoading: isUnblocking }] = useUnblockWithPukMutation();

    const handleGenerateAccount = async () => {
        try {
            const res = await generateVirtualAccount().unwrap();
            if (!res.data) throw new Error('No account data returned');
            setAccountDetail(res.data.account_detail);
            setStep('bank_details');
        } catch (err) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || 'Failed to generate payment account');
        }
    };

    const handleUnblock = async () => {
        if (!puk.trim()) {
            toast.error('Please enter your PUK code');
            return;
        }
        try {
            await unblockWithPuk({ puk: puk.trim() }).unwrap();
            toast.success('Account reactivated successfully!');
            onSuccess();
        } catch (err) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || 'Invalid PUK code');
        }
    };

    const handleCopy = (value: string, key: string) => {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {/* Backdrop absorbs all clicks — nothing behind the modal is reachable */}
            <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-[2.5rem]"
                >
                    {/* Header */}
                    <div className="relative h-28 bg-linear-to-br from-red-500 via-rose-500 to-red-600 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-[-20%] left-[-10%] w-56 h-56 bg-white rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-[-30%] right-[-10%] w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
                        </div>
                        <div className="relative flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <ShieldOff className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white/80 text-xs font-medium tracking-widest uppercase">
                                {step === 'main' && 'Account Disabled'}
                                {step === 'bank_details' && 'Payment Account'}
                                {step === 'puk' && 'Enter PUK Code'}
                            </span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {step === 'main' && (
                                <motion.div
                                    key="main"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center space-y-1">
                                        <h2 className="text-lg font-bold text-zinc-900">Your PIM has been disabled</h2>
                                        <p className="text-sm text-zinc-500 leading-relaxed">
                                            Your account has been disabled. Generate a payment account to purchase a PUK code, or enter an existing PUK code to reactivate.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2">
                                        <Button
                                            onClick={handleGenerateAccount}
                                            disabled={isGenerating}
                                            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            {isGenerating ? 'Generating…' : 'Generate Account for Payment'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep('puk')}
                                            className="w-full h-11 rounded-xl gap-2"
                                        >
                                            <KeyRound className="w-4 h-4" />
                                            I have a PUK Code
                                        </Button>
                                    </div>

                                    <button
                                        onClick={onLogout}
                                        className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors pt-1"
                                    >
                                        Sign out
                                    </button>
                                </motion.div>
                            )}

                            {step === 'bank_details' && accountDetail && (
                                <motion.div
                                    key="bank_details"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center space-y-1">
                                        <h2 className="text-base font-bold text-zinc-900">Make Your Payment</h2>
                                        <p className="text-xs text-zinc-500 leading-relaxed">
                                            Transfer to the account below. Your PUK code will be sent to your registered phone number after payment is confirmed.
                                        </p>
                                    </div>

                                    <div className="bg-zinc-50 rounded-2xl divide-y divide-zinc-100 border border-zinc-100 overflow-hidden">
                                        {[
                                            { label: 'Bank', value: accountDetail.bank_name, key: 'bank' },
                                            { label: 'Account Name', value: accountDetail.account_name, key: 'name' },
                                            { label: 'Account Number', value: accountDetail.account_number, key: 'number' },
                                            { label: 'Amount', value: `${currency}${Number(accountDetail.amount).toLocaleString()}`, key: 'amount' },
                                            { label: 'Expires At', value: accountDetail.expires_at, key: 'expires' },
                                        ].map(({ label, value, key }) => (
                                            <div key={key} className="flex items-center justify-between px-4 py-3">
                                                <span className="text-xs text-zinc-500 w-28 shrink-0">{label}</span>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-sm font-semibold text-zinc-900 truncate">{value}</span>
                                                    {(key === 'number' || key === 'amount') && (
                                                        <button
                                                            onClick={() => handleCopy(value, key)}
                                                            className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors"
                                                        >
                                                            {copied === key ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2 pt-1">
                                        <Button
                                            onClick={() => setStep('puk')}
                                            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
                                        >
                                            <KeyRound className="w-4 h-4" />
                                            I've Paid — Enter PUK Code
                                        </Button>
                                        <button
                                            onClick={() => setStep('main')}
                                            className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors py-1"
                                        >
                                            <ArrowLeft className="w-3 h-3" /> Back
                                        </button>
                                        <button
                                            onClick={onLogout}
                                            className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors pt-1"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'puk' && (
                                <motion.div
                                    key="puk"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center space-y-1">
                                        <h2 className="text-base font-bold text-zinc-900">Enter Your PUK Code</h2>
                                        <p className="text-xs text-zinc-500 leading-relaxed">
                                            Enter the PUK code sent to your phone number to reactivate your account.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-700">PUK Code</label>
                                        <Input
                                            value={puk}
                                            onChange={(e) => setPuk(e.target.value)}
                                            placeholder="Enter your PUK code"
                                            className="h-11 rounded-xl text-center tracking-widest font-mono text-base"
                                            onKeyDown={(e) => e.key === 'Enter' && handleUnblock()}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 pt-1">
                                        <Button
                                            onClick={handleUnblock}
                                            disabled={isUnblocking || !puk.trim()}
                                            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                        >
                                            {isUnblocking ? 'Reactivating…' : 'Reactivate Account'}
                                        </Button>
                                        <button
                                            onClick={() => setStep(accountDetail ? 'bank_details' : 'main')}
                                            className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors py-1"
                                        >
                                            <ArrowLeft className="w-3 h-3" /> Back
                                        </button>
                                        <button
                                            onClick={onLogout}
                                            className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors pt-1"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
