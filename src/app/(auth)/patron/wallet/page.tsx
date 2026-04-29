'use client';

import { motion, Variants } from 'framer-motion';
import {
    ArrowUpRight,
    TrendingUp,
    Shield,
    Landmark,
    Users,
    Wallet,
    Info,
    Lock,
    Unlock,
    Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetWalletsQuery } from '@/store/api/walletApi';
import LoadingScreen from '@/components/LoadingScreen';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { WithdrawFundsModal } from '@/components/dashboard/patron/WithdrawFundsModal';
import { PagaFundingModal } from '@/components/dashboard/patron/PagaFundingModal';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

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
    const { user } = useAppSelector((state) => state.auth);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
    const { data: walletsData, isLoading: isLoadingWallets } = useGetWalletsQuery();

    const wallets = walletsData?.data || [];

    const isTopLevel = user && !user.patronId;
    const isMember = user && user.patronId;

    if (isLoadingWallets) return <LoadingScreen />;

    // For members, we show their direct wallet and the patronage wallet of the patron they are under
    const directWallet = wallets.find(w => w.type === 'direct' && !w.isParentWallet);
    const patronageWallet = wallets.find(w => w.isParentWallet) || wallets.find(w => w.type === 'patronage');
    const isParentPatronage = patronageWallet && patronageWallet.isParentWallet;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                        <Wallet size={12} className="fill-indigo-600/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Patron Treasury</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 leading-none">
                        Wallet Management
                    </h1>
                    <p className="mt-2 text-zinc-400 font-medium text-sm">
                        Monitor your earnings and manage your sponsorship funds.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Direct Wallet Card */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-xl relative overflow-hidden h-full flex flex-col">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 mb-4">
                                    <Unlock size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Withdrawable</span>
                                </div>
                                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Direct Wallet</h3>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Earnings & Commissions</p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        <div className="mt-auto">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Available Balance</p>
                            <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tighter mt-2">
                                ₦{(directWallet?.amount || 0).toLocaleString()}
                            </h2>

                            <div className="mt-8 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                <div className="flex gap-3">
                                    <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                                        Your primary earnings wallet. All recruitment commissions and network incentives are paid here. You can withdraw these funds to your bank at any time.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsWithdrawModalOpen(true)}
                                className="w-full mt-6 h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ArrowUpRight size={18} className="mr-2" /> Withdraw Earnings
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Patronage Wallet Card */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-zinc-900 rounded-[2.5rem] p-8 border-none shadow-2xl relative overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl" />

                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/60 mb-4">
                                    {isTopLevel ? <Unlock size={12} /> : <Lock size={12} />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {isTopLevel ? "Treasury Fund" : "Parent Treasury"}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Patronage Wallet</h3>
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Sponsorship & Growth</p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                                <Shield size={24} />
                            </div>
                        </div>

                        <div className="mt-auto relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                {isParentPatronage ? "Available to Organization" : "Reserved Sponsorship Funds"}
                            </p>
                            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mt-2">
                                ₦{(patronageWallet?.amount || 0).toLocaleString()}
                            </h2>

                            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex gap-3">
                                    <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-white/60 leading-relaxed">
                                        {isParentPatronage
                                            ? "This is the patronage treasury of your organization leader. It is used to fund network growth and member activations."
                                            : "Reserved for member activations and network growth. Funds here can be used to sponsor new members. You can withdraw these funds or add more."}
                                    </p>
                                </div>
                            </div>

                            {isTopLevel ? (
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    {patronageWallet?.userId?.toString() === user?.id?.toString() && (
                                        <Button
                                            onClick={() => setIsFundingModalOpen(true)}
                                            className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest transition-all"
                                        >
                                            <Plus size={18} className="mr-2" /> Fund
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    onClick={() => router.push('/patron/members')}
                                    className="w-full mt-6 h-14 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-black uppercase tracking-widest transition-all"
                                >
                                    <Users size={18} className="mr-2" /> View Organization
                                </Button>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>



            <WithdrawFundsModal
                open={isWithdrawModalOpen}
                onOpenChange={setIsWithdrawModalOpen}
                wallets={wallets.filter(w => !w.isParentWallet && (isTopLevel || w.type === 'direct'))}
            />

            <PagaFundingModal
                open={isFundingModalOpen}
                onOpenChange={setIsFundingModalOpen}
            />
        </motion.div>
    );
}
