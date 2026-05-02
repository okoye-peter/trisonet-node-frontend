'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
    ArrowLeft, 
    ArrowUpRight, 
    ArrowDownLeft, 
    History, 
    Filter,
    Calendar,
    Search,
    CreditCard,
    Landmark,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGetPatronTransactionsQuery } from '@/store/api/patronApi';
import LoadingScreen from '@/components/LoadingScreen';
import Link from 'next/link';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export default function PatronTransactionsPage() {
    const [page, setPage] = useState(1);
    
    const { data: transactionsData, isLoading } = useGetPatronTransactionsQuery({ page, limit: 10 });
    const transactions = transactionsData?.data?.transactions || [];
    const meta = transactionsData?.data?.meta;

    if (isLoading) return <LoadingScreen />;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-6xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <Link href="/patron/wallet" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-4 group">
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Wallet</span>
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-zinc-900 leading-none">
                        Withdrawal History
                    </h1>
                    <p className="mt-2 text-zinc-400 font-medium text-sm">
                        Detailed log of all your withdrawals to bank accounts.
                    </p>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                {transactions.length === 0 ? (
                    <Card className="border-none bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-zinc-50">
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-20 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-200 mb-6">
                                <History size={40} />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight">No withdrawals found</h3>
                            <p className="text-zinc-400 text-sm font-medium mt-2">Your withdrawal history will appear here once you initiate a transfer.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {transactions.map((tx) => (
                            <motion.div key={tx.id} variants={itemVariants}>
                                <Card className="group border-none bg-white hover:bg-zinc-50/50 transition-all duration-300 rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            {/* Icon */}
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-rose-50 text-rose-600">
                                                <Landmark size={24} />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                    <div>
                                                        <h4 className="text-sm font-black text-zinc-900 truncate tracking-tight">
                                                            {tx.description}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-baseline gap-1 text-right">
                                                        <span className="text-lg font-black tracking-tighter text-rose-600">
                                                            -₦{tx.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                                        <Clock size={12} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                            {new Date(tx.createdAt).toLocaleDateString(undefined, { 
                                                                day: 'numeric', 
                                                                month: 'short', 
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                                        <Search size={12} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                            REF: {tx.reference || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                                                        <div className={cn(
                                                            "h-1.5 w-1.5 rounded-full",
                                                            tx.status === 'success' ? "bg-emerald-500" : 
                                                            tx.status === 'pending' ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                                                        )} />
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest",
                                                            tx.status === 'success' ? "text-emerald-600" : 
                                                            tx.status === 'pending' ? "text-amber-600" : "text-rose-600"
                                                        )}>
                                                            {tx.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="h-12 w-12 rounded-2xl border-zinc-200 text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-900">{page}</span>
                        <span className="text-xs font-bold text-zinc-300">of</span>
                        <span className="text-xs font-black text-zinc-400">{meta.totalPages}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === meta.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="h-12 w-12 rounded-2xl border-zinc-200 text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                    >
                        <ChevronRight size={20} />
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
