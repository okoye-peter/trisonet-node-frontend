'use client';

import Link from 'next/link';
import Marquee from 'react-fast-marquee';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useCurrencySymbol } from '@/hooks/useCurrencySymbol';

interface FeeTransaction {
    name: string;
    amount: number;
}

interface SchoolFeesMarqueeProps {
    transactions?: FeeTransaction[];
}

export default function SchoolFeesMarquee({ transactions = [] }: SchoolFeesMarqueeProps) {
    const currency = useCurrencySymbol();
    if (transactions.length === 0) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 shadow-lg border border-white/10 group">
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-zinc-900 to-transparent z-10" />

            <div className="absolute inset-y-0 left-0 bg-indigo-500/20 w-32 blur-2xl rounded-full -translate-x-1/2" />

            <div className="flex items-center">
                <div className="px-4 py-3 bg-zinc-900 border-r border-white/10 z-20 flex items-center gap-2 shrink-0">
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
                                    {currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </Marquee>

                <div className="pl-4 pr-4 py-2.5 bg-zinc-900 border-l border-white/10 z-20 flex items-center shrink-0">
                    <Link
                        href="/wallets/gkwth/auction"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-950 transition-all hover:bg-indigo-50"
                    >
                        View All
                        <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
