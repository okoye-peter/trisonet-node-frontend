'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, ArrowUpCircle, CalendarDays } from 'lucide-react';

const NEW_REFERRAL_SYSTEM = {
    start_date: '2026-04-01',
    target: 10,
} as const;

interface Level1ProgressCardProps {
    totalSales: number;
    isPendingLevel2Migration?: boolean;
    pendingMigrationCount?: number;
    weeklyExpectedMigration?: number;
}

export default function Level1ProgressCard({
    totalSales,
    isPendingLevel2Migration,
    pendingMigrationCount,
    weeklyExpectedMigration,
}: Level1ProgressCardProps) {
    const { target } = NEW_REFERRAL_SYSTEM;

    const currentProgress = Math.min(totalSales, target);
    const progressPercent = Math.round((currentProgress / target) * 100);
    const leftToTarget = Math.max(target - totalSales, 0);

    const pending = pendingMigrationCount ?? 0;
    const weeklyTarget = weeklyExpectedMigration ?? 0;
    const weeklyPercent = weeklyTarget > 0 ? Math.min(Math.round((pending / weeklyTarget) * 100), 100) : 0;

    return (
        <Card className="relative overflow-hidden transition-all duration-500 bg-white border-none shadow-sm rounded-3xl hover:shadow-xl group">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 -mb-8 -ml-8 rounded-full bg-indigo-500/10 blur-2xl" />

            <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 text-blue-600 rounded-xl bg-blue-50">
                            <Target size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Level 1 Status</p>
                            {isPendingLevel2Migration && (
                                <h3 className="text-sm font-bold text-zinc-900">Migration in Queue</h3>
                            )}
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600">
                        Level 1
                    </span>
                </div>

                {/* Personal progress */}
                <div className="space-y-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-4xl font-black tracking-tighter text-zinc-900">{leftToTarget}</span>
                            <span className="ml-1 text-sm font-medium text-zinc-400">Left</span>
                        </div>
                        <p className="px-2 py-1 text-xs font-bold text-blue-600 rounded-lg bg-blue-50">
                            {progressPercent}% Complete
                        </p>
                    </div>

                    <div className="relative w-full h-3 overflow-hidden rounded-full bg-zinc-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600"
                        />
                    </div>

                    <p className="text-[10px] font-medium text-zinc-500 flex items-center gap-1.5">
                        <Users size={12} className="opacity-70" />
                        {isPendingLevel2Migration ? "Migration currently in queue..." : "Partnerships needed to activate Migration."}
                    </p>
                </div>

                {/* Weekly migration stats */}
                {(weeklyTarget > 0 || pending > 0) && (
                    <div className="mt-6 pt-5 border-t border-zinc-100 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
                            <CalendarDays size={12} />
                            Weekly Migration
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-2xl bg-amber-50">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <ArrowUpCircle size={12} className="text-amber-500" />
                                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-500">Pending</span>
                                </div>
                                <p className="text-2xl font-black tracking-tighter text-zinc-900">{pending.toLocaleString()}</p>
                                <p className="text-[9px] text-zinc-400 font-medium mt-0.5">migrations queued</p>
                            </div>

                            <div className="p-3 rounded-2xl bg-indigo-50">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <CalendarDays size={12} className="text-indigo-500" />
                                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500">Expected</span>
                                </div>
                                <p className="text-2xl font-black tracking-tighter text-zinc-900">{weeklyTarget.toLocaleString()}</p>
                                <p className="text-[9px] text-zinc-400 font-medium mt-0.5">this week's target</p>
                            </div>
                        </div>

                        {weeklyTarget > 0 && (
                            <>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-zinc-400">
                                    <span>Weekly Progress</span>
                                    <span>{weeklyPercent}%</span>
                                </div>
                                <div className="relative w-full h-2.5 overflow-hidden rounded-full bg-zinc-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${weeklyPercent}%` }}
                                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                        className="absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-amber-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
