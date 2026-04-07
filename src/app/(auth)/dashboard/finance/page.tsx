'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowRightLeft, 
    ScrollText, 
    TrendingUp, 
    Receipt, 
    Wallet, 
    Briefcase,
    BadgeDollarSign,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import FinanceVideo from '@/components/dashboard/FinanceVideo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const financeModules = [
    { label: 'Transfers', href: '/wallets/transfers', icon: ArrowRightLeft, desc: 'Send and receive funds', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Transactions', href: '/transactions', icon: ScrollText, desc: 'View history & statements', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Earnings', href: '/earnings', icon: TrendingUp, desc: 'Track bonuses & revenue', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Wallet', href: '/wallets', icon: Wallet, desc: 'Manage your balances', color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Utility Bills', href: '/vtu', icon: Receipt, desc: 'Airtime, Data & Power', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Gkwth Business', href: '/wallets/gkwth', icon: Briefcase, desc: 'Enterprise solutions', color: 'text-rose-500', bg: 'bg-rose-50' },
];

export default function FinanceOverviewPage() {
    const [showVideo, setShowVideo] = useState(true);

    if (showVideo) {
        return <FinanceVideo onEnded={() => setShowVideo(false)} />;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 max-w-6xl mx-auto space-y-12 pb-20"
        >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3 text-indigo-600 font-black uppercase tracking-[0.25em] text-[10px]">
                        <div className="h-[2px] w-10 bg-indigo-600/30 rounded-full" />
                        Intelligence Ecosystem
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl">
                        Finance <span className="text-transparent bg-clip-text bg-linear-to-br from-indigo-600 to-violet-600">Overview</span>
                    </h1>
                    <p className="mt-4 text-zinc-500 font-medium max-w-md text-lg leading-relaxed antialiased">
                        Experience precision wealth management. Access all your growth modules from a single unified hub.
                    </p>
                </div>
                
                <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/20">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BadgeDollarSign size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Status</p>
                        <p className="text-sm font-bold text-zinc-900 leading-none">System Active</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6">
                {financeModules.map((module) => (
                    <Link key={module.label} href={module.href}>
                        <Card className="group relative border-none bg-white p-2 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between mb-10">
                                    <div className={cn(
                                        "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                                        module.bg, module.color
                                    )}>
                                        <module.icon size={32} />
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-zinc-900 mb-2">{module.label}</h3>
                                    <p className="text-sm font-medium text-zinc-400">{module.desc}</p>
                                </div>

                                {/* Animated background element */}
                                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-zinc-50 rounded-full blur-2xl group-hover:bg-indigo-50/50 transition-all duration-700" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Re-play Video Option */}
            <div className="flex justify-center pt-10">
                <Button 
                    variant="ghost"
                    onClick={() => setShowVideo(true)}
                    className="group rounded-2xl px-8 py-6 h-auto text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all gap-3"
                >
                    <Sparkles size={18} className="transition-transform group-hover:rotate-12" />
                    <span className="text-xs font-black uppercase tracking-widest leading-none">Re-play Experience Video</span>
                </Button>
            </div>
        </motion.div>
    );
}
