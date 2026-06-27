'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, ArrowUpCircle, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MigrationQueueModalProps {
    isOpen: boolean;
    onClose: () => void;
    pendingCount: number;
    weeklyExpected: number;
}

export default function MigrationQueueModal({ isOpen, onClose, pendingCount, weeklyExpected }: MigrationQueueModalProps) {
    const remaining = Math.max(0, weeklyExpected - pendingCount);
    const fillPercent = weeklyExpected > 0 ? Math.min(Math.round((pendingCount / weeklyExpected) * 100), 100) : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl"
                    >
                        {/* Header */}
                        <div className="relative p-6 pb-8 overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600">
                            <div className="absolute top-0 right-0 w-40 h-40 -mt-12 -mr-12 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 rounded-full w-28 h-28 bg-white/10 blur-xl" />
                            <div className="relative flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center border w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border-white/30">
                                        <Users size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Live Update</p>
                                        <h2 className="text-2xl font-black leading-tight text-white">Migration Queue</h2>
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="relative mt-5 space-y-1.5">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/80">
                                    <span>Weekly Progress</span>
                                    <span>{fillPercent}% filled</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${fillPercent}%` }}
                                        transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-white/80"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {/* Pending */}
                                <div className="flex flex-col items-center justify-center p-4 text-center rounded-2xl bg-amber-50">
                                    <ArrowUpCircle size={16} className="mb-2 text-amber-500" />
                                    <p className="text-3xl font-black tracking-tighter text-zinc-900">{pendingCount.toLocaleString()}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1 leading-tight">In Queue</p>
                                </div>

                                {/* Expected */}
                                <div className="flex flex-col items-center justify-center p-4 text-center rounded-2xl bg-indigo-50">
                                    <CalendarDays size={16} className="mb-2 text-indigo-500" />
                                    <p className="text-3xl font-black tracking-tighter text-zinc-900">{weeklyExpected.toLocaleString()}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1 leading-tight">Weekly Target</p>
                                </div>

                                {/* Remaining */}
                                <div className={`flex flex-col items-center justify-center p-4 rounded-2xl text-center ${remaining === 0 ? 'bg-emerald-50' : 'bg-red-100 ring-2 ring-red-400 ring-offset-2 animate-pulse'}`}>
                                    <Target size={remaining === 0 ? 16 : 20} className={`mb-2 ${remaining === 0 ? 'text-emerald-500' : 'text-red-600 animate-bounce'}`} />
                                    <p className={`text-3xl font-black tracking-tighter ${remaining === 0 ? 'text-zinc-900' : 'text-red-700'}`}>{remaining.toLocaleString()}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 leading-tight ${remaining === 0 ? 'text-emerald-500' : 'text-red-600'}`}>
                                        Still Needed
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm font-semibold text-zinc-500 text-center leading-relaxed px-2">
                                {remaining === 0
                                    ? 'The weekly migration target has been reached. Migrations can proceed.'
                                    : `${remaining.toLocaleString()} more ${remaining === 1 ? 'person needs' : 'people need'} to queue before all pending migrations can be processed.`}
                            </p>

                            <Button
                                onClick={onClose}
                                className="w-full h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Got it
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
