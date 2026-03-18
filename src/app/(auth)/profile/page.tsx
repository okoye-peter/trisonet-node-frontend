'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { User, Mail, Shield, Award, Landmark, Lock, Phone, ShieldUser, LockKeyholeOpen, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/store/hooks';
import type { Bank, BankAccountDetail, User as UserType } from '@/types';
import { toast } from "sonner"
import { useUpdateProfileMutation, useUpdatePasswordMutation, useSendOtpMutation } from '@/store/api/userApi'
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type TabType = 'personal' | 'bank' | 'password';

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
        accountNumber: user?.accountNumber ?? '',
        accountName: user?.name ?? '',
        otp: '',
        currentPassword: ''
    });

    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const isUpdating = false; // Placeholder for bank update mutation loading state


    const { data: banks, isLoading } = useQuery<Bank[]>({
        queryKey: ['banks'],
        queryFn: () => api.get('/api/banks').then((res) => res.data?.data?.banks)
    })

    const { data: bankDetails, isLoading: isBankDetailsLoading } = useQuery<BankAccountDetail>({
        queryKey: ['user'],
        queryFn: () => api.get('/api/users/me').then((res) => res.data?.data?.user),
        enabled: !!user?.bank && !!user?.accountNumber && !isLoading && !!banks && banks.length > 0
    })

    if (isLoading || isBankDetailsLoading) {
        return <div className="flex items-center justify-center h-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
    }

    const handleSave = async () => {
        if (!bankData.bank || !bankData.accountNumber) {
            toast.error("Validation failed", {
                description: "Bank name and account number are required",
            });
            return;
        }

        try {
            toast.success("Bank details updated successfully");
            setIsEditing(false);
            setBankData(prev => ({ ...prev, otp: '', currentPassword: '' }));
        } catch (error: any) {
            toast.error("Update failed", {
                description: error?.data?.message || "Could not update bank details",
            });
        }
    };

    const handleSendOtp = async () => {
        try {
            await sendOtp().unwrap();
            toast.success("OTP sent successfully", {
                description: "Checks your email for the 6-digit verification code",
            });
        } catch {
            toast.error("Failed to send OTP", {
                description: "Please try again later",
            });
        }
    };

    if (user?.bank && user?.accountNumber && !isEditing) {
        return (
            <div className="space-y-8">
                <div className="p-8 rounded-[2rem] bg-linear-to-br from-zinc-900 to-zinc-800 text-white shadow-2xl shadow-zinc-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 duration-500">
                        <Landmark size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Current Bank</p>
                            <h3 className="text-2xl font-black">{user.bank}</h3>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Account Number</p>
                                <p className="text-xl font-mono font-bold tracking-widest">
                                    {user.accountNumber.replace(/(\d{3})(\d{4})(\d{3})/, '$1 **** $3')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Account Name</p>
                                <p className="font-bold text-sm uppercase">{bankDetails?.accountName ?? '...'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="h-14 px-8 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                    >
                        Reset Bank Details
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2.5 sm:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Bank Name</Label>
                    <Select
                        items={banks?.map((bank) => ({ label: bank.name, value: bank.name })) ?? []}
                        value={bankData.bank}
                        onValueChange={(val) => setBankData(prev => ({ ...prev, bank: val ?? '' }))}
                    >
                        <SelectTrigger className="w-full h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900">
                            <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent>
                            {banks?.map((bank) => (
                                <SelectItem key={bank.uuid} value={bank.name}>
                                    {bank.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Account Number</Label>
                    <Input
                        className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                        placeholder="0000000000"
                        value={bankData.accountNumber}
                        onChange={(e) => setBankData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    />
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Account Name</Label>
                    <Input
                        className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                        value={bankData.accountName}
                        disabled
                    />
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Current Password</Label>
                    <Input
                        type="password"
                        className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                        placeholder="••••••••"
                        value={bankData.currentPassword}
                        onChange={(e) => setBankData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Verification Code (OTP)</Label>
                    <div className="flex gap-2">
                        <Input
                            className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                            placeholder="123456"
                            maxLength={6}
                            value={bankData.otp}
                            onChange={(e) => setBankData(prev => ({ ...prev, otp: e.target.value }))}
                        />
                        <Button 
                            type="button"
                            variant="outline"
                            className="h-14 px-6 rounded-[1.2rem] border-zinc-100 font-black uppercase tracking-widest text-[10px] whitespace-nowrap"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                        >
                            {isSendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                        </Button>
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

function PasswordTab() {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        password: '',
        confirmPassword: ''
    })

    const [updatePassword, { isLoading: isPending }] = useUpdatePasswordMutation();

    const handleUpdate = async () => {
        if (!passwordData.currentPassword || !passwordData.password || !passwordData.confirmPassword) {
            toast.error("Validation failed", {
                description: "All fields are required",
            });
            return;
        }

        if (passwordData.password !== passwordData.confirmPassword) {
            toast.error("Validation failed", {
                description: "Passwords do not match",
            });
            return;
        }

        try {
            await updatePassword(passwordData).unwrap();
            toast.success("Password updated successfully");
            setPasswordData({
                currentPassword: '',
                password: '',
                confirmPassword: ''
            });
        } catch (error: unknown) {
            console.error(error);
            let errorMessage = "Password update failed";

            const rtkError = error as { data?: { message?: string } };
            if (rtkError?.data?.message) {
                errorMessage = rtkError.data.message;
            }
            toast.error("Password update failed", {
                description: errorMessage,
            });
        }
    }

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Current Password</Label>
                    <Input
                        type="password"
                        className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">New Password</Label>
                    <Input
                        type="password"
                        className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                        value={passwordData.password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                    />
                </div>
                <div className="space-y-2.5">
                    <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Confirm New Password</Label>
                    <Input
                        type="password"
                        className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                </div>
            </div>
            <Button
                className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 transition-all active:scale-95"
                onClick={handleUpdate}
                disabled={isPending}
            >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Security'}
            </Button>
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
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any } }
    };

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'bank', label: 'Bank', icon: Landmark },
        { id: 'password', label: 'Password', icon: Lock },
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
                                <div className="h-24 w-24 rounded-full border-4 border-white bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-3xl text-white shadow-xl">
                                    {user?.name?.[0] || 'U'}
                                </div>
                            </div>
                            <div className="mt-16">
                                <h2 className="text-xl font-black text-zinc-900 leading-tight">{user?.name || 'User Name'}</h2>
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
                                <CardContent className="p-10">
                                    {activeTab === 'personal' && (
                                        <PersonalInfoTab
                                            user={user}
                                            key={user?.id ?? 'loading'}
                                        />
                                    )}


                                    {activeTab === 'bank' && <BankTab user={user} key={user?.id ?? 'loading-bank'} />}

                                    {activeTab === 'password' && <PasswordTab />}

                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
}
