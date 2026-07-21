'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AuctionPreviewSidebarProps {
    gkwthAmount: number;
    startingBid: number;
    durationHours: number;
    commissionPercent?: number;
    isSubmitting?: boolean;
    onLaunch: () => void;
}

const DURATION_LABELS: Record<number, string> = { 6: '6 Hours', 24: '24 Hours', 72: '3 Days', 168: '7 Days' };

function formatDuration(hours: number): string {
    if (!hours) return '—';
    if (DURATION_LABELS[hours]) return DURATION_LABELS[hours];
    if (hours < 24) return `${hours} Hour${hours === 1 ? '' : 's'}`;
    if (hours % 24 === 0) return `${hours / 24} Days`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function AuctionPreviewSidebar({ gkwthAmount, startingBid, durationHours, commissionPercent = 0.5, isSubmitting, onLaunch }: AuctionPreviewSidebarProps) {
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const perGkwth = gkwthAmount > 0 ? startingBid / gkwthAmount : 0;
    const platformFee = startingBid * (commissionPercent / 100);
    const youReceive = startingBid - platformFee;
    const durationLabel = formatDuration(durationHours);

    const rows: [string, string][] = [
        ['GKWTH Amount', `${gkwthAmount || 0} GKWTH`],
        ['Starting Bid', `${currency}${(startingBid || 0).toLocaleString()}`],
        ['Per GKWTH', `≈ ${currency}${perGkwth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
        ['Duration', durationLabel],
        ['Platform Fee', `${commissionPercent}% on sale`],
    ];

    return (
        <Card className="sticky top-18 gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="text-sm font-semibold text-foreground">Auction Preview</div>
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
                    <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80">{durationLabel} Auction</span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex flex-col gap-3">
                    {rows.map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{label}</span>
                            <span className="text-sm font-bold text-foreground">{value}</span>
                        </div>
                    ))}
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">You Receive (min)</span>
                        <span className="text-base font-black text-indigo-700">{currency}{youReceive.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>

                <div className="mt-5 flex gap-2 rounded-xl bg-amber-100 p-3">
                    <span className="text-base">⚠️</span>
                    <p className="text-xs leading-relaxed text-amber-900">
                        GKWTH will be locked from your wallet while the auction is live and released back if no bid is accepted.
                    </p>
                </div>

                <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 p-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs leading-relaxed text-muted-foreground">
                        I understand that once a bid is accepted on this auction, <strong className="text-foreground">it cannot be reversed</strong>, and a <strong className="text-foreground">{commissionPercent}% platform fee</strong> will be deducted from my proceeds.
                    </span>
                </label>

                <Button
                    type="button"
                    onClick={onLaunch}
                    disabled={isSubmitting || !gkwthAmount || !startingBid || !agreedToTerms}
                    className="mt-4 w-full bg-indigo-600 py-3 text-white hover:bg-indigo-700"
                >
                    🚀 {isSubmitting ? 'Launching…' : 'Launch Auction'}
                </Button>
            </div>
        </Card>
    );
}
