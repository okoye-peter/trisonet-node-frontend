'use client';

import { 
    ArrowUpRight, 
    ArrowDownLeft, 
    ArrowRightLeft,
    Clock,
    History,
    Copy,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from '@/components/ui/badge';
import type { WalletTransfer } from '@/types';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';
import { TransferModal } from '@/components/wallets/TransferModal';
import { Button } from '@/components/ui/button';

export default function WalletTransfersPage() {
    const user = useAppSelector((state) => state.auth.user);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        if (user?.transferId) {
            navigator.clipboard.writeText(user.transferId);
            setIsCopied(true);
            toast.success('Account number copied to clipboard');
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const columns: ColumnDef<WalletTransfer>[] = [
        {
            accessorKey: "reference",
            header: "Reference",
            cell: ({ row }) => (
                <div className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-tighter min-w-[150px]">
                    {row.original.reference || 'REF-N/A'}
                </div>
            )
        },
        {
            id: "type",
            header: "Type",
            cell: ({ row }) => {
                const isOutbound = row.original.senderWallet?.user.id === user?.id;
                return (
                    <div className="min-w-[100px]">
                        <Badge className={cn(
                            "rounded-lg px-2 py-1 font-black text-[10px] border flex items-center gap-1 w-fit",
                            isOutbound 
                                ? "bg-rose-50 text-rose-600 border-rose-100" 
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                            {isOutbound ? (
                                <>
                                    <ArrowUpRight size={10} strokeWidth={3} />
                                    DEBIT
                                </>
                            ) : (
                                <>
                                    <ArrowDownLeft size={10} strokeWidth={3} />
                                    CREDIT
                                </>
                            )}
                        </Badge>
                    </div>
                );
            }
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const isOutbound = row.original.senderWallet?.user.id === user?.id;
                return (
                    <div className={cn(
                        "font-black text-sm min-w-[100px]",
                        isOutbound ? "text-rose-600" : "text-emerald-600"
                    )}>
                        {isOutbound ? '-' : '+'}₦{row.original.amount.toLocaleString()}
                    </div>
                );
            }
        },
        {
            id: "from",
            header: "From",
            cell: ({ row }) => {
                const user = row.original.senderWallet?.user;
                return (
                    <div className="flex flex-col min-w-[200px]">
                        <span className="font-bold text-zinc-900 leading-none">
                            {user?.name || 'Unknown'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-black uppercase mt-1 tracking-wider">
                            ID: {user?.transferId || 'N/A'}
                        </span>
                    </div>
                );
            }
        },
        {
            id: "to",
            header: "To",
            cell: ({ row }) => {
                const user = row.original.receiverWallet?.user;
                return (
                    <div className="flex flex-col min-w-[200px]">
                        <span className="font-bold text-zinc-900 leading-none">
                            {user?.name || 'Unknown'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-black uppercase mt-1 tracking-wider">
                            ID: {user?.transferId || 'N/A'}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-zinc-500 font-medium whitespace-nowrap min-w-[180px]">
                    <Clock size={14} className="opacity-40" />
                    {new Date(row.original.createdAt).toLocaleString()}
                </div>
            )
        }
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
            <TransferModal open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen} />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <div className="h-1 w-8 bg-indigo-600/20 rounded-full" />
                        Financial Logs
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 lg:text-5xl flex items-center gap-4">
                        Wallet <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">Transfers</span>
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <History size={24} className="text-indigo-600" />
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
                    
                    <p className="mt-2 text-zinc-500 font-medium max-w-md italic">
                        View all your inbound and outbound transactions.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button 
                        onClick={() => setIsTransferModalOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-2xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                    >
                        <ArrowRightLeft size={18} />
                        Transfer Funds
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden ring-1 ring-zinc-100/50">
                <div className="p-8">
                    <DataTable 
                        columns={columns} 
                        url="/wallet/transfers" 
                        searchKey="reference"
                        searchPlaceholder="Search by reference..."
                    />
                </div>
            </div>
        </div>
    );
}
