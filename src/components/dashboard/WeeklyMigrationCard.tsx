'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpCircle, CalendarDays } from 'lucide-react';

interface WeeklyMigrationCardProps {
    pendingCount?: number;
    weeklyExpected?: number;
}

export default function WeeklyMigrationCard({ pendingCount = 0, weeklyExpected = 0 }: WeeklyMigrationCardProps) {
    const weeklyPercent = weeklyExpected > 0 ? Math.min(Math.round((pendingCount / weeklyExpected) * 100), 100) : 0;

    return (
        <Card className="relative overflow-hidden transition-all duration-500 bg-white border-none shadow-sm rounded-3xl hover:shadow-xl group">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 -mb-8 -ml-8 rounded-full bg-orange-400/10 blur-2xl" />

            <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 text-amber-600 rounded-xl bg-amber-50">
                            <CalendarDays size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Weekly Migration</p>
                            <p className="text-sm font-bold text-zinc-900">Level 1 Queue</p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        weeklyPercent >= 100
                            ? 'bg-emerald-50 text-emerald-600'
                            : weeklyPercent >= 50
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-zinc-50 text-zinc-500'
                    }`}>
                        {weeklyPercent}% filled
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-amber-50">
                        <div className="flex items-center gap-1.5 mb-2">
                            <ArrowUpCircle size={13} className="text-amber-500" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-500">Pending</span>
                        </div>
                        <p className="text-3xl font-black tracking-tighter text-zinc-900">{pendingCount.toLocaleString()}</p>
                        <p className="text-[9px] text-zinc-400 font-medium mt-1">migrations queued</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50">
                        <div className="flex items-center gap-1.5 mb-2">
                            <CalendarDays size={13} className="text-indigo-500" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500">Expected</span>
                        </div>
                        <p className="text-3xl font-black tracking-tighter text-zinc-900">{weeklyExpected.toLocaleString()}</p>
                        <p className="text-[9px] text-zinc-400 font-medium mt-1">this week's target</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-zinc-400">
                        <span>Weekly Progress</span>
                        <span>{weeklyPercent}%</span>
                    </div>
                    <div className="relative w-full h-3 overflow-hidden rounded-full bg-zinc-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${weeklyPercent}%` }}
                            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                            className="absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-amber-500"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
