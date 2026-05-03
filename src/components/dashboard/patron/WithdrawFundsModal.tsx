'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Landmark, Loader2, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
    useInitiateWithdrawalMutation 
} from "@/store/api/withdrawalApi";
import { 
    useGetBanksQuery, 
    useResolveAccountMutation 
} from "@/store/api/bankApi";
import { useSendPatronWithdrawalOtpMutation } from "@/store/api/patronApi";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import type { Wallet as WalletType } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { useGetGkwthPricesQuery } from "@/store/api/walletApi";

const withdrawSchema = z.object({
    wallet: z.string().min(1, "Please select a wallet"),
    amount: z.number().min(0.000001, "Amount must be greater than 0"),
    withdrawal_pin: z.string().length(4, "PIN must be 4 digits"),
});

type WithdrawValues = z.infer<typeof withdrawSchema>;

interface WithdrawFundsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    wallets: WalletType[];
}

export function WithdrawFundsModal({ open, onOpenChange, wallets }: WithdrawFundsModalProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [initiateWithdrawal, { isLoading: isSubmitting }] = useInitiateWithdrawalMutation();
    const { data: pricesResponse } = useGetGkwthPricesQuery();
    const gkwthPrice = Number(pricesResponse?.data?.gkwthPurchasePrice) || 0;

    const form = useForm<WithdrawValues>({
        resolver: zodResolver(withdrawSchema),
        defaultValues: {
            wallet: wallets.find(w => w.type === 'direct')?.id?.toString() || wallets[0]?.id?.toString() || "",
            amount: 1000,
            withdrawal_pin: "",
        },
    });

    const onSubmit = async (values: WithdrawValues) => {
        if (!user?.bank || !user?.accountNumber) {
            toast.error("Please set your bank details in your profile first");
            return;
        }

        const selectedWallet = wallets.find(w => w.id?.toString() === values.wallet);
        if (!selectedWallet) {
            toast.error("Invalid wallet selected");
            return;
        }

        if (selectedWallet.type === 'direct' && values.amount < 1000) {
            toast.error("Minimum withdrawal from direct wallet is ₦1,000");
            return;
        }

        if (selectedWallet.type === 'indirect' && values.amount < 1) {
            toast.error("Minimum withdrawal from GKWTH wallet is 1 GKWTH");
            return;
        }

        if (selectedWallet.amount < values.amount) {
            toast.error("Insufficient wallet balance");
            return;
        }

        try {
            await initiateWithdrawal({
                amount: values.amount,
                bank_code: "saved", // Backend will use saved bank
                bank_name: user.bank,
                account_name: user.username || 'Patron',
                account_number: user.accountNumber,
                wallet: values.wallet,
                withdrawal_pin: values.withdrawal_pin,
            }).unwrap();

            toast.success("Withdrawal initiated and under review");
            handleClose();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to initiate withdrawal");
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        form.reset();
    };

    const hasBankDetails = user?.bank && user?.accountNumber;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
                <div className="bg-zinc-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-black tracking-tighter">Withdraw Funds</DialogTitle>
                        <DialogDescription className="text-zinc-400 font-medium">
                            Transfer money from your organization wallet to your saved bank account.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                {!hasBankDetails ? (
                    <div className="p-12 text-center space-y-6">
                        <div className="h-20 w-20 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-300 mx-auto">
                            <Landmark size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight">Bank Details Missing</h3>
                            <p className="text-zinc-500 text-sm font-medium mt-2 leading-relaxed">
                                You need to set your bank details in your profile before you can withdraw funds.
                            </p>
                        </div>
                        <Link href="/profile" onClick={() => onOpenChange(false)}>
                            <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs transition-all w-full mt-4">
                                Go to Profile Settings
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
                            <div className="space-y-6">
                                {/* Saved Bank Display */}
                                <div className="p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-sm">
                                            <Landmark size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Receiving Bank</p>
                                            <p className="text-sm font-black text-zinc-900">{user.bank}</p>
                                            <p className="text-[10px] font-bold text-zinc-500 mt-0.5">{user.accountNumber}</p>
                                        </div>
                                    </div>
                                    {/* <Link href="/profile" onClick={() => onOpenChange(false)} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
                                        Change
                                    </Link> */}
                                </div>

                                {/* Wallet Selection */}
                                <FormField
                                    control={form.control}
                                    name="wallet"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Source Wallet</FormLabel>
                                            <SearchableSelect 
                                                items={wallets
                                                    .filter(w => w.type !== 'patronage')
                                                    .map(w => ({
                                                        label: `${w.type === 'direct' ? 'Wallet' : w.type === 'indirect' ? 'Gkwth Wallet' : 'Patronage Wallet'} (${w.type === 'direct' || w.type === 'patronage' ? '₦' : ''} ${w.amount.toLocaleString()}${w.type === 'indirect' ? ' gkwth' : ''})`,
                                                        value: w.id?.toString() || ""
                                                    }))
                                                }
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="Choose source wallet"
                                            />
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                {/* Amount */}
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => {
                                        const selectedWallet = wallets.find(w => w.id?.toString() === form.getValues('wallet'));
                                        const isIndirect = selectedWallet?.type === 'indirect';
                                        
                                        return (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                                                    Withdrawal Amount {isIndirect ? '(GKWTH Units)' : ''}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        {!isIndirect && <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-zinc-400">₦</span>}
                                                        <Input 
                                                            type="number" 
                                                            step={isIndirect ? "0.01" : "1"}
                                                            className={cn(
                                                                "h-16 rounded-2xl bg-zinc-50 border-none pr-6 font-black text-2xl text-zinc-900 focus-visible:ring-2 focus-visible:ring-indigo-600/20",
                                                                !isIndirect ? "pl-12" : "pl-6"
                                                            )}
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                        {isIndirect && <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-zinc-400 text-sm uppercase tracking-widest">gkwth</span>}
                                                    </div>
                                                </FormControl>
                                                {isIndirect && field.value > 0 && (
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 mt-1">
                                                        ≈ ₦{(field.value * gkwthPrice).toLocaleString()}
                                                    </p>
                                                )}
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        );
                                    }}
                                />

                                {/* PIN */}
                                <FormField
                                    control={form.control}
                                    name="withdrawal_pin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Withdrawal PIN</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="password"
                                                    maxLength={4}
                                                    placeholder="••••"
                                                    className="h-16 rounded-2xl bg-zinc-50 border-none px-6 font-black text-2xl tracking-[1em] text-center text-zinc-900 focus-visible:ring-2 focus-visible:ring-indigo-600/20" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : "Initiate Withdrawal"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
