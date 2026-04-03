'use client';

import { 
    Coins, 
    BarChart3, 
    TrendingUp, 
    Wallet, 
    CheckCircle2, 
    ArrowUpRight
} from 'lucide-react';
import { useState } from 'react';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { EarningTransaction } from '@/types';
import { useGetWalletsQuery } from '@/store/api/walletApi';
import { WithdrawalModal } from '@/components/earnings/WithdrawalModal';

export default function EarningsPage() {
    const { data: walletsResponse } = useGetWalletsQuery();
    const wallets = walletsResponse?.data || [];
    const earningWallet = wallets.find(w => w.type === 'earning');
    
    const [orderBy, setOrderBy] = useState<'asc' | 'desc'>('desc');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('all');

    const columns: ColumnDef<EarningTransaction>[] = [
        {
            id: "reference",
            accessorKey: "reference",
            header: "Transaction Details",
            cell: ({ row }) => (
                <div className="flex flex-col min-w-[350px]">
                    <span className="font-bold text-zinc-900 leading-tight">
                        {row.original.narration}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium truncate mt-1 uppercase tracking-wider">
                        Ref: {row.original.reference}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "type",
            header: "Category",
            cell: ({ row }) => (
                <div className="min-w-[120px]">
                    <Badge variant="outline" className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase border-zinc-200 text-zinc-600 bg-zinc-50">
                        {row.original.type}
                    </Badge>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <div className="font-black text-emerald-600 min-w-[120px] flex items-center gap-1">
                    <span className="text-zinc-400 text-[10px] font-bold">₦</span>
                    {Number(row.original.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <div className="text-zinc-500 font-medium whitespace-nowrap min-w-[120px]">
                    {new Date(row.original.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' })}
                    <span className="ml-2 text-[10px] opacity-50 font-normal">
                        {new Date(row.original.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        }
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="relative">
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -z-10" />
                    <div className="flex items-center gap-2 mb-3 text-emerald-600 font-black uppercase tracking-[0.25em] text-[10px] antialiased">
                        <div className="h-[2px] w-10 bg-emerald-600/30 rounded-full" />
                        Financial Growth
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl flex items-center gap-5">
                        My <span className="text-transparent bg-clip-text bg-linear-to-br from-emerald-600 via-teal-600 to-indigo-600">Earnings</span>
                        <div className="h-14 w-14 rounded-[1.25rem] bg-emerald-50 border border-emerald-100/50 flex items-center justify-center shadow-inner">
                            <TrendingUp size={28} className="text-emerald-600" />
                        </div>
                    </h1>

                    <p className="mt-4 text-zinc-500 font-medium max-w-lg text-lg leading-relaxed antialiased italic">
                        Review your historical earnings, partnership bonuses, and platform rewards in one place.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="hidden lg:flex items-center gap-6 px-8 py-4 bg-zinc-50/50 rounded-[2rem] border border-zinc-100/50 backdrop-blur-sm shadow-sm ring-1 ring-zinc-200/5 antialiased">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1">Live Sync</span>
                            <span className="font-bold text-zinc-900 flex items-center gap-2 text-sm">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                Real-time
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-4 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Type</span>
                        <Select value={selectedType} onValueChange={(v: string | null) => v && setSelectedType(v)}>
                            <SelectTrigger className="h-8 w-[120px] border-none shadow-none font-bold text-xs ring-0 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="credit">Credit</SelectItem>
                                <SelectItem value="debit">Debit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-4 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order</span>
                        <Select value={orderBy} onValueChange={(v: 'asc' | 'desc' | null) => v && setOrderBy(v)}>
                            <SelectTrigger className="h-8 w-[100px] border-none shadow-none font-bold text-xs ring-0 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Newest</SelectItem>
                                <SelectItem value="asc">Oldest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 ease-out hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <Coins className="text-emerald-600" size={24} />
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] rounded-lg">ACTIVE</Badge>
                    </div>
                    <h3 className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1 antialiased">Primary Driver</h3>
                    <div className="text-3xl font-black text-zinc-900 tracking-tight">Partnership Rewards</div>
                </div>

                <div className="group p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 shadow-xl shadow-zinc-900/40 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                            <BarChart3 className="text-white" size={24} />
                        </div>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1 antialiased">Platform Activity</h3>
                    <div className="text-3xl font-black text-white tracking-tight">High Engagement</div>
                </div>

                <div className="group p-8 rounded-[2.5rem] bg-emerald-600 border border-emerald-500 shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:shadow-emerald-600/40 transition-all duration-500 ease-out hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                            <Wallet className="text-white" size={24} />
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-white/60 text-xs font-black uppercase tracking-widest mb-1 antialiased">Earning Wallet</h3>
                            <div className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                                <span className="text-white/60 mr-1 text-xl italic">₦</span>
                                {earningWallet?.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="h-12 w-12 rounded-2xl bg-white/20 hover:bg-white text-white hover:text-emerald-600 flex items-center justify-center transition-all duration-300 shadow-lg shadow-black/5 group/btn"
                            title="Withdraw Funds"
                        >
                            <ArrowUpRight size={22} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative group/table">
                <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 to-teal-500 rounded-[3rem] blur opacity-5 group-hover/table:opacity-10 transition duration-1000 group-hover/table:duration-200" />
                <div className="relative bg-white rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden ring-1 ring-zinc-100/50">
                    <div className="p-10">
                        <DataTable 
                            columns={columns} 
                            url="/earnings/transactions" 
                            searchKey="reference"
                            searchPlaceholder="Search by transaction reference..."
                            orderBy={orderBy}
                            filters={{ type: selectedType }}
                        />
                    </div>
                </div>
            </div>
            {/* Modal */}
            <WithdrawalModal 
                open={isWithdrawModalOpen} 
                onOpenChange={setIsWithdrawModalOpen} 
                earningWallet={earningWallet} 
            />
        </div>
    );
}
