'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
    TrendingUp, 
    ArrowRightLeft, 
    Wallet, 
    History,
    Search,
    Clock,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGetPatronEarningsQuery } from '@/store/api/patronApi';
import LoadingScreen from '@/components/LoadingScreen';
import ConvertEarningsModal from '@/components/dashboard/patron/ConvertEarningsModal';

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

export default function PatronEarningsPage() {
    const [page, setPage] = useState(1);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    
    const { data: earningsData, isLoading } = useGetPatronEarningsQuery({ page });
    
    if (isLoading) return <LoadingScreen />;

    const { 
        assetBalance, 
        gkwthBalance, 
        conversionRate, 
        maxConvertibleAmount,
        nextAllowedConversionDate,
        transactions, 
        meta 
    } = earningsData?.data || {
        assetBalance: 0,
        gkwthBalance: 0,
        conversionRate: 1,
        maxConvertibleAmount: 0,
        nextAllowedConversionDate: null,
        transactions: [],
        meta: { total: 0, page: 1, totalPages: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-6xl mx-auto"
        >
            {/* ... header ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-zinc-900 leading-none">
                        Earnings & Assets
                    </h1>
                    <p className="mt-2 text-zinc-400 font-medium text-sm">
                        Manage your asset accumulation and convert them to GKWTH.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <Button 
                        onClick={() => setIsConvertModalOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-95"
                    >
                        <ArrowRightLeft size={16} className="mr-3" /> Convert Assets
                    </Button>
                    {nextAllowedConversionDate && new Date(nextAllowedConversionDate) > new Date() && (
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2">
                            Next: {new Date(nextAllowedConversionDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {/* ... rest of the content ... */}
            {/* Balance Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Asset Wallet */}
                <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden border-none bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 p-8 h-full">
                        <div className="absolute top-0 right-0 p-8 text-zinc-50 group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp size={120} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-200">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900 tracking-tight">Asset Wallet</h3>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Earnings Wallet</p>
                                </div>
                            </div>
                            
                            <div className="mt-auto">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Total Assets Accumulated</p>
                                <h2 className="text-5xl font-black text-zinc-900 tracking-tighter mt-2">
                                    {assetBalance.toLocaleString()}
                                </h2>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs font-bold text-zinc-400">1 GKWTH = {conversionRate} Asset</p>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                        Limit: {maxConvertibleAmount.toLocaleString()} (50%)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* GKWTH Wallet */}
                <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden border-none bg-zinc-900 rounded-[2.5rem] shadow-xl p-8 h-full text-white">
                        <div className="absolute top-0 right-0 p-8 text-white/[0.03]">
                            <Wallet size={120} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                                    <Wallet size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">GKWTH Balance</h3>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Indirect Wallet</p>
                                </div>
                            </div>
                            
                            <div className="mt-auto">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Available GKWTH</p>
                                <h2 className="text-5xl font-black tracking-tighter mt-2">
                                    {gkwthBalance.toLocaleString()}
                                </h2>
                                <div className="mt-6 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ready for Withdrawal</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Transaction History */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                        <History size={20} className="text-zinc-400" /> Earning History
                    </h3>
                </div>

                <div className="space-y-3">
                    {transactions.length === 0 ? (
                        <Card className="border-none bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-zinc-50">
                            <div className="flex flex-col items-center">
                                <div className="h-20 w-20 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-200 mb-6">
                                    <TrendingUp size={40} />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">No earnings yet</h3>
                                <p className="text-zinc-400 text-sm font-medium mt-2">Your accumulation history will appear here.</p>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid gap-3">
                            {transactions.map((tx: any) => (
                                <motion.div key={tx.id} variants={itemVariants}>
                                    <Card className="group border-none bg-white hover:bg-zinc-50/50 transition-all duration-300 rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex items-center gap-4 sm:gap-6">
                                                {/* Icon */}
                                                <div className={cn(
                                                    "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                                    tx.type === 'credit' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                )}>
                                                    {tx.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                        <h4 className="text-sm font-black text-zinc-900 truncate tracking-tight">
                                                            {tx.narration}
                                                        </h4>
                                                        <div className="flex items-baseline gap-1 text-right">
                                                            <span className={cn(
                                                                "text-lg font-black tracking-tighter",
                                                                tx.type === 'credit' ? "text-emerald-600" : "text-rose-600"
                                                            )}>
                                                                {tx.type === 'credit' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] font-black uppercase text-zinc-400">Assets</span>
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
            </div>

            <ConvertEarningsModal
                open={isConvertModalOpen}
                onOpenChange={setIsConvertModalOpen}
                maxAmount={maxConvertibleAmount}
                conversionRate={conversionRate}
                nextAllowedDate={nextAllowedConversionDate}
            />
        </motion.div>
    );
}
