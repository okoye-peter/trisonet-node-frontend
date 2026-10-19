'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, History, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGetCommissionWalletHistoryQuery, type CommissionHistoryEntry } from '@/store/api/walletApi';

interface CommissionHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const STATUS_LABELS: Record<CommissionHistoryEntry['status'], { label: string; className: string }> = {
    success: { label: 'Received', className: 'bg-emerald-50 text-emerald-600' },
    processed: { label: 'Paid out', className: 'bg-emerald-50 text-emerald-600' },
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-600' },
    being_processed: { label: 'Processing', className: 'bg-amber-50 text-amber-600' },
    failed: { label: 'Failed', className: 'bg-red-50 text-red-600' },
};

export default function CommissionHistoryDialog({ open, onOpenChange }: CommissionHistoryDialogProps) {
    const [page, setPage] = useState(1);
    const { data, isFetching } = useGetCommissionWalletHistoryQuery({ page, limit: 10 }, { skip: !open });

    const entries = data?.data?.data ?? [];
    const meta = data?.data?.meta;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-black">
                        <History size={20} className="text-indigo-600" /> Commission History
                    </DialogTitle>
                    <DialogDescription>Commissions paid into your commission wallet and withdrawals from it.</DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto -mx-2 px-2">
                    {isFetching && entries.length === 0 ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
                    ) : entries.length === 0 ? (
                        <p className="py-12 text-sm font-semibold text-center text-zinc-400">No commission activity yet.</p>
                    ) : (
                        <ul className={cn('divide-y divide-zinc-100', isFetching && 'opacity-60')}>
                            {entries.map((entry) => {
                                const isCredit = entry.direction === 'credit';
                                const status = STATUS_LABELS[entry.status] ?? STATUS_LABELS.pending;
                                return (
                                    <li key={entry.id} className="flex items-start gap-3 py-3">
                                        <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-600')}>
                                            {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate text-zinc-900">{entry.description}</p>
                                            {entry.details && <p className="text-xs text-zinc-500">{entry.details}</p>}
                                            <p className="text-[11px] font-semibold text-zinc-400">
                                                {new Date(entry.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                {entry.reference ? ` · ${entry.reference}` : ''}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={cn('text-sm font-black', isCredit ? 'text-emerald-600' : 'text-zinc-900')}>
                                                {isCredit ? '+' : '-'}₦{entry.amount.toLocaleString()}
                                            </p>
                                            <span className={cn('inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider', status.className)}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                        <span className="text-xs font-semibold text-zinc-400">Page {meta.currentPage} of {meta.totalPages}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl" disabled={!meta.hasPreviousPage || isFetching} onClick={() => setPage((p) => p - 1)}>
                                <ChevronLeft size={16} />
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl" disabled={!meta.hasNextPage || isFetching} onClick={() => setPage((p) => p + 1)}>
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
