'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { MAX_ASSET_DEPOT } from '@/lib/constants';

interface Level1StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalSales: number;
}

export default function Level1StatusModal({
    isOpen,
    onClose,
    totalSales,
}: Level1StatusModalProps) {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    // Progress Calculations
    const target = 10;
    const currentProgress = totalSales % target;
    const progressPercent = Math.min(Math.round((currentProgress / target) * 100), 100);
    const leftToTarget = target - currentProgress;

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
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                    />
                    
                    {/* Modal Wrapper */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full max-w-lg overflow-hidden bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center text-zinc-800 border border-zinc-100"
                        >
                            {/* Arrow Header Icon */}
                            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-50/80 mb-6 border border-blue-100/50 relative">
                                <div className="absolute inset-0 rounded-full bg-blue-100/40 animate-pulse" />
                                <Navigation size={36} className="text-blue-600 relative z-10 rotate-[25deg]" fill="currentColor" strokeWidth={2.5} />
                            </div>

                            {/* Section Category */}
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-2">
                                LEVEL 1 STATUS
                            </span>

                            <h2 className="text-5xl font-black tracking-tighter text-blue-600 mb-2">
                                        {leftToTarget} Left
                                    </h2>

                                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-8">
                                        PARTNERSHIPS NEEDED
                                    </span>

                                    {/* Custom Styled Progress Bar */}
                                    <div className="w-full max-w-sm mb-6">
                                        <div className="h-3.5 w-full rounded-full bg-zinc-100/80 border border-zinc-200/30 p-0.5 overflow-hidden mb-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                                                className="h-full rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                                            />
                                        </div>
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-zinc-400">
                                            <span className="text-blue-600">{progressPercent}% PROGRESS</span>
                                            <span>LVL 2 GOAL</span>
                                        </div>
                                    </div>

                                    {/* Description Quote */}
                                    <p className="text-xs text-zinc-400 italic leading-relaxed max-w-sm mb-10 font-medium">
                                        &quot;Every partnership brings you closer to Level 1 benefits.&quot;
                                    </p>

                                    {/* Continue Button */}
                                    <Button
                                        onClick={onClose}
                                        className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all hover:scale-[1.02]"
                                    >
                                        Continue Journey
                                    </Button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
