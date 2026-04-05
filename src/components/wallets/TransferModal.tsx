'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Send,
    ArrowRightLeft,
    Loader2,
    CheckCircle2,
    User as UserIcon,
    AlertCircle,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransferMutation, useGetWalletsQuery } from '@/store/api/walletApi';
import { useGetUserByTransferIdQuery } from '@/store/api/userApi';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

const transferSchema = z.object({
    receiverTransferId: z.string().min(3, 'Invalid account number'),
    senderWalletId: z.string().min(1, 'Please select a wallet'),
    amount: z.number().min(100, 'Minimum transfer amount is ₦100'),
    pin: z.string().length(4, 'PIN must be 4 digits'),
});

type TransferFormValues = z.infer<typeof transferSchema>;

interface TransferModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
    const [isSuccess, setIsSuccess] = useState(false);
    const [transferData, setTransferData] = useState<{ reference: string } | null>(null);

    const { data: walletsResponse } = useGetWalletsQuery();
    const wallets = walletsResponse?.data || [];

    const [transfer, { isLoading: isTransferring }] = useTransferMutation();

    const form = useForm<TransferFormValues>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            receiverTransferId: '',
            senderWalletId: '',
            amount: 0,
            pin: '',
        },
    });

    const receiverTransferId = form.watch('receiverTransferId');
    const senderWalletId = form.watch('senderWalletId');
    const debouncedReceiverId = useDebounce(receiverTransferId, 500);

    const selectedWallet = wallets.find((w) => w.id?.toString() === senderWalletId);
    const isGkwth = selectedWallet?.type === 'indirect';

    const { data: receiverResponse, isFetching: isSearching } = useGetUserByTransferIdQuery(
        debouncedReceiverId,
        { skip: debouncedReceiverId.length < 5 }
    );
    const receiver = receiverResponse?.data;

    useEffect(() => {
        if (!open) {
            setIsSuccess(false);
            setTransferData(null);
            form.reset();
        }
    }, [open, form]);

    const onSubmit = async (values: TransferFormValues) => {
        if (!receiver) {
            toast.error('Please verify the receiver account number first');
            return;
        }

        try {
            const res = await transfer(values).unwrap();
            if (res.data) {
                setTransferData({ reference: res.data.reference || 'N/A' });
                setIsSuccess(true);
                toast.success('Funds transferred successfully!');
            }
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Transfer failed');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-[500px] rounded-3xl md:rounded-[2rem] border-none shadow-2xl overflow-y-auto p-0 bg-white dark:bg-zinc-950">
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="transfer-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-5 md:p-6 space-y-6"
                        >
                            <DialogHeader>
                                <DialogTitle className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <ArrowRightLeft size={20} strokeWidth={2.5} />
                                    </div>
                                    Transfer Funds
                                </DialogTitle>
                                <DialogDescription className="font-medium text-zinc-500 text-xs md:text-sm">
                                    Send money instantly to other Trisonet users using their account number.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex justify-between">
                                            <span>Receiver Account Number</span>
                                            {isSearching && <Loader2 size={12} className="animate-spin" />}
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10">
                                                <UserIcon size={16} />
                                            </div>
                                            <Input
                                                type='number'
                                                {...form.register('receiverTransferId')}
                                                placeholder="Enter account number"
                                                className="h-14 rounded-xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pl-11 pr-4 font-bold focus:ring-indigo-500/10"
                                            />
                                        </div>
                                        {receiver && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">{receiver.name}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600/80">@{receiver.username}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                        {debouncedReceiverId.length >= 5 && !isSearching && !receiver && (
                                            <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 ml-1">
                                                <AlertCircle size={10} /> User not found
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount</Label>
                                            <div className="relative">
                                                <span className={cn(
                                                    "absolute top-1/2 -translate-y-1/2 text-zinc-400 font-bold",
                                                    isGkwth ? "left-3 text-xs" : "left-4"
                                                )}>
                                                    {isGkwth ? 'gkwth' : '₦'}
                                                </span>
                                                <Input
                                                    type="number"
                                                    {...form.register('amount', { valueAsNumber: true })}
                                                    className={cn(
                                                        "h-14 rounded-xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 pr-4 font-black text-xl text-zinc-900 dark:text-zinc-100",
                                                        isGkwth ? "pl-16" : "pl-8"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">From Wallet</Label>
                                            <Select
                                                value={senderWalletId}
                                                onValueChange={(val: string | null) => val && form.setValue('senderWalletId', val)}
                                            >
                                                <SelectTrigger className="!h-14 w-full rounded-xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-8 pr-4 font-black text-xl text-zinc-900 dark:text-zinc-100 focus:ring-indigo-500/10 transition-all">
                                                    <SelectValue placeholder="Select wallet">
                                                        {(() => {
                                                            if (!selectedWallet) return undefined;
                                                            return selectedWallet.type === 'indirect'
                                                                ? `${selectedWallet.amount.toLocaleString()} gkwth`
                                                                : `₦${selectedWallet.amount.toLocaleString()}`;
                                                        })()}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {wallets.map((wallet) => (
                                                        <SelectItem key={wallet.id} value={wallet.id?.toString() || ''}>
                                                            {`${wallet.type === 'indirect' ? '' : '₦'}${wallet.amount.toLocaleString()}${wallet.type === 'indirect' ? ' gkwth' : ''}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transfer PIN</Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <Input
                                                type="password"
                                                maxLength={4}
                                                {...form.register('pin')}
                                                placeholder="****"
                                                className="h-14 rounded-xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pl-11 pr-4 font-black tracking-[0.5em] text-xl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isTransferring || !receiver}
                                    className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-700 text-white font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isTransferring ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                                    Proceed with Transfer
                                </Button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-zinc-950"
                        >
                            <div className="bg-emerald-500 p-8 md:p-10 text-white text-center relative overflow-hidden">
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                                    className="relative z-10 flex flex-col items-center"
                                >
                                    <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter">Transfer Successful!</h2>
                                    <p className="text-emerald-100 font-medium mt-1">Funds have been moved instantly.</p>
                                </motion.div>
                                <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
                            </div>

                            <div className="p-6 md:p-8 space-y-8">
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Transferred</p>
                                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
                                        {isGkwth ? '' : '₦'}{form.getValues('amount').toLocaleString()}{isGkwth ? ' gkwth' : ''}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-400">
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sent To</p>
                                                <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase">{receiver?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ref No.</p>
                                            <p className="text-[10px] font-bold text-zinc-500 font-mono tracking-tighter">{transferData?.reference}</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black shadow-xl transition-all active:scale-95"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Done
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
