'use client';

import { 
    Coins, 
    BarChart3, 
    TrendingUp, 
    Wallet, 
    CheckCircle2, 
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
import { useGetWalletsQuery, useGetGkwthPricesQuery, useGetEarningConversionInfoQuery } from '@/store/api/walletApi';
import { useGetUserQuery } from '@/store/api/userApi';
import { WithdrawalModal } from '@/components/earnings/WithdrawalModal';
import CustomerConvertEarningsModal from '@/components/earnings/CustomerConvertEarningsModal';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EarningsPage() {
    const { data: walletsResponse } = useGetWalletsQuery();
    const { data: pricesResponse } = useGetGkwthPricesQuery();
    const { data: userResponse } = useGetUserQuery();
    const { data: conversionInfoResponse } = useGetEarningConversionInfoQuery(undefined, {
        skip: (userResponse?.data?.user?.level ?? 0) < 2
    });

    const wallets = walletsResponse?.data || [];
    const earningWallet = wallets.find(w => w.type === 'earning');
    const prices = pricesResponse?.data;
    const purchasePrice = Number(prices?.gkwthPurchasePrice) || 0;
    const user = userResponse?.data?.user;
    const conversionInfo = conversionInfoResponse?.data;
    
    const [orderBy, setOrderBy] = useState<'asc' | 'desc'>('desc');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('all');

    const columns: ColumnDef<EarningTransaction>[] = [
        {
            id: "reference",
            accessorKey: "reference",
            header: "Transaction Details",
            cell: ({ row }) => (
                <div className="flex flex-col min-w-[350px]">
                    <span className={`font-bold leading-tight lowercase first-letter:uppercase ${row.original.type === 'debit' ? 'text-red-600' : 'text-emerald-600'}`}>
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
                    <Badge variant="outline" className={`rounded-full px-3 py-0.5 font-bold text-[10px] uppercase border-zinc-200 text-zinc-600 bg-zinc-50 ${row.original.type === 'debit' ? 'text-red-600 border-red-200 bg-red-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}`}>
                        {row.original.type}
                    </Badge>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <div className={`font-black min-w-[120px] flex items-center gap-1 ${row.original.type === 'debit' ? 'text-red-600' : 'text-emerald-600'}`}>
                    <div>
                        {row.original.type === 'debit' ? '-' : '+'}{Number(row.original.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-zinc-400 text-[10px] font-bold ml-1">assets</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium ml-2">
                        ≈ ₦{(Number(row.original.amount) * purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
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
        <div className="p-4 pb-20 mx-auto space-y-12 md:p-8 max-w-7xl">
            {/* Header section */}
            <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
                <div className="relative">
                    <div className="absolute w-32 h-32 rounded-full -top-6 -left-6 bg-emerald-50/50 blur-3xl -z-10" />
                    <div className="flex items-center gap-2 mb-3 text-emerald-600 font-black uppercase tracking-[0.25em] text-[10px] antialiased">
                        <div className="h-[2px] w-10 bg-emerald-600/30 rounded-full" />
                        Financial Growth
                    </div>
                    <h1 className="flex items-center gap-5 text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl">
                        My <span className="text-transparent bg-clip-text bg-linear-to-br from-emerald-600 via-teal-600 to-indigo-600">Earnings</span>
                        <div className="h-14 w-14 rounded-[1.25rem] bg-emerald-50 border border-emerald-100/50 flex items-center justify-center shadow-inner">
                            <TrendingUp size={28} className="text-emerald-600" />
                        </div>
                    </h1>

                    <p className="max-w-lg mt-4 text-lg antialiased italic font-medium leading-relaxed text-zinc-500">
                        Review your historical earnings, partnership bonuses, and platform rewards in one place.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="hidden lg:flex items-center gap-6 px-8 py-4 bg-zinc-50/50 rounded-[2rem] border border-zinc-100/50 backdrop-blur-sm shadow-sm ring-1 ring-zinc-200/5 antialiased">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1">Live Sync</span>
                            <span className="flex items-center gap-2 text-sm font-bold text-zinc-900">
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
                
                {user && user.level >= 2 && (
                    <Button 
                        onClick={() => setIsConvertModalOpen(true)}
                        className="h-14 px-8 rounded-[2rem] bg-zinc-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <ArrowRightLeft size={16} />
                        Convert Assets
                    </Button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="group p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 ease-out hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center justify-center transition-all duration-500 h-14 w-14 rounded-2xl bg-emerald-50 group-hover:scale-110 group-hover:rotate-6">
                            <Coins className="text-emerald-600" size={24} />
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] rounded-lg">ACTIVE</Badge>
                    </div>
                    <h3 className="mb-1 text-xs antialiased font-black tracking-widest uppercase text-zinc-400">Primary Driver</h3>
                    <div className="text-3xl font-black tracking-tight text-zinc-900">Partnership Rewards</div>
                </div>

                <div className="group p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 shadow-xl shadow-zinc-900/40 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center justify-center transition-all duration-500 border h-14 w-14 rounded-2xl bg-zinc-900 border-zinc-800 group-hover:scale-110 group-hover:-rotate-6">
                            <BarChart3 className="text-white" size={24} />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h3 className="mb-1 text-xs antialiased font-black tracking-widest uppercase text-zinc-500">Platform Activity</h3>
                    <div className="text-3xl font-black tracking-tight text-white">High Engagement</div>
                </div>

                <div className="group p-8 rounded-[2.5rem] bg-emerald-600 border border-emerald-500 shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:shadow-emerald-600/40 transition-all duration-500 ease-out hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center justify-center transition-all duration-500 h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md group-hover:scale-110">
                            <Wallet className="text-white" size={24} />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="mb-1 text-xs antialiased font-black tracking-widest uppercase text-white/60">Earning Wallet</h3>
                            <div className="mb-1 text-2xl font-black leading-none tracking-tight text-white">
                                {earningWallet?.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
                                <span className="mr-1 text-sm italic text-white/60"> Asset</span>
                            </div>
                            <p className="text-white/40 text-[10px] font-bold">
                                Total ≈ ₦{(earningWallet ? earningWallet.amount * purchasePrice : 0).toLocaleString()}
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="h-12 px-4 py-1 rounded-2xl bg-white/20 hover:bg-white text-white hover:text-emerald-600 flex items-center justify-center transition-all duration-300 shadow-lg shadow-black/5 group/btn text-sm!"
                            title="Withdraw Funds"
                        >
                            Withdraw
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
            {/* Modals */}
            <WithdrawalModal 
                open={isWithdrawModalOpen} 
                onOpenChange={setIsWithdrawModalOpen} 
                earningWallet={earningWallet} 
            />
            
            <CustomerConvertEarningsModal 
                open={isConvertModalOpen}
                onOpenChange={setIsConvertModalOpen}
                maxAmount={conversionInfo?.maxConvertibleAmount || 0}
                conversionRate={conversionInfo?.conversionRate || 1}
                nextAllowedDate={conversionInfo?.nextAllowedConversionDate || null}
            />
        </div>
    );
}
