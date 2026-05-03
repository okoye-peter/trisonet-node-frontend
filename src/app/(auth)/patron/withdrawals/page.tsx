'use client';

import { 
    ArrowUpRight,
    Wallet,
    History,
    CheckCircle2,
    Clock,
    AlertCircle,
    Landmark
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WithDrawal, WithdrawalRequest } from '@/types';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

export default function PatronWithdrawalsPage() {
    const [orderBy, setOrderBy] = useState<'asc' | 'desc'>('desc');

    const transactionColumns: ColumnDef<WithDrawal>[] = [
        {
            id: "reference",
            accessorKey: "bankName",
            header: "Bank",
            cell: ({ row }) => (
                <div className="flex flex-col min-w-[250px]">
                    <span className="font-bold text-zinc-900 leading-tight">
                        {row.original.bankName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium truncate mt-1">
                        Ref: {row.original.reference || row.original.pagaRef || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const isGkwth = row.original.oldBalance?.includes('gkwth');
                return (
                    <div className="font-black text-zinc-900 min-w-[120px]">
                        {isGkwth ? '' : '₦'}{Number(row.original.amount).toLocaleString()} {isGkwth ? 'gkwth' : ''}
                    </div>
                );
            }
        },
        {
            accessorKey: "isPaid",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.isPaid;
                return (
                    <Badge className={cn(
                        "rounded-full px-3 py-1 font-bold text-[10px] border shadow-xs transition-all uppercase",
                        status === 1 ? "bg-emerald-500 text-white border-emerald-400" : "bg-rose-500 text-white border-rose-400"
                    )}>
                        {status === 1 ? "Success" : "Failed"}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <div className="text-zinc-500 font-medium whitespace-nowrap min-w-[120px]">
                    {new Date(row.original.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
            )
        }
    ];

    const requestColumns: ColumnDef<WithdrawalRequest>[] = [
        {
            id: "details",
            header: "Bank Details",
            cell: ({ row }) => (
                <div className="flex flex-col min-w-[250px]">
                    <span className="font-bold text-zinc-900 leading-tight">
                        {row.original.bankName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium truncate mt-1 uppercase tracking-widest">
                        {row.original.accountNumber} • {row.original.accountName}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "amountRequested",
            header: "Requested",
            cell: ({ row }) => {
                const isGkwth = !!row.original.gkwthAmount;
                const amount = isGkwth ? row.original.gkwthAmount : row.original.amountRequested;
                return (
                    <div className="font-black text-zinc-900 min-w-[120px]">
                        {isGkwth ? '' : '₦'}{Number(amount).toLocaleString()} {isGkwth ? 'gkwth' : ''}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge className={cn(
                        "rounded-full px-3 py-1 font-bold text-[10px] border shadow-xs transition-all uppercase",
                        status === 'pending' ? "bg-amber-500 text-white border-amber-400" : 
                        status === 'being_processed' ? "bg-blue-500 text-white border-blue-400" :
                        status === 'processed' ? "bg-emerald-500 text-white border-emerald-400" :
                        "bg-rose-500 text-white border-rose-400"
                    )}>
                        {status.replace('_', ' ')}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <div className="text-zinc-500 font-medium whitespace-nowrap min-w-[120px]">
                    {new Date(row.original.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
            )
        }
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3 text-indigo-600 font-black uppercase tracking-[0.25em] text-[10px] antialiased">
                        <div className="h-[2px] w-10 bg-indigo-600/30 rounded-full" />
                        Withdrawal History
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl flex items-center gap-5">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 via-indigo-600 to-purple-600">Withdrawals</span>
                        <div className="h-14 w-14 rounded-[1.25rem] bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shadow-inner">
                            <ArrowUpRight size={28} className="text-indigo-600" />
                        </div>
                    </h1>
                    <p className="mt-4 text-zinc-500 font-medium max-w-lg text-lg leading-relaxed antialiased italic">
                        Track all your processed and pending withdrawal requests.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 transition-all duration-500 ease-out hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <Clock className="text-amber-600" size={24} />
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] rounded-lg">ACTIVE</Badge>
                    </div>
                    <h3 className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">Under Review</h3>
                    <div className="text-3xl font-black text-zinc-900 tracking-tight">Pending Requests</div>
                </div>

                <div className="group p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 shadow-xl shadow-zinc-900/40 transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                            <CheckCircle2 className="text-emerald-400" size={24} />
                        </div>
                    </div>
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Historical</h3>
                    <div className="text-3xl font-black text-white tracking-tight">Completed Payouts</div>
                </div>
            </div>

            <Tabs defaultValue="pending" className="space-y-8">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-zinc-100/80 p-1.5 rounded-2xl h-auto gap-2">
                        <TabsTrigger value="pending" className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Pending Requests
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-xl px-8 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Completed Payouts
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 px-6 py-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sort</span>
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

                <TabsContent value="pending" className="relative group/table">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[3rem] blur opacity-5" />
                    <div className="relative bg-white rounded-[3rem] border border-zinc-100 shadow-2xl overflow-hidden">
                        <div className="p-10">
                            <DataTable 
                                columns={requestColumns} 
                                url="/withdrawal/my-requests" 
                                searchKey="bankName"
                                searchPlaceholder="Search pending withdrawals..."
                                orderBy={orderBy}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="completed" className="relative group/table">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[3rem] blur opacity-5" />
                    <div className="relative bg-white rounded-[3rem] border border-zinc-100 shadow-2xl overflow-hidden">
                        <div className="p-10">
                            <DataTable 
                                columns={transactionColumns} 
                                url="/withdrawal/transactions" 
                                searchKey="bankName"
                                searchPlaceholder="Search completed payouts..."
                                orderBy={orderBy}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
