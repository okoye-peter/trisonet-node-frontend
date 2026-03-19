'use client';

import { useState } from 'react';
import { 
    BadgeCheck,
    AlertCircle,
    Clock,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import LoadingScreen from '@/components/LoadingScreen';
import type { InfantSchoolFee, PaginatedResult } from '@/types';


export default function WardsFeesPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data: feesData, isLoading } = useQuery<PaginatedResult<InfantSchoolFee>>({
        queryKey: ['wards-school-fees', page, search],
        queryFn: async () => {
            const res = await api.get('/users/wards-school-fees', {
                params: { page, limit: 10, username: search }
            });
            return res.data.data;
        }
    });

    const columns: ColumnDef<InfantSchoolFee>[] = [
        {
            accessorKey: "infantSchoolFeeGroup.refNo",
            header: "Ref No",
            cell: ({ row }) => (
                <div className="font-mono text-xs font-bold text-zinc-500">
                    {row.original.infantSchoolFeeGroup?.refNo || 'N/A'}
                </div>
            )
        },
        {
            accessorKey: "user.name",
            header: "Ward Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">{row.original.user.name}</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-black">@{row.original.user.username}</span>
                </div>
            )
        },
        {
            accessorKey: "infantSchoolFeeGroup.bank",
            header: "Bank",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-zinc-700">{row.original.infantSchoolFeeGroup?.bank || 'N/A'}</span>
                    <span className="text-[10px] text-zinc-400 font-bold">{row.original.infantSchoolFeeGroup?.accountNumber || 'N/A'}</span>
                </div>
            )
        },
        {
            accessorKey: "schoolName",
            header: "School",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-indigo-600">{row.original.schoolName || 'N/A'}</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">{row.original.schoolClass || 'N/A'}</span>
                </div>
            )
        },
        {
            accessorKey: "schoolTerm",
            header: "Term",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-zinc-50 border-zinc-100 text-zinc-600 font-bold text-[10px] uppercase">
                    {row.original.schoolTerm || 'N/A'}
                </Badge>
            )
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <div className="font-black text-zinc-900">
                    ₦{row.original.amount?.toLocaleString() || '0'}
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const config = {
                    PAID: { icon: BadgeCheck, class: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                    PENDING: { icon: Clock, class: "bg-amber-50 text-amber-600 border-amber-100" },
                    REJECTED: { icon: AlertCircle, class: "bg-rose-50 text-rose-600 border-rose-100" }
                }[status] || { icon: Clock, class: "bg-zinc-50 text-zinc-600 border-zinc-100" };

                return (
                    <Badge className={`flex items-center gap-1 w-fit rounded-lg px-2 py-1 font-black text-[10px] border ${config.class}`}>
                        <config.icon size={10} strokeWidth={3} />
                        {status}
                    </Badge>
                );
            }
        },
        {
            id: "actions",
            header: "Action",
            cell: () => (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-lg"
                    onClick={() => {/* View Invoice Logic */}}
                >
                    <Eye size={16} />
                </Button>
            )
        }
    ];

    if (isLoading) return <LoadingScreen />;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden min-h-[600px]">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h1 className="text-2xl font-bold text-zinc-900">Wards Fees</h1>
                    
                    <div className="flex items-center gap-3">
                        <Input 
                            placeholder="search wards username" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-64 h-12 bg-white border-zinc-200 rounded-lg font-medium text-zinc-500 placeholder:text-zinc-300"
                        />
                        <Button 
                            className="h-12 px-8 bg-[#4D4FB1] hover:bg-[#3F4191] text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all"
                            onClick={() => setPage(1)}
                        >
                            Search
                        </Button>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <div className="rounded-xl border border-zinc-100 overflow-hidden">
                        <DataTable 
                            columns={columns} 
                            data={feesData?.data || []} 
                        />
                    </div>

                    {feesData && feesData.meta.totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-2">
                                Page {feesData.meta.currentPage} of {feesData.meta.totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!feesData.meta.hasPreviousPage}
                                    onClick={() => setPage(page - 1)}
                                    className="rounded-xl border-zinc-200 font-bold h-10 px-6"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!feesData.meta.hasNextPage}
                                    onClick={() => setPage(page + 1)}
                                    className="rounded-xl border-zinc-200 font-bold h-10 px-6"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
