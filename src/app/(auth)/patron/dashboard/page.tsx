'use client';

import { useAppSelector } from '@/store/hooks';
import { motion, Variants } from 'framer-motion';
import CountUp from 'react-countup';
import {
    Users,
    UserPlus,
    Wallet,
    ArrowUpRight,
    Copy,
    CheckCircle2,
    Clock,
    LayoutGrid,
    History,
    CreditCard,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useGetPatronDashboardQuery, useGetPatronPlansQuery } from '@/store/api/patronApi';
import LoadingScreen from '@/components/LoadingScreen';
import { useMemo, useState } from 'react';
import type { PatronGroupTransaction } from '@/types';
import { CreateOrganizationForm } from '@/components/dashboard/patron/CreateOrganizationForm';
import { FundOrganizationModal } from '@/components/dashboard/patron/FundOrganizationModal';
import { ROLES } from '@/types';


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

export default function PatronDashboardPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [page, setPage] = useState(1);
    
    const { data: dashboardData, isLoading, refetch } = useGetPatronDashboardQuery({ page });
    const patronData = dashboardData?.data;

    const copyReferralLink = () => {
        const link = `${window.location.origin}/register?ref=${user?.username}`;
        navigator.clipboard.writeText(link);
        toast.success('Referral link copied to clipboard!');
    };

    const stats = useMemo(() => {
        if (!patronData) return [];
        
        const beneficiariesCount = (patronData.members || []).reduce((acc, m) => acc + m._count.patronees, 0);
        const patronBalance = patronData.patronGroup?.balance || 0;
        const patronageWalletBalance = user?.wallets?.find(w => w.type === 'patronage')?.amount || 0;

        const allStats = [
            {
                label: 'Total Beneficiaries',
                value: beneficiariesCount,
                icon: Users,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                gradient: 'from-indigo-600/10 to-indigo-600/5'
            },
            {
                label: 'Patron Members',
                value: patronData.meta?.members?.total || 0,
                icon: UserPlus,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                gradient: 'from-purple-600/10 to-purple-600/5'
            },
            {
                label: 'Patron Balance',
                value: patronBalance,
                prefix: '₦',
                icon: Wallet,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                gradient: 'from-emerald-600/10 to-emerald-600/5'
            },
            {
                label: 'Patronage Wallet',
                value: patronageWalletBalance,
                prefix: '₦',
                icon: CreditCard,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                gradient: 'from-blue-600/10 to-blue-600/5'
            }
        ];

        return patronData.patronGroup?.type === 'group' 
            ? allStats 
            : allStats.filter(s => s.label !== 'Patron Balance');
    }, [patronData, user]);

    const { data: plansResponse, isLoading: isLoadingPlans } = useGetPatronPlansQuery();
    const plans = plansResponse?.data || [];

    // Restrict group patrons who haven't created a group yet or haven't made the minimum deposit
    const isRestrictedGroupPatron = useMemo(() => {
        if (user?.role !== ROLES.PATRON || user?.pendingPatronType !== 'group') return false;
        
        // No group created yet
        if (!patronData?.patronGroup) return true;
        
        // Use isFunded flag from backend
        return !patronData.patronGroup.isFunded;
    }, [user, patronData]);

    if (isLoading || isLoadingPlans) return <LoadingScreen />;

    if (isRestrictedGroupPatron) {

        if (!patronData?.patronGroup) {
            return <CreateOrganizationForm onSuccess={() => refetch()} />;
        }
        
        return (
            <FundOrganizationModal 
                initialName={patronData.patronGroup.name || ''} 
                initialPlan={patronData.patronGroup.planName || 'Bronze'} 
                onSuccess={() => refetch()} 
            />
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            {/* Patron Welcome Hero */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950 p-8 lg:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Zap size={14} className="text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Patron Command Center</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tighter text-white leading-[1.1]">
                            Managing <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">{patronData?.patronGroup?.name || 'Organization'}</span>
                        </h1>
                        <p className="mt-4 text-white/50 font-medium text-lg leading-relaxed max-w-lg">
                            Welcome back, {user?.name.split(' ')[0]}. Your organization&lsquo;s financial ecosystem is thriving. Monitor members and manage distributions from here.
                        </p>
                    </div>

                    <Card className="border-none bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 w-full lg:w-96 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Distribution Code</p>
                            <div className="flex items-center gap-4 bg-white/10 p-2 pl-6 rounded-2xl border border-white/10 w-full">
                                <span className="text-xl font-black text-white tracking-tighter truncate flex-1 text-left">{user?.username}</span>
                                <Button 
                                    onClick={copyReferralLink}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 w-12 p-0 shadow-lg shadow-indigo-500/20 transition-transform active:scale-95"
                                >
                                    <Copy size={20} />
                                </Button>
                            </div>
                            <p className="mt-4 text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                                Share this code to recruit new patrons into your organization
                            </p>
                        </div>
                    </Card>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="group relative border-none bg-white p-1 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br", stat.gradient)} />
                        <CardContent className="relative z-10 p-6 bg-white rounded-[1.4rem] h-full">
                            <div className="flex items-start justify-between">
                                <div className={cn("rounded-2xl p-4 shadow-sm transition-transform duration-500 group-hover:rotate-12", stat.bg, stat.color)}>
                                    <stat.icon size={24} strokeWidth={2.5} />
                                </div>
                                <div className="p-2 rounded-xl bg-zinc-50 text-zinc-300">
                                    <ArrowUpRight size={16} />
                                </div>
                            </div>
                            <div className="mt-8">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <div className="mt-3 flex items-baseline gap-1">
                                    {stat.prefix && <span className="text-lg font-bold text-zinc-400">{stat.prefix}</span>}
                                    <h3 className="text-3xl font-black tracking-tighter text-zinc-900">
                                        <CountUp end={stat.value} duration={2} separator="," decimals={stat.value % 1 !== 0 ? 2 : 0} />
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid gap-10">
                {/* Transactions Section */}
                {patronData?.patronGroup?.type === 'group' && (
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="px-2">
                            <h2 className="text-3xl font-black tracking-tighter text-zinc-900">Activity Log</h2>
                            <p className="text-sm font-medium text-zinc-400 mt-1">Recent organization transactions</p>
                        </div>
                        
                        <Card className="border-none bg-white rounded-[2rem] shadow-sm border border-zinc-100 h-full overflow-hidden flex flex-col">
                            <CardContent className="p-0">
                                {(patronData?.transactions || []).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-20 text-center">
                                        <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-200 mb-4">
                                            <History size={32} />
                                        </div>
                                        <p className="font-bold text-zinc-400 text-sm uppercase tracking-widest">No activity yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-zinc-50">
                                        {(patronData?.transactions || []).slice(0, 6).map((tx) => (
                                            <div key={tx.id} className="p-6 hover:bg-zinc-50/50 transition-colors group cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                        tx.type === 'credit' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                    )}>
                                                        <Clock size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest truncate">
                                                                {tx.type === 'credit' ? 'Organization Funding' : 'Member Distribution'}
                                                            </h4>
                                                            <span className={cn(
                                                                "font-black text-sm tracking-tighter",
                                                                tx.type === 'credit' ? "text-emerald-600" : "text-rose-600"
                                                            )}>
                                                                {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-400 mt-1 font-bold line-clamp-1">{tx.description}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">
                                                                {new Date(tx.createdAt).toLocaleDateString()}
                                                            </span>
                                                            <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">
                                                                REF: {tx.reference?.slice(0, 10)}...
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            {patronData && (patronData.transactions || []).length > 6 && (
                                <div className="mt-auto p-4 bg-zinc-50/50 border-t border-zinc-100">
                                    <Button variant="ghost" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-600">
                                        View Full History <ArrowUpRight size={14} className="ml-2" />
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
