'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, Users } from 'lucide-react';
import { MAX_ASSET_DEPOT } from '@/lib/constants';

interface Level1ProgressCardProps {
    totalSales: number;
    assetDepotTarget?: number;
}

export default function Level1ProgressCard({ totalSales, assetDepotTarget = MAX_ASSET_DEPOT }: Level1ProgressCardProps) {
    // Current progress: how many they have vs target
    const currentProgress = totalSales % assetDepotTarget;
    const progressPercent = Math.min(Math.round((currentProgress / assetDepotTarget) * 100), 100);
    const leftToTarget = assetDepotTarget - currentProgress;

    return (
        <Card className="relative overflow-hidden border-none bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 group">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mt-10 -mr-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mb-8 -ml-8" />
            
            <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Target size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Level 1 Status</p>
                            <h3 className="text-sm font-bold text-zinc-900">Migration Progress</h3>
                        </div>
                    </div>
                    
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600">
                        Level 1
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-4xl font-black tracking-tighter text-zinc-900">{leftToTarget}</span>
                            <span className="text-sm font-medium text-zinc-400 ml-1">Left</span>
                        </div>
                        <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            {progressPercent}% Complete
                        </p>
                    </div>

                    <div className="h-3 w-full rounded-full bg-zinc-100 overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600"
                        />
                    </div>
                    
                    <p className="text-[10px] font-medium text-zinc-500 flex items-center gap-1.5">
                        <Users size={12} className="opacity-70" />
                        Partnerships needed to activate Level 2
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
