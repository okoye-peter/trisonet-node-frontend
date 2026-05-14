'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSendEmailVerificationOtpMutation, useVerifyEmailOtpMutation } from '@/store/api/userApi';

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentEmail?: string;
}

type Step = 'email' | 'otp';

export default function EmailVerificationModal({ isOpen, onClose, currentEmail }: EmailVerificationModalProps) {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState(currentEmail || '');
    const [otp, setOtp] = useState('');

    const [sendOtp, { isLoading: isSending }] = useSendEmailVerificationOtpMutation();
    const [verifyOtp, { isLoading: isVerifying }] = useVerifyEmailOtpMutation();

    const resetAndClose = () => {
        setStep('email');
        setEmail(currentEmail || '');
        setOtp('');
        onClose();
    };

    const handleSendOtp = async () => {
        if (!email.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        try {
            await sendOtp({ email: email.trim() }).unwrap();
            toast.success('Verification code sent to your email');
            setStep('otp');
        } catch (err) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || 'Failed to send verification code');
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        try {
            await verifyOtp({ otp }).unwrap();
            toast.success('Email verified successfully!');
            resetAndClose();
        } catch (err) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || 'Invalid or expired code');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-[2.5rem]"
                >
                    {/* Header */}
                    <div className="relative h-28 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-[-20%] left-[-10%] w-56 h-56 bg-white rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-[-20%] right-[-10%] w-56 h-56 bg-amber-300 rounded-full blur-3xl" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
                                {step === 'email' ? <Mail className="h-6 w-6 text-white" /> : <ShieldCheck className="h-6 w-6 text-white" />}
                            </div>
                            <h2 className="text-white font-black tracking-tight text-base">
                                {step === 'email' ? 'Verify Your Email' : 'Enter Verification Code'}
                            </h2>
                        </div>
                        <button
                            onClick={resetAndClose}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                        >
                            <X size={16} className="text-white" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        {step === 'email' ? (
                            <>
                                <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                                    Enter or confirm your email address. We'll send a 6-digit verification code to it.
                                </p>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                                        className="h-12 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl text-zinc-900 font-medium"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={resetAndClose}
                                        className="flex-1 h-12 border-zinc-200 text-zinc-500 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSendOtp}
                                        disabled={isSending}
                                        className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black disabled:opacity-50"
                                    >
                                        {isSending ? 'Sending...' : 'Send Code'}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center space-y-1">
                                    <p className="text-sm text-zinc-500 font-medium">
                                        We sent a 6-digit code to
                                    </p>
                                    <p className="text-sm font-black text-zinc-900">{email}</p>
                                    <p className="text-xs text-zinc-400">Code expires in 10 minutes</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Verification Code</label>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                                        className="h-14 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl text-center text-2xl font-black tracking-[0.5em] text-zinc-900"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => { setStep('email'); setOtp(''); }}
                                        className="flex-1 h-12 border-zinc-200 text-zinc-500 rounded-xl font-bold"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleVerify}
                                        disabled={isVerifying || otp.length !== 6}
                                        className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black disabled:opacity-50"
                                    >
                                        {isVerifying ? 'Verifying...' : 'Verify Email'}
                                    </Button>
                                </div>

                                <p className="text-center text-xs text-zinc-400">
                                    Didn't receive it?{' '}
                                    <button
                                        onClick={() => { setStep('email'); setOtp(''); }}
                                        className="font-bold text-amber-600 hover:text-amber-700 underline underline-offset-2"
                                    >
                                        Resend code
                                    </button>
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
