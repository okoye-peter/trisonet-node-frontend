'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, KeyRound, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSelector } from '@/store/hooks';
import { useSendEmailVerificationOtpMutation, useVerifyEmailOtpMutation } from '@/store/api/userApi';

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    isMandatory?: boolean;
    onLogout?: () => void;
}

export default function EmailVerificationModal({ 
    isOpen, 
    onClose, 
    onSuccess, 
    isMandatory = false, 
    onLogout 
}: EmailVerificationModalProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [email, setEmail] = useState(user?.email || '');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<1 | 2>(1);
    const [mounted, setMounted] = useState(false);

    const [sendEmailVerificationOtp, { isLoading: isSendingOtp }] = useSendEmailVerificationOtpMutation();
    const [verifyEmailOtp, { isLoading: isVerifyingOtp }] = useVerifyEmailOtpMutation();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Email is required');
            return;
        }

        try {
            await sendEmailVerificationOtp({ email }).unwrap();
            toast.success('Verification code sent successfully!');
            setStep(2);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to send verification code');
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) {
            toast.error('OTP is required');
            return;
        }

        try {
            await verifyEmailOtp({ otp }).unwrap();
            toast.success('Email verified successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Invalid or expired OTP');
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />
                    
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-full max-w-lg p-6 overflow-hidden border shadow-2xl bg-white/80 border-white/20 rounded-3xl md:p-8 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 text-blue-600 rounded-xl bg-blue-50">
                                        {step === 1 ? <Mail size={20} /> : <KeyRound size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Step {step} of 2</p>
                                        <h3 className="text-sm font-bold text-zinc-955">
                                            {step === 1 ? 'Verify Your Email' : 'Enter Verification Code'}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 transition-colors text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-50"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {step === 1 ? (
                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Email Address</label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            className="px-4 text-sm font-medium h-14 rounded-2xl border-zinc-200 focus-visible:ring-indigo-500/20"
                                            required
                                        />
                                        <p className="text-[10px] font-medium text-zinc-400 leading-relaxed">
                                            We'll send an OTP to this email to verify your identity and secure your account.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        {isMandatory && onLogout && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={onClose}
                                                disabled={isSendingOtp}
                                                className="flex-1 h-14 rounded-2xl border-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-zinc-50"
                                            >
                                                Close
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={isSendingOtp || !email}
                                            className="flex-2 h-14 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 disabled:opacity-50"
                                        >
                                            {isSendingOtp ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                'Send Code'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Verification Code</label>
                                        <Input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter the 6-digit code"
                                            className="px-4 font-mono text-sm font-medium tracking-widest text-center h-14 rounded-2xl border-zinc-200 focus-visible:ring-indigo-500/20"
                                            maxLength={6}
                                            required
                                        />
                                        <div className="flex justify-between items-center text-[10px] font-medium text-zinc-400">
                                            <span>Sent to {email}</span>
                                            <button 
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="font-bold text-blue-600 hover:underline"
                                            >
                                                Edit Email
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            disabled={isVerifyingOtp}
                                            className="flex-1 h-14 rounded-2xl border-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-zinc-50"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isVerifyingOtp || otp.length !== 6}
                                            className="flex-2 h-14 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 disabled:opacity-50"
                                        >
                                            {isVerifyingOtp ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                'Verify Email'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
