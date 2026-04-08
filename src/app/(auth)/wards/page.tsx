'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import CountUp from 'react-countup';
import {
    Users,
    CreditCard,
    Zap,
    TrendingUp,
    ShieldCheck,
    Clock,
    UserCircle,
    Mail,
    Phone
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Ward, WardStats } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import { SlotPurchaseModal } from '@/components/wards/SlotPurchaseModal';

const wardColumns: ColumnDef<Ward>[] = [
    {
        accessorKey: "name",
        header: "Ward Name",
        cell: ({ row }) => {
            const ward = row.original;
            const name = ward.name || 'Unknown';
            const username = ward.username || 'No username';
            return (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-indigo-200 to-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                        {name[0]}
                    </div>
                    <div>
                        <p className="font-bold text-zinc-900 leading-none">{name}</p>
                        <p className="text-xs text-zinc-400 mt-1">@{username}</p>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="lowercase flex items-center gap-2"><Mail size={12} className="opacity-40" /> {row.original.email}</div>,
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => <div className="flex items-center gap-2"><Phone size={12} className="opacity-40" /> {row.original.phone || '-'}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset",
                    status
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
                        : "bg-zinc-50 text-zinc-600 ring-zinc-600/10"
                )}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", status ? "bg-emerald-500" : "bg-zinc-400")} />
                    {status ? 'Active' : 'Inactive'}
                </span>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Joined Date",
        cell: ({ row }) => {
            const date = row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-';
            return (
                <div className="flex items-center gap-2 text-zinc-500 font-medium whitespace-nowrap">
                    <Clock size={14} className="opacity-40" />
                    {date}
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

export default function WardsPage() {
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    const { data: statsResponse, isLoading: statsLoading } = useQuery<{ data: WardStats }>({
        queryKey: ['wardStats'],
        queryFn: async () => {
            const res = await api.get('/users/wards-stats');
            return res.data;
        }
    });

    const stats = statsResponse?.data;

    const statsCards = [
        {
            label: 'Remaining Slots',
            value: stats?.wardSlotRemaining === 'unlimited' ? 999 : (stats?.wardSlotRemaining ?? 0),
            isUnlimited: stats?.wardSlotRemaining === 'unlimited',
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            gradient: 'from-indigo-600/10 to-indigo-600/5'
        },
        {
            label: 'Price Per Slot',
            value: stats?.pricePerSlot ?? 0,
            prefix: '₦',
            icon: CreditCard,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            gradient: 'from-emerald-600/10 to-emerald-600/5'
        },
        {
            label: 'Unlimited Price',
            value: stats?.unlimitedSlotPrice ?? 0,
            prefix: '₦',
            icon: Zap,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            gradient: 'from-amber-600/10 to-amber-600/5'
        }
    ];

    if (statsLoading) return <LoadingScreen />;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <div className="h-1 w-8 bg-indigo-600/20 rounded-full" />
                        Guardian Management
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 lg:text-5xl">
                        My <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">Wards</span>
                    </h1>
                    <p className="mt-2 text-zinc-500 font-medium max-w-md">
                        Manage and monitor your registered wards. You can purchase more slots to add more wards to your account.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsPurchaseModalOpen(true)}
                        variant="outline" 
                        className="h-14 px-6 rounded-2xl border-indigo-100 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 font-bold transition-all"
                    >
                        <Zap className="mr-2 h-4 w-4" /> Buy More Slots
                    </Button>
                    {/* <Button size="lg" className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xl shadow-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Plus className="mr-2 h-4 w-4" /> Add New Ward
                    </Button> */}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {statsCards.map((stat, i) => (
                    <Card key={i} className="group relative border-none bg-white p-1 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br", stat.gradient)} />
                        <CardContent className="relative z-10 p-6 bg-white rounded-xl h-full">
                            <div className="flex items-start justify-between">
                                <div className={cn("rounded-2xl p-4 shadow-sm transition-transform duration-500 group-hover:rotate-12", stat.bg, stat.color)}>
                                    <stat.icon size={24} strokeWidth={2.5} />
                                </div>
                                <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center">
                                    <TrendingUp size={14} className="text-zinc-300" />
                                </div>
                            </div>
                            <div className="mt-8">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <div className="mt-3 flex items-baseline gap-1">
                                    {stat.prefix && <span className="text-xl font-bold text-zinc-400">{stat.prefix}</span>}
                                    <h3 className="text-3xl font-black tracking-tighter text-zinc-900">
                                        {stat.isUnlimited ? (
                                            <span className="flex items-center gap-2">
                                                <ShieldCheck className="text-indigo-600" size={32} />
                                                Unlimited
                                            </span>
                                        ) : (
                                            <CountUp end={stat.value} duration={2} separator="," decimals={stat.value % 1 !== 0 ? 2 : 0} />
                                        )}
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Main Content Card */}
            <motion.div variants={itemVariants} className="relative rounded-3xl bg-white p-2 shadow-sm border border-zinc-100 overflow-hidden group hover:shadow-2xl transition-all duration-700">
                <div className="bg-white p-6 rounded-[2rem]">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                <UserCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tighter text-zinc-900">Registered Wards</h3>
                                <p className="text-xs font-medium text-zinc-400">List of all infants under your guardianship</p>
                            </div>
                        </div>
                    </div>
                    
                    <DataTable 
                        columns={wardColumns} 
                        url="/users/wards" 
                        searchKey="name" 
                        searchPlaceholder="Search wards by name..." 
                    />
                </div>
            </motion.div>
            <SlotPurchaseModal 
                open={isPurchaseModalOpen} 
                onOpenChange={setIsPurchaseModalOpen} 
                stats={stats} 
            />
        </motion.div>
    );
}
