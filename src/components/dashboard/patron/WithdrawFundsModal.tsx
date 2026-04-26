'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Landmark, Loader2, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const withdrawSchema = z.object({
    wallet: z.string().min(1, "Please select a wallet"),
    bank_uuid: z.string().min(1, "Please select a bank"),
    account_number: z.string().length(10, "Account number must be 10 digits"),
    account_name: z.string().min(1, "Please resolve account name"),
    amount: z.coerce.number().min(1000, "Minimum withdrawal is ₦1,000"),
    withdrawal_otp: z.string().length(6, "OTP must be 6 digits"),
});

type WithdrawValues = z.infer<typeof withdrawSchema>;

interface WithdrawFundsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    wallets: WalletType[];
}

export function WithdrawFundsModal({ open, onOpenChange, wallets }: WithdrawFundsModalProps) {
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [resolvedAccount, setResolvedAccount] = useState<string | null>(null);

    const { data: banksData, isLoading: isLoadingBanks } = useGetBanksQuery();
    const [resolveAccount, { isLoading: isResolving }] = useResolveAccountMutation();
    const [sendOtp, { isLoading: isSendingOtp }] = useSendPatronWithdrawalOtpMutation();
    const [initiateWithdrawal, { isLoading: isSubmitting }] = useInitiateWithdrawalMutation();

    const form = useForm<WithdrawValues>({
        resolver: zodResolver(withdrawSchema),
        defaultValues: {
            wallet: wallets.find(w => w.type === 'direct')?.id.toString() || "",
            bank_uuid: "",
            account_number: "",
            account_name: "",
            amount: 1000,
            withdrawal_otp: "",
        },
    });

    // Reset resolved name if bank or account changes
    const bankUuid = form.watch('bank_uuid');
    const accountNumber = form.watch('account_number');

    useEffect(() => {
        setResolvedAccount(null);
        form.setValue('account_name', '');
    }, [bankUuid, accountNumber, form]);

    const handleResolve = async () => {
        const bank = form.getValues('bank_uuid');
        const accNo = form.getValues('account_number');

        if (!bank || accNo.length !== 10) {
            toast.error("Please select a bank and enter a 10-digit account number");
            return;
        }

        try {
            const res = await resolveAccount({ bankUUID: bank, accountNumber: accNo }).unwrap();
            if (res.data?.accountName) {
                const name = res.data.accountName.toUpperCase();
                setResolvedAccount(name);
                form.setValue('account_name', name);
                toast.success("Account resolved successfully");
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to resolve account details");
        }
    };

    const handleSendOtp = async () => {
        try {
            await sendOtp().unwrap();
            toast.success("OTP sent to your registered email");
            setOtpCountdown(60);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to send OTP");
        }
    };

    useEffect(() => {
        if (otpCountdown > 0) {
            const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpCountdown]);

    const onSubmit = async (values: WithdrawValues) => {
        const selectedWallet = wallets.find(w => w.id.toString() === values.wallet);
        if (!selectedWallet || selectedWallet.amount < values.amount) {
            toast.error("Insufficient wallet balance");
            return;
        }

        const selectedBank = banksData?.data?.find(b => b.uuid === values.bank_uuid);
        if (!selectedBank) return;

        try {
            await initiateWithdrawal({
                amount: values.amount,
                bank_code: selectedBank.uuid, // Using UUID as bank_code for backend Paga/Withdrawal logic
                bank_name: selectedBank.name,
                account_name: values.account_name,
                account_number: values.account_number,
                wallet: values.wallet,
                withdrawal_otp: values.withdrawal_otp,
            }).unwrap();

            toast.success("Withdrawal initiated and under review");
            handleClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to initiate withdrawal");
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        form.reset();
        setResolvedAccount(null);
        setOtpCountdown(0);
    };

    const bankOptions = (banksData?.data || []).map(b => ({
        label: b.name,
        value: b.uuid,
    }));

    const directWallet = wallets.find(w => w.type === 'direct');

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-black tracking-tighter">Withdraw Funds</DialogTitle>
                        <DialogDescription className="text-indigo-100/70 font-medium">
                            Transfer money from your organization wallet to your bank account.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 gap-6">

                            {/* Bank Selection */}
                            <FormField
                                control={form.control}
                                name="bank_uuid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Bank</FormLabel>
                                        <SearchableSelect 
                                            items={bankOptions}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={isLoadingBanks ? "Loading banks..." : "Choose your bank"}
                                            isLoading={isLoadingBanks}
                                        />
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            {/* Account Number & Resolve */}
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <FormField
                                        control={form.control}
                                        name="account_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Account Number</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="0123456789" 
                                                        maxLength={10}
                                                        className="h-14 rounded-xl bg-zinc-50 border-none px-4 font-bold text-zinc-900 focus-visible:ring-2 focus-visible:ring-indigo-600/20" 
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button 
                                    type="button" 
                                    onClick={handleResolve}
                                    disabled={isResolving || accountNumber.length !== 10 || !bankUuid}
                                    className="h-14 px-6 rounded-xl bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isResolving ? <Loader2 size={16} className="animate-spin" /> : "Resolve"}
                                </Button>
                            </div>

                            {/* Resolved Name */}
                            {resolvedAccount && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3 border border-emerald-100"
                                >
                                    <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                                    <p className="text-xs font-bold text-emerald-700">{resolvedAccount}</p>
                                </motion.div>
                            )}

                            {/* Amount & OTP */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400">₦</span>
                                                    <Input type="number" className="h-14 rounded-xl bg-zinc-50 border-none pl-10 pr-4 font-black text-zinc-900 focus-visible:ring-2 focus-visible:ring-indigo-600/20" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex justify-between">
                                        Confirmation OTP
                                        {otpCountdown > 0 && <span className="text-indigo-600">0:{otpCountdown.toString().padStart(2, '0')}</span>}
                                    </FormLabel>
                                    <div className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name="withdrawal_otp"
                                            render={({ field }) => (
                                                <div className="flex-1">
                                                    <FormControl>
                                                        <Input 
                                                            maxLength={6}
                                                            placeholder="000000"
                                                            className="h-14 rounded-xl bg-zinc-50 border-none px-4 font-black text-center tracking-[0.5em] text-zinc-900 focus-visible:ring-2 focus-visible:ring-indigo-600/20" 
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                </div>
                                            )}
                                        />
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={handleSendOtp}
                                            disabled={isSendingOtp || otpCountdown > 0}
                                            className="h-14 w-14 rounded-xl border-zinc-200 hover:bg-zinc-50 text-indigo-600 transition-all active:scale-95"
                                        >
                                            {isSendingOtp ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                        </Button>
                                    </div>
                                    <FormMessage className="text-[10px] font-bold text-red-500" />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-zinc-50">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={handleClose}
                                className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-zinc-400"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !resolvedAccount}
                                className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Landmark size={16} className="mr-2" />}
                                Withdraw Funds
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
