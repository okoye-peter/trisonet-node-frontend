'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { TrendingUp, Wallet, Search, Loader2 } from "lucide-react";
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
import { useCreditPatronMemberMutation, useGetPatronMembersQuery } from "@/store/api/patronApi";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

const creditSchema = z.object({
    member_id: z.string().min(1, "Please select a member"),
    amount: z.coerce.number().min(1000, "Minimum credit amount is ₦1,000"),
});

type CreditValues = z.infer<typeof creditSchema>;

interface CreditMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentBalance: number;
}

export function CreditMemberModal({ open, onOpenChange, currentBalance }: CreditMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    
    const { data: membersData, isFetching } = useGetPatronMembersQuery({ 
        search: debouncedSearch,
        page: 1 
    }, {
        skip: !open // Only fetch when modal is open
    });

    const [creditMember, { isLoading: isSubmitting }] = useCreditPatronMemberMutation();

    const form = useForm<CreditValues>({
        resolver: zodResolver(creditSchema),
        defaultValues: {
            member_id: "",
            amount: 1000,
        },
    });

    const onSubmit = async (values: CreditValues) => {
        if (values.amount > currentBalance) {
            toast.error("Insufficient organization balance");
            return;
        }

        try {
            await creditMember(values).unwrap();
            toast.success("Member credited successfully!");
            handleClose();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || "Failed to credit member");
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        form.reset();
        setSearchQuery("");
    };

    const memberOptions = (membersData?.data?.members || []).map(m => ({
        label: m.name,
        value: m.id,
        subLabel: m.email
    }));

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-purple-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-black tracking-tighter">Credit Member</DialogTitle>
                        <DialogDescription className="text-purple-100/70 font-medium">
                            Transfer funds from the organization wallet to a member's direct wallet.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                        <div className="space-y-6">
                            <div className="bg-zinc-50 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-zinc-400">
                                        <Wallet size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Org. Balance</p>
                                        <p className="text-lg font-black text-zinc-900 tracking-tighter">₦{currentBalance.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="member_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Member</FormLabel>
                                        <SearchableSelect 
                                            items={memberOptions}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Search members by name or email..."
                                            searchValue={searchQuery}
                                            onSearchChange={setSearchQuery}
                                            isLoading={isFetching}
                                        />
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount to Credit</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400">₦</span>
                                                <Input type="number" className="h-14 rounded-xl bg-zinc-50 border-none pl-10 pr-4 font-black text-xl text-zinc-900 placeholder:text-zinc-300 transition-all focus-visible:ring-2 focus-visible:ring-purple-600/20" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
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
                                disabled={isSubmitting}
                                className="h-12 px-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <TrendingUp size={16} className="mr-2" /> Distribute Funds
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
