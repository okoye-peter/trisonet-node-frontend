'use client';

import Marquee from 'react-fast-marquee';
import { Sparkles } from 'lucide-react';

interface FeeTransaction {
    name: string;
    amount: number;
}

interface SchoolFeesMarqueeProps {
    transactions?: FeeTransaction[];
}

export default function SchoolFeesMarquee({ transactions = [] }: SchoolFeesMarqueeProps) {
    if (transactions.length === 0) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 shadow-lg border border-white/10 group">
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-zinc-900 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-zinc-900 to-transparent z-10" />
            
            <div className="absolute inset-y-0 left-0 bg-indigo-500/20 w-32 blur-2xl rounded-full -translate-x-1/2" />

            <div className="flex items-center">
                <div className="px-4 py-3 bg-zinc-900 border-r border-white/10 z-20 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 whitespace-nowrap">
                        Recent Activity
                    </span>
                </div>
                
                <Marquee
                    gradient={false}
                    speed={40}
                    pauseOnHover={true}
                    className="py-3"
                >
                    <div className="flex items-center gap-8 px-8">
                        {transactions.map((tx, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{tx.name}</span>
                                <div className="w-1 h-1 rounded-full bg-zinc-600" />
                                <span className="text-xs font-black text-emerald-400">
                                    ₦{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </Marquee>
            </div>
        </div>
    );
}
