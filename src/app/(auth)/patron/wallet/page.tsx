'use client';

import { motion, Variants } from 'framer-motion';
import {
    ArrowUpRight,
    ArrowDownLeft,
    History,
    TrendingUp,
    Shield,
    Landmark,
    Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetPatronDashboardQuery } from '@/store/api/patronApi';
import { useGetWalletsQuery } from '@/store/api/walletApi';
import LoadingScreen from '@/components/LoadingScreen';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { WithdrawFundsModal } from '@/components/dashboard/patron/WithdrawFundsModal';
import { useRouter } from 'next/navigation';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export default function PatronWalletPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const { data: dashboardData, isLoading: isLoadingDashboard } = useGetPatronDashboardQuery({ page });
    const { data: walletsData, isLoading: isLoadingWallets } = useGetWalletsQuery();
    
    const patronData = dashboardData?.data;
    const wallets = walletsData?.data || [];

    if (isLoadingDashboard || isLoadingWallets) return <LoadingScreen />;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
                        <Shield size={12} className="fill-emerald-600/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Financial Treasury</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 leading-none">
                        Organization Wallet
                    </h1>
                    <p className="mt-2 text-zinc-400 font-medium text-sm">
                        Manage your organization&apos;s central funds and member distributions.
                    </p>
                </div>

            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Main Balance Card */}
                <Card className="col-span-1 md:col-span-2 bg-linear-to-br from-indigo-950 to-indigo-900 rounded-[2.5rem] p-8 border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Organization Balance</p>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mt-4 break-words">
                                ₦{(patronData?.patronGroup?.balance || 0).toLocaleString()}
                            </h2>
                            <div className="flex items-center gap-4 mt-8">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
                                    <TrendingUp size={14} className="text-emerald-400" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active</span>
                                </div>
                                <p className="text-xs font-medium text-white/40">Central treasury for distributions</p>
                            </div>
                        </div>
                        
                        <div className="bg-white/5 rounded-[2rem] p-6 backdrop-blur-sm border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Quick Stats</p>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-300 uppercase">Members</p>
                                    <p className="text-xl font-black text-white tracking-tight">{patronData?.meta?.totalMembers || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-300 uppercase">Beneficiaries</p>
                                    <p className="text-xl font-black text-white tracking-tight">{patronData?.meta?.totalBeneficiaries || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Quick Actions Card */}
                <div className="space-y-6">
                    {/* Withdraw Action */}
                    <Card 
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Landmark size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-zinc-900 uppercase tracking-tighter">Withdraw</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">To Bank Account</p>
                            </div>
                        </div>
                    </Card>

                    {/* Distribute Action */}
                    <Card 
                        onClick={() => router.push('/patron/organization')}
                        className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-zinc-900 uppercase tracking-tighter">Distribute</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">To Organization Members</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Transaction History */}
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black tracking-tighter text-zinc-900">Recent Transactions</h2>
                    <Button variant="ghost" className="text-xs font-bold text-indigo-600">View All</Button>
                </div>
                
                <Card className="border-none bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden">
                    <CardContent className="p-0">
                        {!patronData?.transactions || patronData.transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <History size={40} className="text-zinc-200 mb-4" />
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No transaction history</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-50">
                                {patronData?.transactions.map((tx) => (
                                    <div key={tx.id} className="p-6 hover:bg-zinc-50/50 transition-colors flex items-center gap-6">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center",
                                            tx.type === 'credit' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                        )}>
                                            {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest truncate">
                                                    {tx.description}
                                                </h4>
                                                <span className={cn(
                                                    "font-black text-lg tracking-tighter",
                                                    tx.type === 'credit' ? "text-emerald-600" : "text-rose-600"
                                                )}>
                                                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-bold text-zinc-400">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </span>
                                                <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                                    REF: {tx.reference?.slice(0, 12)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <WithdrawFundsModal 
                open={isWithdrawModalOpen} 
                onOpenChange={setIsWithdrawModalOpen}
                wallets={wallets}
            />
        </motion.div>
    );
}
