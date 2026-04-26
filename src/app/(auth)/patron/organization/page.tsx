'use client';

import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Building2,
    Users,
    Globe,
    ArrowUpRight,
    UserPlus,
    History,
    Mail,
    Phone,
    User,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetPatronDashboardQuery } from '@/store/api/patronApi';
import LoadingScreen from '@/components/LoadingScreen';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import type { User as UserType, PatronGroupTransaction } from '@/types';

import { AddMemberModal } from '@/components/dashboard/patron/AddMemberModal';
import { CreditMemberModal } from '@/components/dashboard/patron/CreditMemberModal';

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

const memberColumns: ColumnDef<UserType & { _count: { patronees: number } }>[] = [
    {
        accessorKey: "name",
        header: "Member Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-[10px] shadow-lg shadow-indigo-100">
                    {row.original.name[0]}
                </div>
                <div>
                    <p className="font-bold text-zinc-900 text-xs leading-none">{row.original.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">{row.original.email}</p>
                </div>
            </div>
        ),
    },
    {
        id: "beneficiaries",
        header: "Beneficiaries",
        cell: ({ row }) => (
            <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
                {row.original._count.patronees} Slots
            </span>
        )
    },
    {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => (
            <span className="text-[10px] text-zinc-500">
                {new Date(row.original.createdAt).toLocaleDateString()}
            </span>
        )
    }
];

export default function PatronOrganizationPage() {
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<'members' | 'transactions'>('members');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

    const { data: dashboardData, isLoading } = useGetPatronDashboardQuery({ page });
    
    const patronGroup = dashboardData?.data?.patronGroup;
    const meta = dashboardData?.data?.meta;
    const members = dashboardData?.data?.members || [];
    const transactions = dashboardData?.data?.transactions || [];

    const stats = useMemo(() => [
        { 
            label: 'Organization Wallet', 
            value: `₦${(meta?.walletBalance || 0).toLocaleString()}`, 
            icon: Wallet,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        { 
            label: 'Patron Members', 
            value: meta?.totalMembers || 0, 
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        { 
            label: 'Total Beneficiaries', 
            value: meta?.totalBeneficiaries || 0, 
            icon: ShieldCheck,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        { 
            label: 'Total Strength', 
            value: (meta?.totalMembers || 0) + (meta?.totalBeneficiaries || 0), 
            icon: TrendingUp,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
    ], [meta]);

    if (isLoading) return <LoadingScreen />;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                        <Building2 size={12} className="fill-indigo-600/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Organizational Hub</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 leading-none">
                        {patronGroup?.name || 'Organization Profile'}
                    </h1>
                    <p className="mt-3 text-zinc-400 font-medium text-sm">
                        Central command for your organization's members, finances, and growth.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-zinc-200 hover:bg-zinc-50 h-14 px-8 font-black text-xs uppercase tracking-widest transition-all">
                        Edit Profile
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                    <motion.div key={idx} variants={itemVariants}>
                        <Card className="border-none bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                    <stat.icon size={20} />
                                </div>
                                <ArrowUpRight size={16} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{stat.label}</p>
                            <h3 className="text-2xl font-black text-zinc-900 tracking-tighter mt-1">{stat.value}</h3>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-10 lg:grid-cols-3">
                {/* Details & Leader Info */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div variants={itemVariants}>
                        <Card className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
                            <div className="grid gap-10 md:grid-cols-2">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-black tracking-tight text-zinc-900 flex items-center gap-2">
                                        <Briefcase className="text-indigo-600" size={18} /> Organization Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">Reference Number</p>
                                            <p className="text-sm font-bold text-zinc-700 mt-1">{patronGroup?.refNo}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">Established Date</p>
                                            <p className="text-sm font-bold text-zinc-700 mt-1">
                                                {patronGroup?.createdAt ? new Date(patronGroup.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                <Shield size={12} />
                                                <span className="text-[9px] font-black uppercase">Verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                                <Globe size={12} />
                                                <span className="text-[9px] font-black uppercase">Public Entity</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 md:border-l md:border-zinc-50 md:pl-10">
                                    <h3 className="text-lg font-black tracking-tight text-zinc-900 flex items-center gap-2">
                                        <User className="text-indigo-600" size={18} /> Organization Leader
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">Full Name</p>
                                                <p className="text-sm font-bold text-zinc-900 leading-none mt-1">{patronGroup?.owner?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                                <Mail size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">Email Address</p>
                                                <p className="text-sm font-bold text-zinc-600 mt-1">{patronGroup?.owner?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                                <Phone size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">Contact Phone</p>
                                                <p className="text-sm font-bold text-zinc-600 mt-1">{patronGroup?.owner?.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Data Explorer */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => setActiveTab('members')}
                                    className={cn(
                                        "text-xl font-black tracking-tighter transition-all relative pb-2",
                                        activeTab === 'members' ? "text-zinc-900" : "text-zinc-300 hover:text-zinc-400"
                                    )}
                                >
                                    Patron Members
                                    {activeTab === 'members' && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />
                                    )}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('transactions')}
                                    className={cn(
                                        "text-xl font-black tracking-tighter transition-all relative pb-2",
                                        activeTab === 'transactions' ? "text-zinc-900" : "text-zinc-300 hover:text-zinc-400"
                                    )}
                                >
                                    Recent Activity
                                    {activeTab === 'transactions' && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-zinc-100 overflow-hidden">
                            {activeTab === 'members' ? (
                                <DataTable 
                                    columns={memberColumns} 
                                    data={members} 
                                    searchKey="name"
                                    searchPlaceholder="Filter members..."
                                />
                            ) : (
                                <div className="space-y-4">
                                    {transactions.length === 0 ? (
                                        <div className="py-10 text-center text-zinc-400 text-sm font-bold uppercase tracking-widest">No activity log found</div>
                                    ) : (
                                        transactions.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center",
                                                        tx.type === 'credit' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                    )}>
                                                        <History size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-zinc-900 uppercase tracking-widest">{tx.description || (tx.type === 'credit' ? 'Funding' : 'Distribution')}</p>
                                                        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className={cn("text-sm font-black tracking-tighter", tx.type === 'credit' ? "text-emerald-600" : "text-rose-600")}>
                                                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <Card className="bg-indigo-950 rounded-[2.5rem] p-8 border-none shadow-2xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl transition-transform group-hover:scale-110" />
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter leading-tight">Quick Actions</h3>
                                    <p className="mt-2 text-sm font-medium text-indigo-200/60 leading-snug">
                                        Manage your organization's financial flow and growth.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Button 
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-950/20 transition-all active:scale-95"
                                    >
                                        <UserPlus size={18} className="mr-3" /> Create New Patron
                                    </Button>
                                    <Button 
                                        onClick={() => setIsCreditModalOpen(true)}
                                        className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-950/20 transition-all active:scale-95"
                                    >
                                        <TrendingUp size={18} className="mr-3" /> Credit Patron Member
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-zinc-900 tracking-tight">Security & Compliance</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Fully Verified</p>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                Your organization is operating under the standard patronage agreement. All transactions are logged and encrypted.
                            </p>
                            <Button variant="ghost" className="w-full mt-6 h-12 rounded-xl text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-50">
                                View Agreement <ChevronRight size={14} className="ml-1" />
                            </Button>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            
            <AddMemberModal 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen} 
            />

            <CreditMemberModal 
                open={isCreditModalOpen} 
                onOpenChange={setIsCreditModalOpen}
                currentBalance={meta?.walletBalance || 0}
            />
        </motion.div>
    );
}
