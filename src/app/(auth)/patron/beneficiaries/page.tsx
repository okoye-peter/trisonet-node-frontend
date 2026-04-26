'use client';

import { motion, Variants } from 'framer-motion';
import {
    UserPlus,
    Search,
    Filter,
    Users,
    ArrowUpRight,
    Copy,
    Mail,
    Phone,
    Calendar,
    MoreVertical,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetPatronBeneficiariesQuery } from '@/store/api/patronApi';
import LoadingScreen from '@/components/LoadingScreen';
import { useMemo, useState } from 'react';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import type { User, PatronBeneficiary } from '@/types';

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

export default function PatronBeneficiariesPage() {
    const [page, setPage] = useState(1);
    const { data: beneficiariesResponse, isLoading } = useGetPatronBeneficiariesQuery({ page });
    
    const beneficiaries = beneficiariesResponse?.data?.beneficiaries || [];
    const meta = beneficiariesResponse?.data?.meta;

    const columns: ColumnDef<PatronBeneficiary>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const beneficiary = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-emerald-100 transition-transform hover:scale-110">
                            {beneficiary.name[0]}
                        </div>
                        <div>
                            <p className="font-bold text-zinc-900 leading-none">{beneficiary.name}</p>
                            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-black tracking-widest">Beneficiary</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "username",
            header: "Username",
            cell: ({ row }) => (
                <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest">
                    {row.original.username || 'N/A'}
                </span>
            )
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-zinc-600 font-medium">
                    <Mail size={14} className="text-zinc-300" />
                    <span>{row.original.email || 'N/A'}</span>
                </div>
            )
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-zinc-600 font-medium">
                    <Phone size={14} className="text-zinc-300" />
                    <span>{row.original.phone || 'N/A'}</span>
                </div>
            )
        },
        {
            id: "patron",
            header: "Patron / Sponsor",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-black text-zinc-400">
                        {row.original.patron?.name[0]}
                    </div>
                    <span className="text-xs font-bold text-zinc-500">{row.original.patron?.name || 'Unknown'}</span>
                </div>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Date Joined",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                    <Calendar size={14} className="opacity-40" />
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </div>
            )
        },
        {
            id: "actions",
            cell: () => (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50">
                    <MoreVertical size={16} />
                </Button>
            )
        }
    ];

    if (isLoading) return <LoadingScreen />;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
                        <UserPlus size={12} className="fill-emerald-600/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Growth Tracking</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 leading-none">
                        Patron Beneficiaries
                    </h1>
                    <p className="mt-2 text-zinc-400 font-medium text-sm">
                        You have {meta?.total || 0} individuals benefiting from your organization.
                    </p>
                </div>
            </div>

            <motion.div variants={itemVariants} className="space-y-6">
                <Card className="border-none bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden group hover:shadow-2xl transition-all duration-700">
                    <CardContent className="p-8">
                        <DataTable 
                            columns={columns} 
                            data={beneficiaries} 
                            searchKey="name" 
                            searchPlaceholder="Search by name or email..." 
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
