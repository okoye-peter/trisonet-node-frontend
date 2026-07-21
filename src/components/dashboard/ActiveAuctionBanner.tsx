'use client';

import Link from 'next/link';
import Marquee from 'react-fast-marquee';
import { Gavel, ArrowRight } from 'lucide-react';
import { useGetAuctionsQuery } from '@/store/api/auctionApi';
import { useAppSelector } from '@/store/hooks';
import { formatGkwth } from '@/lib/utils';

function formatTimeLeft(endsAt: string) {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

export default function ActiveAuctionBanner() {
    const { user } = useAppSelector((state) => state.auth);
    const { data } = useGetAuctionsQuery({ status: 'active', limit: 8 }, { skip: !user?.canAccessAuction });
    const auctions = data?.data?.data || [];

    if (auctions.length === 0) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 shadow-lg border border-white/10 group">
            <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-zinc-900 to-transparent z-10" />

            <div className="absolute inset-y-0 left-0 bg-indigo-500/20 w-32 blur-2xl rounded-full -translate-x-1/2" />

            <div className="flex items-center">
                <div className="px-4 py-3 bg-zinc-900 border-r border-white/10 z-20 flex items-center gap-2 shrink-0">
                    <Gavel size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 whitespace-nowrap">
                        Active Auctions
                    </span>
                </div>

                <Marquee
                    gradient={false}
                    speed={40}
                    pauseOnHover={true}
                    className="py-3"
                >
                    <div className="flex items-center gap-8 px-8">
                        {auctions.map((auction) => (
                            <div key={auction.id} className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{formatGkwth(auction.gkwthAmount)} GKWTH</span>
                                <div className="w-1 h-1 rounded-full bg-zinc-600" />
                                <span className="text-xs font-black text-emerald-400">
                                    ₦{auction.currentTopBid.toLocaleString()}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-zinc-600" />
                                <span className="text-xs font-bold text-amber-400">{formatTimeLeft(auction.endsAt)}</span>
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
