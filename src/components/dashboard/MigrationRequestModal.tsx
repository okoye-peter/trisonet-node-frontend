'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';

interface MigrationRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MigrationRequestModal({ isOpen, onClose }: MigrationRequestModalProps) {
    const { user } = useAppSelector((state) => state.auth);
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
                    />
                    
                    {/* Modal Wrapper */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full max-w-lg overflow-hidden bg-[#162a35] border border-cyan-500/20 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center text-white"
                        >
                            {/* Blue/Cyan Glow Ring */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
                            
                            {/* Checkmark Circle */}
                            <div className="relative flex items-center justify-center w-24 h-24 mb-8 border rounded-full shadow-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/20 border-white/10">
                                <div className="absolute inset-0 rounded-full opacity-75 bg-cyan-400/20 animate-ping" />
                                <Check size={40} className="relative z-10 text-white" strokeWidth={3} />
                            </div>

                            {/* Headline */}
                            <h2 className="mb-4 text-2xl font-black tracking-tight text-white md:text-3xl">
                                🎉 Migration Request Received!
                            </h2>

                            {/* Subheadline */}
                            <p className="max-w-md mb-8 text-sm leading-relaxed md:text-base text-zinc-300">
                                Your <span className="font-extrabold text-cyan-400">Level 1 Migration</span> request has been <span className="font-extrabold text-emerald-400">successfully submitted</span> and is now under review.
                            </p>

                            {/* Inner Info Box */}
                            <div className="w-full bg-[#0d1f27] border border-cyan-500/10 rounded-3xl p-6 mb-8 text-left">
                                <p className="text-xs leading-relaxed md:text-sm text-zinc-300">
                                    Your account is currently <span className="font-extrabold text-amber-400">active</span> and fully accessible while we process your upgrade. You will be notified once your Level 1 account migration is complete.
                                </p>
                            </div>

                            {/* Greeting */}
                            <p className="mb-8 text-xs md:text-sm text-zinc-400">
                                Welcome back, <span className="font-bold text-white">{user?.name || 'Member'}</span> 👋
                            </p>

                            {/* Got It Button */}
                            <Button
                                onClick={onClose}
                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:scale-[1.02] hover:opacity-95 transition-all"
                            >
                                Got it — Take Me to My Dashboard
                            </Button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
