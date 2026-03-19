'use client';

import { 
    CreditCard,
    CheckCircle2,
    ArrowUpRight,
    Wallet,
    History,
    Copy,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import type { WithDrawal } from '@/types';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

export default function WithdrawalsPage() {
    const user = useAppSelector((state) => state.auth.user);
    const [orderBy, setOrderBy] = useState<'asc' | 'desc'>('desc');
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        if (user?.transferId) {
            navigator.clipboard.writeText(user.transferId);
            setIsCopied(true);
            toast.success('Account number copied to clipboard');
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const columns: ColumnDef<WithDrawal>[] = [
        {
            id: "reference",
            accessorKey: "bankName",
            header: "Bank",
            cell: ({ row }) => (
                <div className="flex flex-col min-w-[350px]">
                    <span className="font-bold text-zinc-900 leading-tight">
                        Withdrawal to {row.original.bankName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium truncate mt-1">
                        Ref: {row.original.reference || 'REF-N/A'}
                    </span>
                </div>
            )
        },
        {
            id: "source",
            header: "Account Number",
            cell: ({ row }) => (
                <div className="font-medium text-zinc-600 min-w-[140px]">
                    {row.original.userType === 'customer' ? 'direct wallet' : row.original.userType || 'direct wallet'}
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <div className="font-black text-zinc-900 min-w-[120px]">
                    {Number(row.original.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            )
        },
        {
            accessorKey: "isPaid",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.isPaid;
                return (
                    <div className="min-w-[100px]">
                        <Badge className={cn(
                            "rounded-full px-3 py-1 font-bold text-[10px] border shadow-xs transition-all uppercase",
                            status === 1 
                                ? "bg-emerald-500 text-white border-emerald-400" 
                                : status === 2
                                    ? "bg-amber-500 text-white border-amber-400"
                                    : "bg-rose-500 text-white border-rose-400"
                        )}>
                            {status === 1 ? "Success" : status === 2 ? "Pending" : "Failed"}
                        </Badge>
                    </div>
                );
            }
        },
        {
            accessorKey: "requestedAt",
            header: "Date Req",
            cell: ({ row }) => (
                <div className="text-zinc-500 font-medium whitespace-nowrap min-w-[120px]">
                    {row.original.requestedAt 
                        ? new Date(row.original.requestedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' }) 
                        : 'N/A'}
                </div>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <div className="text-zinc-500 font-medium whitespace-nowrap min-w-[120px]">
                    {new Date(row.original.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' })}
                </div>
            )
        }
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="relative">
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-50/50 rounded-full blur-3xl -z-10" />
                    <div className="flex items-center gap-2 mb-3 text-indigo-600 font-black uppercase tracking-[0.25em] text-[10px] antialiased">
                        <div className="h-[2px] w-10 bg-indigo-600/30 rounded-full" />
                        Payout History
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl flex items-center gap-5">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 via-indigo-600 to-purple-600">Withdrawals</span>
                        <div className="h-14 w-14 rounded-[1.25rem] bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shadow-inner">
                            <ArrowUpRight size={28} className="text-indigo-600" />
                        </div>
                    </h1>

                    {user?.transferId && (
                        <div className="mt-4 flex items-center gap-3 w-fit p-1 pr-1 rounded-full bg-zinc-50 border border-zinc-100 group">
                            <div className="h-8 px-3 rounded-full bg-zinc-900 text-[10px] font-black text-white flex items-center uppercase tracking-widest shadow-lg">
                                Account Number
                            </div>
                            <span className="font-black text-lg tracking-tight text-zinc-900 font-mono pl-1">
                                {user.transferId}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={copyToClipboard}
                                className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm text-zinc-400 hover:text-indigo-600 transition-all active:scale-90"
                            >
                                {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </Button>
                        </div>
                    )}
                    <p className="mt-4 text-zinc-500 font-medium max-w-lg text-lg leading-relaxed antialiased italic">
                        Track all your successful and pending withdrawals to your bank accounts.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="hidden lg:flex items-center gap-6 px-8 py-4 bg-zinc-50/50 rounded-[2rem] border border-zinc-100/50 backdrop-blur-sm shadow-sm ring-1 ring-zinc-200/5 antialiased">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1">Last Sync</span>
                            <span className="font-bold text-zinc-900 flex items-center gap-2 text-sm">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                Live Updates
                            </span>
                        </div>
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
                <div className="group p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 ease-out hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <Wallet className="text-indigo-600" size={24} />
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] rounded-lg">LIVE</Badge>
                    </div>
                    <h3 className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1 antialiased">Total Requests</h3>
                    <div className="text-3xl font-black text-zinc-900 tracking-tight">Financial History</div>
                </div>

                <div className="group p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 shadow-xl shadow-zinc-900/40 hover:shadow-2xl hover:shadow-indigo-900/20 transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                            <CreditCard className="text-white" size={24} />
                        </div>
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1 antialiased uppercase">Withdrawal Method</h3>
                    <div className="text-3xl font-black text-white tracking-tight">Bank Transfer</div>
                </div>

                <div className="group p-8 rounded-[2.5rem] bg-indigo-600 border border-indigo-500 shadow-xl shadow-indigo-600/20 hover:shadow-2xl hover:shadow-indigo-600/40 transition-all duration-500 ease-out hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                            <History className="text-white" size={24} />
                        </div>
                    </div>
                    <h3 className="text-white/60 text-xs font-black uppercase tracking-widest mb-1 antialiased">Account Type</h3>
                    <div className="text-3xl font-black text-white tracking-tight">Main Wallet</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative group/table">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[3rem] blur opacity-5 group-hover/table:opacity-10 transition duration-1000 group-hover/table:duration-200" />
                <div className="relative bg-white rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden ring-1 ring-zinc-100/50">
                    <div className="p-10">
                        <DataTable 
                            columns={columns} 
                            url="/withdrawal/transactions" 
                            searchKey="reference"
                            searchPlaceholder="Search by withdrawal reference..."
                            orderBy={orderBy}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
