'use client';

import { useAppSelector } from '@/store/hooks';
import { motion, Variants } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    ArrowUpRight,
    Copy,
    Phone,
    Calendar,
    MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGetPatronDashboardQuery } from '@/store/api/patronApi';
import LoadingScreen from '@/components/LoadingScreen';
import { useState } from 'react';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import type { User } from '@/types';
import { AddMemberModal } from '@/components/dashboard/patron/AddMemberModal';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const columns: ColumnDef<User & { _count: { patronees: number } }>[] = [
    {
        accessorKey: "name",
        header: "Patron Member",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-xs shadow-xl shadow-indigo-100/50">
                    {row.original.name[0]}
                </div>
                <div>
                    <p className="font-black text-zinc-900 text-sm tracking-tight leading-none">{row.original.name}</p>
                    <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">{row.original.email}</p>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "phone",
        header: "Phone Number",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-zinc-600 font-bold text-xs">
                <Phone size={12} className="text-zinc-300" />
                {row.original.phone}
            </div>
        )
    },
    {
        id: "beneficiaries",
        header: "Beneficiaries",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest">
                    {row.original._count.patronees} Linked
                </span>
            </div>
        )
    },
    {
        accessorKey: "createdAt",
        header: "Joined Date",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} />
                {new Date(row.original.createdAt).toLocaleDateString()}
            </div>
        )
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <ArrowUpRight size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                    <MoreVertical size={14} />
                </Button>
            </div>
        )
    }
];

export default function PatronMembersPage() {
    const [page, setPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { data: dashboardData, isLoading } = useGetPatronDashboardQuery({ page });
    
    const members = dashboardData?.data?.members || [];
    const meta = dashboardData?.data?.meta;

    if (isLoading) return <LoadingScreen />;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                        <Users size={12} className="fill-indigo-600/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Member Directory</span>
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-zinc-900 leading-[0.8]">
                            Patron Members
                        </h1>
                        <p className="mt-4 text-zinc-400 font-medium text-sm lg:text-base max-w-xl">
                            Manage your organization&apos;s network of patrons and their associated beneficiaries.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="rounded-2xl bg-zinc-900 hover:bg-black text-white h-14 px-8 font-black text-xs uppercase tracking-widest shadow-2xl shadow-zinc-200 transition-all active:scale-95"
                    >
                        <UserPlus size={18} className="mr-2" /> Add New Member
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white rounded-[2.5rem] p-6 border border-zinc-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-1">Total Patrons</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-black text-zinc-900 tracking-tighter">{meta?.totalMembers || 0}</h3>
                        <span className="text-[10px] font-bold text-emerald-500 mb-2 uppercase tracking-widest">Members</span>
                    </div>
                </Card>
                <Card className="bg-white rounded-[2.5rem] p-6 border border-zinc-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-1">Total Beneficiaries</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-black text-zinc-900 tracking-tighter">{meta?.totalBeneficiaries || 0}</h3>
                        <span className="text-[10px] font-bold text-indigo-500 mb-2 uppercase tracking-widest">Linked Slots</span>
                    </div>
                </Card>
                <Card className="bg-indigo-600 rounded-[2.5rem] p-6 border-none shadow-xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">Growth Index</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-black tracking-tighter">+12%</h3>
                        <span className="text-[10px] font-bold text-indigo-100 mb-2 uppercase tracking-widest">Monthly</span>
                    </div>
                </Card>
            </div>

            <Card className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="p-8 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                            <Input 
                                placeholder="Search by name, email or phone..." 
                                className="h-12 w-full rounded-xl bg-zinc-50 border-none pl-12 pr-4 font-bold text-zinc-900 placeholder:text-zinc-300 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600/20"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="rounded-xl border-zinc-100 h-12 px-6 font-bold text-xs uppercase tracking-widest">
                                <Filter size={16} className="mr-2" /> Filter
                            </Button>
                            <Button variant="outline" className="rounded-xl border-zinc-100 h-12 px-6 font-bold text-xs uppercase tracking-widest">
                                <Copy size={16} className="mr-2" /> Export
                            </Button>
                        </div>
                    </div>

                    <div className="p-2">
                        <DataTable 
                            columns={columns} 
                            data={members} 
                            searchKey="name"
                            searchPlaceholder="Filter members..."
                        />
                    </div>
                </CardContent>
            </Card>

            <AddMemberModal 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen} 
            />
        </motion.div>
    );
}
