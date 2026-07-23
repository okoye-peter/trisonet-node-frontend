'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Download, Star, Tag, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { AuctionTransaction } from '@/types';
import { useSubmitReviewMutation } from '@/store/api/auctionApi';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatGkwth } from '@/lib/utils';

export function AuctionWonSummary({ transaction, newGkwthBalance }: { transaction: AuctionTransaction; newGkwthBalance: number | null }) {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitReview, { isLoading, isSuccess }] = useSubmitReviewMutation();

    const sellerName = transaction.auctionListing?.seller?.name || 'the seller';

    const handleSubmitReview = async () => {
        try {
            await submitReview({ id: transaction.auctionListingId, rating, comment: comment || undefined }).unwrap();
            toast.success('Thanks for your feedback!');
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Failed to submit rating');
        }
    };

    const timeline = [
        { icon: <Tag size={14} />, bg: 'bg-emerald-100', title: `You placed a bid of ${currency}${transaction.grossAmount.toLocaleString()}` },
        { icon: <CheckCircle2 size={14} />, bg: 'bg-indigo-100', title: `${sellerName} accepted your bid` },
        { icon: <Zap size={14} />, bg: 'bg-indigo-600 text-white', title: `${formatGkwth(transaction.gkwthAmount)} GKWTH credited to your wallet`, emphasize: true },
    ];

    return (
        <Card className="mt-8 gap-0 overflow-hidden py-0">
            <div className="p-6">
                <div className="mb-5 rounded-2xl bg-muted/40 p-5">
                    <div className="mb-3.5 flex items-center justify-between">
                        <div className="text-sm font-semibold text-foreground">Transfer Summary</div>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="print:hidden flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            <Download size={13} /> Download Receipt
                        </button>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <Row label="Transaction ID" value={`#${transaction.reference}`} mono />
                        <Row label="GKWTH Transferred" value={`${formatGkwth(transaction.gkwthAmount)} GKWTH → Your Wallet`} emphasize />
                        <Row label="Amount Paid" value={`${currency}${transaction.grossAmount.toLocaleString()}`} />
                        <Row label="Transaction Charges" value={`${currency}${transaction.platformFee.toLocaleString()}`} />
                        <Row label="Seller" value={sellerName} />
                        <Row label="Settled" value={format(new Date(transaction.createdAt), 'MMM d, h:mm a')} />
                        <div className="my-1 h-px bg-border" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-foreground">New GKWTH Balance</span>
                            <span className="text-lg font-black text-indigo-700">{newGkwthBalance !== null ? `${newGkwthBalance} GKWTH` : '—'}</span>
                        </div>
                    </div>
                </div>

                <div className="mb-5">
                    <div className="mb-3.5 text-sm font-semibold text-foreground">What Happened</div>
                    <div className="flex flex-col">
                        {timeline.map((step, index) => (
                            <div key={index} className="relative flex gap-3 pb-4 last:pb-0">
                                {index < timeline.length - 1 && <div className="absolute top-8 bottom-0 left-4 w-0.5 bg-indigo-200" />}
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${step.bg}`}>{step.icon}</div>
                                <div className={`text-sm ${step.emphasize ? 'font-bold text-indigo-700' : 'font-semibold text-foreground'}`}>{step.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 print:hidden">
                    <Button onClick={() => router.push('/wallets/gkwth/auction')} className="w-full bg-indigo-600 py-3 text-white hover:bg-indigo-700">
                        Browse More Auctions →
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/wallets/gkwth')} className="w-full border-indigo-600 py-3 text-indigo-600 hover:bg-indigo-50">
                        View in Wallet
                    </Button>
                </div>

                <div className="mt-5 rounded-xl border border-border p-4 text-center print:hidden">
                    <div className="mb-2 text-sm font-semibold text-foreground">Rate your experience with {sellerName}</div>
                    <div className="flex justify-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setRating(star)} disabled={isSuccess}>
                                <Star size={26} className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'} />
                            </button>
                        ))}
                    </div>
                    <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isSuccess}
                        placeholder="Leave a review (optional)…"
                        className="mt-2.5 w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-center text-sm outline-none focus:border-indigo-400 disabled:opacity-60"
                    />
                    <button
                        type="button"
                        onClick={handleSubmitReview}
                        disabled={isLoading || isSuccess}
                        className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-indigo-600 px-4 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 mx-auto"
                    >
                        <ShieldCheck size={12} /> {isSuccess ? 'Submitted' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        </Card>
    );
}

function Row({ label, value, mono, emphasize }: { label: string; value: string; mono?: boolean; emphasize?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm font-semibold ${emphasize ? 'font-bold text-indigo-700' : 'text-foreground'} ${mono ? 'font-mono' : ''}`}>{value}</span>
        </div>
    );
}
