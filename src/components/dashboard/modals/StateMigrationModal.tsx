'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Target, UserCheck, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StateMigrationProgress } from '@/types';
import { formatWeekRange } from '@/components/dashboard/StateMigrationCard';

interface StateMigrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    progress?: StateMigrationProgress;
}

// Replaces MigrationQueueModal: shows this week's target for the user's own state.
export default function StateMigrationModal({ isOpen, onClose, progress }: StateMigrationModalProps) {
    const state = progress?.state;
    const target = progress?.weeklyTarget ?? 0;
    const gotten = progress?.registeredCount ?? 0;
    const remaining = progress?.remaining ?? 0;
    const percent = target > 0 ? Math.min(Math.round((gotten / target) * 100), 100) : 0;

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Portal to body: the dashboard wraps modals in a transformed motion.div, which would
    // otherwise make `fixed` resolve against that wrapper instead of the viewport.
    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && progress && state && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl"
                    >
                        <div className="relative p-6 pb-8 overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600">
                            <div className="absolute top-0 right-0 w-40 h-40 -mt-12 -mr-12 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 rounded-full w-28 h-28 bg-white/10 blur-xl" />
                            <div className="relative flex items-center gap-3">
                                <div className="flex items-center justify-center border w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border-white/30">
                                    <MapPin size={22} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">This Week · {formatWeekRange(progress)}</p>
                                    <h2 className="text-2xl font-black leading-tight text-white truncate">{state.name} Target</h2>
                                </div>
                            </div>

                            {target > 0 && (
                                <div className="relative mt-5 space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/80">
                                        <span>Weekly Progress</span>
                                        <span>{progress.targetReached ? 'Target hit' : `${percent}%`}</span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
                                            className="h-full rounded-full bg-white/80"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center justify-center p-4 text-center rounded-2xl bg-indigo-50">
                                    <Target size={16} className="mb-2 text-indigo-500" />
                                    <p className="text-3xl font-black tracking-tighter text-zinc-900">{target > 0 ? target.toLocaleString() : '—'}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1 leading-tight">Target</p>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4 text-center rounded-2xl bg-emerald-50">
                                    <UserCheck size={16} className="mb-2 text-emerald-500" />
                                    <p className="text-3xl font-black tracking-tighter text-zinc-900">{gotten.toLocaleString()}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1 leading-tight">Gotten</p>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4 text-center rounded-2xl bg-amber-50">
                                    <Users size={16} className="mb-2 text-amber-500" />
                                    <p className="text-3xl font-black tracking-tighter text-zinc-900">{target > 0 ? remaining.toLocaleString() : '—'}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1 leading-tight">Left</p>
                                </div>
                            </div>

                            <p className="text-sm leading-relaxed text-center text-zinc-500">
                                {target === 0
                                    ? `No target has been set for ${state.name} this week.`
                                    : progress.targetReached
                                        ? `${state.name} has hit this week's target. Keep registering - there's no limit!`
                                        : `${state.name} needs ${remaining.toLocaleString()} more registration${remaining === 1 ? '' : 's'} to hit this week's target.`}
                            </p>

                            {progress.isLeader && (
                                <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 ring-1 ring-amber-200">
                                    <Crown size={16} className="mt-0.5 shrink-0 text-amber-500" />
                                    <p className="text-xs font-semibold text-amber-700">
                                        You are the {state.name} State Leader.
                                        {progress.leaderCommission
                                            ? ` Hit or pass the target to earn ₦${progress.leaderCommission.toLocaleString()}.`
                                            : ' Hit or pass the target to earn your leader commission.'}
                                    </p>
                                </div>
                            )}

                            <Button
                                onClick={onClose}
                                className="w-full h-12 text-xs font-black tracking-wider text-white uppercase rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                            >
                                Got it
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
