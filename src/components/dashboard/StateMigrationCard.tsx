'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Crown, MapPin, Target, UserCheck, Users } from 'lucide-react';
import type { StateMigrationProgress } from '@/types';

interface StateMigrationCardProps {
    progress?: StateMigrationProgress;
}

export const formatWeekRange = (progress: StateMigrationProgress) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', timeZone: 'Africa/Lagos' };
    const start = new Date(progress.weekStartsAt);
    // weekEndsAt is the next Wednesday 00:00 - show the last day of the week (Tuesday)
    const lastDay = new Date(new Date(progress.weekEndsAt).getTime() - 1);
    return `${start.toLocaleDateString('en-GB', options)} – ${lastDay.toLocaleDateString('en-GB', options)}`;
};

// Only partners with a state see this - existing accounts without one are not asked to pick it.
export default function StateMigrationCard({ progress }: StateMigrationCardProps) {
    if (!progress?.state) return null;
    const state = progress.state;

    const target = progress.weeklyTarget ?? 0;
    const gotten = progress.registeredCount ?? 0;
    const remaining = progress.remaining ?? 0;
    const percent = target > 0 ? Math.min(Math.round((gotten / target) * 100), 100) : 0;
    const aboveTarget = Math.max(0, gotten - target);

    return (
        <Card className="relative overflow-hidden transition-all duration-500 bg-white border-none shadow-sm rounded-3xl hover:shadow-xl group">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 -mb-8 -ml-8 rounded-full bg-teal-400/10 blur-2xl" />

            <CardContent className="relative p-6">
                <div className="flex items-start justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-12 h-12 shrink-0 text-emerald-600 rounded-2xl bg-emerald-50">
                            <MapPin size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">State Weekly Target</p>
                            <p className="text-base font-black truncate text-zinc-900">
                                {state.name}
                            </p>
                            <p className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
                                <CalendarDays size={12} /> {formatWeekRange(progress)}
                            </p>
                        </div>
                    </div>
                    {target > 0 && (
                        <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider ${
                            progress.targetReached
                                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                                : percent >= 50
                                    ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                                    : 'bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200'
                        }`}>
                            {progress.targetReached ? 'Target hit' : `${percent}%`}
                        </span>
                    )}
                </div>

                <>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="p-4 rounded-2xl bg-indigo-50">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Target size={14} className="text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Target</span>
                                </div>
                                <p className="text-3xl font-black tracking-tighter text-zinc-900">{target > 0 ? target.toLocaleString() : '—'}</p>
                                <p className="text-[10px] text-zinc-400 font-semibold mt-1">this week</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-50">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <UserCheck size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Gotten</span>
                                </div>
                                <p className="text-3xl font-black tracking-tighter text-zinc-900">{gotten.toLocaleString()}</p>
                                <p className="text-[10px] text-zinc-400 font-semibold mt-1">registered</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Users size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Left</span>
                                </div>
                                <p className="text-3xl font-black tracking-tighter text-zinc-900">{target > 0 ? remaining.toLocaleString() : '—'}</p>
                                <p className="text-[10px] text-zinc-400 font-semibold mt-1">to target</p>
                            </div>
                        </div>

                        {target > 0 ? (
                            <div className="space-y-1.5">
                                <div className="w-full h-2.5 overflow-hidden rounded-full bg-zinc-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${progress.targetReached ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    />
                                </div>
                                <p className="text-[11px] font-semibold text-zinc-500">
                                    {progress.targetReached
                                        ? aboveTarget > 0
                                            ? `Target reached with ${aboveTarget.toLocaleString()} extra - keep registering!`
                                            : 'Target reached - keep registering!'
                                        : `${remaining.toLocaleString()} more registration${remaining === 1 ? '' : 's'} needed to hit ${state.name}'s target.`}
                                </p>
                            </div>
                        ) : (
                            <p className="text-[11px] font-semibold text-zinc-500">No target has been set for {state.name} this week.</p>
                        )}

                        {progress.isLeader && (
                            <div className="flex items-start gap-2 p-3 mt-4 rounded-2xl bg-amber-50 ring-1 ring-amber-200">
                                <Crown size={16} className="mt-0.5 shrink-0 text-amber-500" />
                                <p className="text-xs font-semibold text-amber-700">
                                    You are the {state.name} State Leader.
                                    {progress.leaderCommission
                                        ? ` Hit or pass the target this week to earn ₦${progress.leaderCommission.toLocaleString()} in your commission wallet.`
                                        : ' Hit or pass the target this week to earn your leader commission.'}
                                </p>
                            </div>
                        )}
                        {!progress.isLeader && progress.leaderName && (
                            <p className="mt-4 text-[11px] font-semibold text-zinc-400">State Leader: <span className="text-zinc-600">{progress.leaderName}</span></p>
                        )}
                </>
            </CardContent>
        </Card>
    );
}
