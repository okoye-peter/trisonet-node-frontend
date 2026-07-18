'use client';

import { useState } from 'react';

interface AuctionPreviewSidebarProps {
    gkwthAmount: number;
    startingBid: number;
    durationHours: number;
    commissionPercent?: number;
    isSubmitting?: boolean;
    onLaunch: () => void;
}

const DURATION_LABELS: Record<number, string> = { 6: '6 Hours', 24: '24 Hours', 72: '3 Days', 168: '7 Days' };

export function AuctionPreviewSidebar({ gkwthAmount, startingBid, durationHours, commissionPercent = 0.5, isSubmitting, onLaunch }: AuctionPreviewSidebarProps) {
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const perGkwth = gkwthAmount > 0 ? startingBid / gkwthAmount : 0;
    const platformFee = startingBid * (commissionPercent / 100);
    const youReceive = startingBid - platformFee;

    const rows: [string, string][] = [
        ['GKWTH Amount', `${gkwthAmount || 0} GKWTH`],
        ['Starting Bid', `${currency}${(startingBid || 0).toLocaleString()}`],
        ['Per GKWTH', `≈ ${currency}${perGkwth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
        ['Duration', DURATION_LABELS[durationHours] || '—'],
        ['Platform Fee', `${commissionPercent}% on sale`],
    ];

    return (
        <div className="sticky top-[72px] overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div className="text-sm font-bold text-zinc-900">Auction Preview</div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" /> Live preview
                </span>
            </div>

            <div className="relative overflow-hidden bg-linear-to-br from-indigo-950 to-indigo-800 p-6">
                <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />
                <div className="relative z-10 text-4xl font-black text-white">{gkwthAmount || 0} GKWTH</div>
                <div className="relative z-10 mb-4 text-xs font-bold uppercase tracking-wide text-indigo-300">GKWTH for sale</div>
                <div className="relative z-10 flex flex-wrap gap-1.5">
                    <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80">Starting: {currency}{(startingBid || 0).toLocaleString()}</span>
                    <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80">{DURATION_LABELS[durationHours] || '—'} Auction</span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex flex-col gap-3">
                    {rows.map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">{label}</span>
                            <span className="text-sm font-bold text-zinc-900">{value}</span>
                        </div>
                    ))}
                    <div className="h-px bg-zinc-100" />
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-900">You Receive (min)</span>
                        <span className="text-base font-black text-indigo-700">{currency}{youReceive.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>

                <div className="mt-5 flex gap-2 rounded-xl bg-amber-100 p-3">
                    <span className="text-base">⚠️</span>
                    <p className="text-xs leading-relaxed text-amber-900">
                        GKWTH will be locked from your wallet while the auction is live and released back if no bid is accepted.
                    </p>
                </div>

                <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs leading-relaxed text-zinc-600">
                        I understand that once a bid is accepted on this auction, <strong className="text-zinc-900">it cannot be reversed</strong>, and a <strong className="text-zinc-900">{commissionPercent}% platform fee</strong> will be deducted from my proceeds.
                    </span>
                </label>

                <button
                    type="button"
                    onClick={onLaunch}
                    disabled={isSubmitting || !gkwthAmount || !startingBid || !agreedToTerms}
                    className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                    🚀 {isSubmitting ? 'Launching…' : 'Launch Auction'}
                </button>
            </div>
        </div>
    );
}
