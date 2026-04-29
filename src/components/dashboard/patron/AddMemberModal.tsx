'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAddPatronMemberMutation } from "@/store/api/patronApi";

const addMemberSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Invalid phone number"),
    password: z.string().optional(),
});

type AddMemberValues = z.infer<typeof addMemberSchema>;

interface AddMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddMemberModal({ open, onOpenChange }: AddMemberModalProps) {
    const [addMember, { isLoading }] = useAddPatronMemberMutation();

    const form = useForm<AddMemberValues>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
        },
    });

    const onSubmit = async (values: AddMemberValues) => {
        try {
            await addMember(values).unwrap();
            toast.success("Member added successfully!");
            onOpenChange(false);
            form.reset();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || "Failed to add member");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-black tracking-tighter">Add New Member</DialogTitle>
                        <DialogDescription className="text-indigo-100/70 font-medium">
                            Enroll a new patron member into your organization. They will receive their login credentials via SMS.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
                        <div className="space-y-4 p-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" className="h-12 rounded-xl bg-zinc-50 border-none px-4 font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-2 focus-visible:ring-indigo-600/20 transition-all" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="john@example.com" className="h-12 rounded-xl bg-zinc-50 border-none px-4 font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-2 focus-visible:ring-indigo-600/20 transition-all" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="08012345678" className="h-12 rounded-xl bg-zinc-50 border-none px-4 font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-2 focus-visible:ring-indigo-600/20 transition-all" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Optional Password</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="Leave blank for auto-generated" 
                                                className="h-12 rounded-xl bg-zinc-50 border-none px-4 font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-2 focus-visible:ring-indigo-600/20 transition-all" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormDescription className="text-[10px] text-zinc-400 font-medium">
                                            If left blank, a secure password will be generated and sent via SMS.
                                        </FormDescription>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-8 pb-8 px-8 border-t border-zinc-50">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => onOpenChange(false)}
                                className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Enroll Member
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
