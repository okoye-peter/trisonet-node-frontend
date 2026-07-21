'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Star, Tag, ShieldCheck, Wallet, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { AuctionTransaction } from '@/types';
import { useSubmitReviewMutation } from '@/store/api/auctionApi';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        { icon: <Wallet size={14} />, bg: 'bg-emerald-100', title: `${currency}${transaction.grossAmount.toLocaleString()} debited from your wallet` },
        { icon: <Zap size={14} />, bg: 'bg-indigo-600 text-white', title: `${transaction.gkwthAmount} GKWTH credited to your wallet`, emphasize: true },
    ];

    return (
        <Card className="mt-8 gap-0 overflow-hidden py-0">
            <div className="relative overflow-hidden rounded-t-xl bg-linear-to-br from-indigo-950 to-slate-900 px-8 py-12 text-center">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.3),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.2),transparent_40%)]" />
                <div className="relative z-10">
                    <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                        <div className="absolute -inset-2 animate-[spin_10s_linear_infinite] rounded-full border-2 border-dashed border-emerald-400" />
                        <CheckCircle2 size={48} className="text-emerald-500" strokeWidth={2.5} />
                    </div>
                    <div className="mb-2.5 text-xs font-bold uppercase tracking-wide text-emerald-400">🎉 Bid Accepted!</div>
                    <h2 className="mb-1.5 text-3xl font-black text-white">You Won the Auction!</h2>
                    <p className="text-sm text-white/50">Your bid was accepted by {sellerName}.</p>

                    <div className="mt-7 flex justify-center gap-8">
                        <div>
                            <div className="text-3xl font-black text-white">{transaction.gkwthAmount}</div>
                            <div className="text-xs font-bold tracking-wide text-indigo-300">GKWTH RECEIVED</div>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div>
                            <div className="text-3xl font-black text-white">{currency}{(transaction.grossAmount / 1000).toFixed(0)}k</div>
                            <div className="text-xs font-bold tracking-wide text-indigo-300">PAID</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-5 rounded-2xl bg-muted/40 p-5">
                    <div className="mb-3.5 text-sm font-semibold text-foreground">Transfer Summary</div>
                    <div className="flex flex-col gap-2.5">
                        <Row label="Transaction ID" value={`#${transaction.reference}`} mono />
                        <Row label="GKWTH Transferred" value={`${transaction.gkwthAmount} GKWTH → Your Wallet`} emphasize />
                        <Row label="Amount Paid" value={`${currency}${transaction.grossAmount.toLocaleString()}`} />
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

                <div className="flex flex-col gap-2.5">
                    <Button onClick={() => router.push('/wallets/gkwth/auction')} className="w-full bg-indigo-600 py-3 text-white hover:bg-indigo-700">
                        Browse More Auctions →
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/wallets/gkwth')} className="w-full border-indigo-600 py-3 text-indigo-600 hover:bg-indigo-50">
                        View in Wallet
                    </Button>
                </div>

                <div className="mt-5 rounded-xl border border-border p-4 text-center">
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
