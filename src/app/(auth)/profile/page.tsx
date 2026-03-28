'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { User, Mail, Shield, Award, Landmark, Phone, ShieldUser, LockKeyholeOpen, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/store/hooks';
import type { BankAccountDetail, User as UserType } from '@/types';
import { toast } from "sonner"
import {
    useUpdateProfileMutation,
    useUpdateBankDetailsMutation,
} from '@/store/api/userApi'
import { useGetBanksQuery, useResolveAccountMutation } from '@/store/api/bankApi';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { SearchableSelect } from '@/components/ui/searchable-select';


type TabType = 'personal' | 'bank';

interface PersonalInfoTabProps {
    user: UserType | null;
}

function PersonalInfoTab({ user }: PersonalInfoTabProps) {
    const [userDetail, setUserDetail] = useState({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        username: user?.username ?? '',
        puk: user?.unblockingCode ?? '',
    });

    const [updateUser, { isLoading: isPending }] = useUpdateProfileMutation();

    const handleUpdate = () => {
        if (!userDetail.name) {
            toast.error("Input validation failed", {
                description: "Name is required",
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            })
            return;
        }

        if (!userDetail.phone) {
            toast.error("Input validation failed", {
                description: "Phone number is required",
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            })
            return;
        }

        updateUser({ name: userDetail.name, phone: userDetail.phone }).unwrap().then(() => {
            toast.success("User profile updated successfully");
        }).catch(() => {
            toast.error("User profile update failed");
        });
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Full Name</Label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 transition-colors group-focus-within:text-indigo-500">
                            <User size={18} />
                        </div>
                        <Input
                            className="h-14 pl-12 rounded-[1.2rem] bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-zinc-900"
                            value={userDetail?.name}
                            onChange={(e) => setUserDetail((prev) => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Partnership Name</Label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 transition-colors group-focus-within:text-indigo-500">
                            <ShieldUser size={18} />
                        </div>
                        <Input className="h-14 pl-12 rounded-[1.2rem] bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-zinc-900" value={userDetail?.username} disabled />
                    </div>
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Email Address</Label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 transition-colors group-focus-within:text-indigo-500">
                            <Mail size={18} />
                        </div>
                        <Input className="h-14 pl-12 rounded-[1.2rem] bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-zinc-900" value={userDetail?.email} disabled />
                    </div>
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Phone Number</Label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 transition-colors group-focus-within:text-indigo-500">
                            <Phone size={18} />
                        </div>
                        <Input
                            className="h-14 pl-12 rounded-[1.2rem] bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-zinc-900"
                            placeholder="+1 (555) 000-0000"
                            value={userDetail?.phone}
                            onChange={(e) => setUserDetail((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="space-y-2.5 sm:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">PUK</Label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 transition-colors group-focus-within:text-indigo-500">
                            <LockKeyholeOpen size={18} />
                        </div>
                        <Input
                            className="h-14 pl-12 rounded-[1.2rem] bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-zinc-900"
                            placeholder="PUK"
                            value={userDetail?.puk}
                            disabled
                            onChange={(e) => setUserDetail((prev) => ({ ...prev, puk: e.target.value }))}
                        />
                    </div>
                </div>
            </div>
            <Button className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 transition-all active:scale-95" onClick={handleUpdate} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Information'}
            </Button>
        </div>
    );
}

interface BankTabProps {
    user: UserType | null;
}

function BankTab({ user }: BankTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [bankData, setBankData] = useState({
        bank: user?.bank ?? '',
        bankUUID: '',
        accountNumber: user?.accountNumber ?? '',
        accountName: user?.name ?? '',
        currentPassword: '',
    });

    const [resolveAccount, { isLoading: isResolving }] = useResolveAccountMutation();
    const [updateBankDetails, { isLoading: isUpdating }] = useUpdateBankDetailsMutation();

    const { data: banksResponse, isLoading: isBanksLoading } = useGetBanksQuery();
    const banks = banksResponse?.data || [];

    const { data: bankDetails, isLoading: isBankDetailsLoading } = useQuery<BankAccountDetail>({
        queryKey: ['user'],
        queryFn: () => api.get('/users/me').then((res) => res.data?.data?.user),
        enabled: !!user?.bank && !!user?.accountNumber && !isBanksLoading && banks.length > 0
    })

    const handleResolveAccount = useCallback(async (accountNumber?: string, bankUUID?: string) => {
        const acc = accountNumber ?? bankData.accountNumber;
        const bnk = bankUUID ?? bankData.bankUUID;

        if (acc.length >= 10 && bnk) {
            try {
                const res = await resolveAccount({
                    bankUUID: bnk,
                    accountNumber: acc
                }).unwrap();
                if (res?.data) {
                    const resolvedData = res.data as BankAccountDetail;
                    setBankData(prev => ({ ...prev, accountName: resolvedData.accountName }));
                }
            } catch {
                setBankData(prev => ({ ...prev, accountName: '' }));
            }
        }
    }, [bankData.accountNumber, bankData.bankUUID, resolveAccount]);

    if (isBanksLoading || isBankDetailsLoading) {
        return <div className="flex items-center justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
    }

    const handleSave = async () => {
        if (!bankData.bank || !bankData.accountNumber) {
            toast.error("Validation failed", {
                description: "Bank name and account number are required",
            });
            return;
        }

        if (!bankData.currentPassword) {
            toast.error("Validation failed", {
                description: "Password is required to update bank details",
            });
            return;
        }

        try {
            const updateData = {
                bank: bankData.bank,
                accountNumber: bankData.accountNumber,
                currentPassword: bankData.currentPassword,
            };

            await updateBankDetails(updateData).unwrap();

            toast.success("Bank details updated successfully");
            setIsEditing(false);
            setBankData(prev => ({ ...prev, otp: '' }));
        } catch (error: unknown) {
            const rtkError = error as { data?: { message?: string } };
            toast.error("Update failed", {
                description: rtkError?.data?.message || "Could not update bank details",
            });
        }
    };


    if (user?.bank && user?.accountNumber) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="relative group perspective-1000">
                    <motion.div 
                        whileHover={{ rotateY: 5, rotateX: -5, scale: 1.02 }}
                        className="p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-linear-to-br from-zinc-900 via-zinc-800 to-black text-white shadow-2xl shadow-indigo-500/10 relative overflow-hidden transition-all duration-500"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-24 -mb-24" />
                        
                        <div className="absolute top-8 right-8 opacity-20 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-700">
                            <Landmark size={80} strokeWidth={1.5} />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Connected Bank</p>
                                    <h3 className="text-xl md:text-3xl font-black tracking-tight bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent truncate max-w-[200px] md:max-w-none">
                                        {user.bank}
                                    </h3>
                                </div>
                                <div className="h-12 w-16 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 opacity-50" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Account Number</p>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <p className="text-lg md:text-3xl font-mono font-bold tracking-tight md:tracking-[0.2em]">
                                            {user.accountNumber.replace(/(\d{3})(\d{4})(\d{3})/, '**** **** $3')}
                                        </p>
                                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Active
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1">Account Holder</p>
                                        <p className="font-bold text-sm md:text-lg tracking-wide uppercase text-zinc-200 truncate max-w-[150px] md:max-w-none">
                                            {bankDetails?.accountName || user.name}
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1">Status</p>
                                        <p className="font-black text-xs uppercase tracking-widest text-indigo-400">Verified Account</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col gap-4">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-[1.5rem] bg-indigo-50/50 border border-indigo-100/50 flex items-start gap-4 backdrop-blur-sm"
                    >
                        <Shield className="text-indigo-600 mt-1 shrink-0" size={18} />
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-indigo-900 mb-1.5">Security Protocol</p>
                            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                                For your protection, bank details are encrypted and locked once verified. 
                                Changes require official documentation and support verification.
                            </p>
                        </div>
                    </motion.div>
                    
                    <Button 
                        variant="ghost" 
                        disabled
                        className="h-10 text-[10px] font-black uppercase tracking-widest text-zinc-400"
                    >
                        To update details, please contact trisonet support
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Bank Name</Label>
                    <SearchableSelect
                        items={banks?.map((bank) => ({ label: bank.name, value: bank.uuid })) ?? []}
                        value={bankData.bankUUID}
                        onValueChange={(val) => {
                            const bank = banks.find(b => b.uuid === val);
                            setBankData(prev => ({
                                ...prev,
                                bankUUID: val ?? '',
                                bank: bank?.name ?? '',
                                accountName: ''
                            }));
                            if (bankData.accountNumber.length === 10 && val) {
                                handleResolveAccount(bankData.accountNumber, val);
                            }
                        }}
                        placeholder="Select your bank"
                        triggerClassName="w-full h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                    />
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Account Number</Label>
                    <div className="relative">
                        <Input
                            className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                            placeholder="0000000000"
                            value={bankData.accountNumber}
                            onChange={(e) => {
                                const val = e.target.value;
                                setBankData(prev => ({ ...prev, accountNumber: val }));
                                if (val.length === 10 && bankData.bankUUID) {
                                    handleResolveAccount(val, bankData.bankUUID);
                                } else if (val.length < 10) {
                                    setBankData(prev => ({ ...prev, accountName: '' }));
                                }
                            }}
                        />
                        {isResolving && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-400" />}
                    </div>
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Account Name</Label>
                    <div className="relative">
                        <Input
                            className={cn(
                                "h-14 px-6 rounded-[1.2rem] border-none font-bold transition-all duration-300",
                                bankData.accountName
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-zinc-50 text-zinc-400"
                            )}
                            value={bankData.accountName}
                            placeholder={isResolving ? "Resolving..." : "Validated Account Name"}
                            disabled
                        />
                        <AnimatePresence>
                            {bankData.accountName && !isResolving && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
                                >
                                    <CheckCircle2 size={20} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Current Password</Label>
                    <div className="relative">
                        <Input
                            type="password"
                            className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                            value={bankData.currentPassword}
                            placeholder="Enter your current password"
                            onChange={(e) => setBankData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <Button
                    className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 transition-all active:scale-95"
                    onClick={handleSave}
                    disabled={isUpdating}
                >
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Bank Details'}
                </Button>
                {isEditing && (
                    <Button
                        variant="ghost"
                        className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    );
}





export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth);



    const [activeTab, setActiveTab] = useState<TabType>('personal');

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
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    };

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'bank', label: 'Bank', icon: Landmark },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Account Settings</h1>
                <p className="text-zinc-500 font-medium">Manage your personal information, banking details and security.</p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Profile Card */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <Card className="border-none bg-white shadow-sm overflow-hidden rounded-[2.5rem]">
                        <div className="h-32 bg-linear-to-br from-indigo-600 to-purple-600" />
                        <CardContent className="relative pt-0 text-center pb-8 px-8">
                            <div className="absolute left-1/2 -top-12 -translate-x-1/2">
                                <div className="h-24 w-24 rounded-full border-4 border-white bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-3xl text-white shadow-xl capitalize">
                                    {user?.name?.[0] || 'U'}
                                </div>
                            </div>
                            <div className="mt-16">
                                <h2 className="text-xl font-black text-zinc-900 leading-tight capitalize">{user?.name || 'User Name'}</h2>
                                <p className="text-sm text-zinc-400 font-bold uppercase tracking-wider mt-1">Member Since 2024</p>
                                <div className="mt-4 flex justify-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
                                        <Award size={12} className="text-indigo-500" /> Gold Tier
                                    </span>
                                </div>
                                <div className="mt-8 pt-8 border-t border-zinc-50 space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-zinc-500">
                                        <Mail size={16} className="opacity-40" />
                                        <span className="text-xs font-bold truncate">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-zinc-500">
                                        <Shield size={16} className="opacity-40" />
                                        <span className="text-xs font-bold">Account Verified</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Column: Tabbed Content */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    {/* Tab Switcher */}
                    <div className="flex p-1.5 bg-zinc-100 rounded-[2rem] w-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "flex-1 relative flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300",
                                    activeTab === tab.id ? "text-white" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-profile-tab"
                                        className="absolute inset-0 bg-zinc-900 rounded-[1.5rem] shadow-lg shadow-zinc-200"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <tab.icon size={14} className="relative z-10" />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-none bg-white shadow-sm rounded-[2rem] overflow-hidden">
                                <CardContent className="p-4 sm:p-10">
                                    {activeTab === 'personal' && (
                                        <PersonalInfoTab
                                            user={user}
                                            key={user?.id ?? 'loading'}
                                        />
                                    )}


                                    {activeTab === 'bank' && <BankTab user={user} key={user?.id ?? 'loading-bank'} />}

                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
}
