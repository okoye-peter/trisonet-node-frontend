'use client';

import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
    TrendingUp,
    Warehouse,
    Wallet,
    Database,
    Clock,
    Copy,
    QrCode,
    ExternalLink,
    Star,
    Award,
    ArrowUpRight,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Partner, Wallet as WalletType, DashboardStats } from '@/types';
import { MAX_ASSET_DEPOT } from '@/lib/constants';
import { Variants } from 'framer-motion';
import LoadingScreen from '@/components/LoadingScreen';
import { useMemo, useState } from 'react';
import QRCodeModal from '@/components/dashboard/QRCodeModal';


const partnerColumns: ColumnDef<Partner>[] = [
    {
        accessorKey: "name",
        header: "Partner Name",
        cell: ({ row }) => {
            const partner = row.original;
            const name = partner.name || 'Unknown';
            const email = partner.email || 'No email';
            return (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-zinc-200 to-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                        {name[0]}
                    </div>
                    <div>
                        <p className="font-bold text-zinc-900 leading-none">{name}</p>
                        <p className="text-xs text-zinc-400 mt-1">{email}</p>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            const email = row.original.email || 'No email';
            return <div className="lowercase">{email}</div>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const statusRaw = row.original.status;
            const status = statusRaw ? 'Active' : 'Pending';
            return (
                <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset",
                    status === 'Active'
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
                        : "bg-amber-50 text-amber-700 ring-amber-600/10"
                )}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", status === 'Active' ? "bg-emerald-500" : "bg-amber-500")} />
                    {status}
                </span>
            );
        },
    },
    {
        accessorKey: "activatedAt",
        header: "Verified Date",
        cell: ({ row }) => {
            const actAt = row.original.activatedAt;
            const formatted = actAt ? new Date(actAt).toLocaleDateString() : '-';
            return (
                <div className="flex items-center gap-2 text-zinc-500 font-medium whitespace-nowrap">
                    <Clock size={14} className="opacity-40" />
                    {formatted}
                </div>
            );
        },
    },
    {
        id: "badge",
        header: "Growth Tier",
        cell: ({ row }) => {
            const u = row.original;
            const badge = u.isUnitLeader ? 'Platinum' : (u.status ? 'Gold' : 'Silver');
            return (
                <span className="flex items-center gap-2 font-bold text-indigo-950 whitespace-nowrap">
                    <Award size={16} className={cn(
                        badge === 'Gold' ? "text-amber-400" : badge === 'Platinum' ? "text-indigo-400" : "text-zinc-400"
                    )} />
                    {badge} Tier
                </span>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: () => {
            return (
                <div className="text-right">
                    <Button 
                        variant="ghost" 
                        size="icon-sm"
                        className="p-2 rounded-xl text-zinc-300 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>
            );
        },
    },
];

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

export default function DashboardPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [qrCodeConfig, setQrCodeConfig] = useState<{ isOpen: boolean; url: string; title: string }>({
        isOpen: false,
        url: '',
        title: ''
    });

    const { data: dashboardStatsResponse, isLoading: dashboardStatsIsLoading } = useQuery<{ data: DashboardStats }>({
        queryKey: ['userDashboardStats', user?.id],
        queryFn: async () => {
            const res = await api.get('/users/dashboard-stats');
            return res.data;
        }
    })

    const dashboardStats = dashboardStatsResponse?.data;

    const stats = useMemo(() => [
        {
            label: 'Total Sales',
            value: dashboardStats?.totalSales ?? 0.00,
            prefix: '',
            icon: TrendingUp,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            glow: 'shadow-indigo-100',
            gradient: 'from-indigo-600/10 to-indigo-600/5'
        },
        {
            label: 'Asset Depot',
            value: dashboardStats?.assetDepot ?? 0.00,
            prefix: '',
            icon: Warehouse,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            glow: 'shadow-purple-100',
            gradient: 'from-purple-600/10 to-purple-600/5'
        },
        {
            label: 'Wallet',
            value: dashboardStats?.wallets?.find((wallet: WalletType) => wallet.type == 'direct')?.amount ?? 0.00,
            prefix: '₦',
            icon: Wallet,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            glow: 'shadow-emerald-100',
            gradient: 'from-emerald-600/10 to-emerald-600/5',
            hasAction: true
        },
        {
            label: 'Asset Treasury',
            value: dashboardStats ? ((
                (dashboardStats?.wallets?.find((wallet: WalletType) => wallet.type == 'indirect')?.amount ?? 1) - 1
            )) : 0,
            suffix: ' units',
            subValue: '0/0',
            icon: Database,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            glow: 'shadow-blue-100',
            gradient: 'from-blue-600/10 to-blue-600/5',
            hasAction: true
        },
    ], [dashboardStats]);

    const copyToClipboard = (text: string, type: 'adult' | 'infant') => {
        const url = window.location.origin + (type === 'adult' ? '/register?ref=' : 'infants/register?ref=') + text
        navigator.clipboard.writeText(url);
        toast.success('Copied to clipboard!');
    };

    if (dashboardStatsIsLoading) return <LoadingScreen />

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <div className="h-1 w-8 bg-indigo-600/20 rounded-full" />
                        Overview Dashboard
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 lg:text-5xl">
                        Welcome, <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">{user?.name?.split(' ')[0] || 'Member'}</span>
                    </h1>
                    <p className="mt-2 text-zinc-500 font-medium max-w-md">
                        Your financial summary is looking great today. You have <span className="text-indigo-600 font-bold underline decoration-indigo-200 underline-offset-4">0 unread notifications</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button size="lg" className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xl shadow-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Star className="mr-2 h-4 w-4 fill-amber-400 text-amber-400" /> Click Here to Buy PIM
                        <ArrowUpRight className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                    <Button 
                        variant="link"
                        size="icon-lg"
                        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-zinc-100 shadow-sm transition-all hover:border-indigo-100 hover:shadow-indigo-50"
                    >
                        <Award className="h-6 w-6 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white ring-4 ring-red-500/10" />
                    </Button>
                </div>
            </motion.div>

            {/* Main Stats Grid */}
            <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="group relative border-none bg-white p-1 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br", stat.gradient)} />
                        <CardContent className="relative z-10 p-4 bg-white rounded-xl h-full">
                            <div className="flex items-start justify-between">
                                <div className={cn("rounded-[1.2rem] p-4 shadow-sm transition-transform duration-500 group-hover:rotate-12", stat.bg, stat.color)}>
                                    <stat.icon size={28} strokeWidth={2.5} />
                                </div>
                                {stat.hasAction && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon-sm"
                                        className="p-2 rounded-xl bg-zinc-50 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-900 group/btn"
                                    >
                                        <ExternalLink size={14} className="group-hover/btn:scale-110 transition-transform" />
                                    </Button>
                                )}
                            </div>
                            <div className="mt-8">
                                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <div className="mt-3 flex items-baseline gap-1">
                                    {stat.prefix && <span className="text-xl font-bold text-zinc-400">{stat.prefix}</span>}
                                    <h3 className="text-3xl font-black tracking-tighter text-zinc-900">
                                        <CountUp end={stat.value} duration={2.5} separator="," decimals={stat.value % 1 !== 0 ? 2 : 0} />
                                    </h3>
                                    {stat.suffix && <span className="text-sm font-bold text-zinc-400 ml-1 uppercase">{stat.suffix}</span>}
                                </div>
                                {stat.subValue && <p className="text-[10px] font-bold text-zinc-300 mt-1.5 uppercase tracking-tighter">{stat.subValue}</p>}
                            </div>

                            {stat.label === 'Asset Depot' && (
                                <div className="mt-5 space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400">
                                        <span>Target Progress</span>
                                        <span>{Math.round(((MAX_ASSET_DEPOT - (dashboardStats?.assetDepot ?? 0)) / MAX_ASSET_DEPOT) * 100)}% Completed</span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-zinc-100 border border-zinc-200 p-0.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.round(((MAX_ASSET_DEPOT - (dashboardStats?.assetDepot ?? 0)) / MAX_ASSET_DEPOT) * 100)}%` }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                            className="h-full rounded-full bg-linear-to-r from-purple-400 via-purple-500 to-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Sub-actions Section */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Count Down */}
                <motion.div variants={itemVariants} className="relative group overflow-hidden rounded-xl p-1 bg-linear-to-br from-indigo-600 to-indigo-900 shadow-2xl shadow-indigo-200 transition-transform hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] transition-transform duration-1000 group-hover:scale-150" />
                    <Card className="border-none bg-transparent text-white p-8 h-full">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3.5 mb-8">
                                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                                    <Clock size={20} className="text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Global Countdown</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-none">
                                <CountUp end={dashboardStats ? (dashboardStats?.region.max - (dashboardStats?.regionTotalUsers ?? 0)) : 0} duration={3} separator="," decimals={2} />
                            </h2>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Distribution codes */}
                {[
                    { title: 'Personal Code', color: 'indigo', code: user?.username, type: 'adult' as const },
                    { title: 'Infant Reserve', color: 'purple', code: user?.username, type: 'infant' as const }
                ].map((item, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <Card className="group border-none bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn(
                                        "h-10 w-10 rounded-2xl flex items-center justify-center",
                                        item.color === 'indigo' ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"
                                    )}>
                                        <QrCode size={20} />
                                    </div>
                                    <div className="flex gap-2">
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">{item.title}</p>
                                <div className="flex items-center justify-between p-4 rounded-3xl bg-zinc-50/80 border border-zinc-100 group-hover:border-indigo-100 transition-colors">
                                    <span className="text-xl font-black text-zinc-900 tracking-tight">{item.code}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(item.code || '', item.type)}
                                        className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 shadow-sm border border-zinc-100 hover:bg-zinc-900 hover:text-white transition-all transform active:scale-95"
                                    >
                                        <Copy size={12} /> Copy
                                    </Button>
                                </div>
                                    <Button
                                        onClick={() => setQrCodeConfig({
                                            isOpen: true,
                                            url: window.location.origin + (item.type === 'adult' ? '/register?ref=' : 'infants/register?ref=') + item.code,
                                            title: item.title
                                        })}
                                        className="mt-6 w-full h-12 rounded-3xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Generate QR Code
                                    </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Partners Section Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter text-zinc-900">Recent Partners</h2>
                    <p className="text-sm font-medium text-zinc-400 mt-1">Monitor your network growth</p>
                </div>
            </motion.div>

            {/* Partners Table */}
            <motion.div variants={itemVariants} className="relative rounded-lg bg-white p-6 shadow-sm border border-zinc-100 overflow-hidden group hover:shadow-xl transition-all duration-700">
                <DataTable columns={partnerColumns} url="/users/referrals" searchKey="email" searchPlaceholder="Search partners by email..." />
            </motion.div>

            <QRCodeModal
                isOpen={qrCodeConfig.isOpen}
                onClose={() => setQrCodeConfig({ ...qrCodeConfig, isOpen: false })}
                url={qrCodeConfig.url}
                title={qrCodeConfig.title}
            />
        </motion.div>
    );
}
