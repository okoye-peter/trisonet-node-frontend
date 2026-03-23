'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { 
    useUpdatePasswordMutation, 
    useSendWithdrawalPinOtpMutation, 
    useResetWithdrawalPinMutation 
} from '@/store/api/userApi';

type TabType = 'password' | 'pin';

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

function TransactionPinTab() {
    const [pinData, setPinData] = useState({
        otp: '',
        newPin: '',
        confirmPin: ''
    });
    const [isOtpSent, setIsOtpSent] = useState(false);

    const [sendOtp, { isLoading: isSendingOtp }] = useSendWithdrawalPinOtpMutation();
    const [resetPin, { isLoading: isResettingPin }] = useResetWithdrawalPinMutation();

    const handleSendOtp = async () => {
        try {
            await sendOtp().unwrap();
            setIsOtpSent(true);
            toast.success("Verification code sent", {
                description: "Please check your phone for the reset code."
            });
        } catch (error: unknown) {
            const rtkError = error as { data?: { message?: string } };
            toast.error("Failed to send OTP", {
                description: rtkError?.data?.message || "Something went wrong"
            });
        }
    };

    const handleResetPin = async () => {
        if (!pinData.otp || !pinData.newPin || !pinData.confirmPin) {
            toast.error("Validation failed", { description: "All fields are required" });
            return;
        }

        if (pinData.newPin !== pinData.confirmPin) {
            toast.error("Validation failed", { description: "PINs do not match" });
            return;
        }

        if (pinData.newPin.length < 4) {
            toast.error("Validation failed", { description: "PIN must be at least 4 digits" });
            return;
        }

        try {
            await resetPin({
                otp: pinData.otp,
                newPin: pinData.newPin
            }).unwrap();
            toast.success("Transaction PIN reset successfully");
            setPinData({ otp: '', newPin: '', confirmPin: '' });
            setIsOtpSent(false);
        } catch (error: unknown) {
            const rtkError = error as { data?: { message?: string } };
            toast.error("Reset failed", {
                description: rtkError?.data?.message || "Could not reset transaction PIN"
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                {!isOtpSent ? (
                    <div className="p-8 rounded-[2rem] bg-linear-to-br from-zinc-50 to-white border border-zinc-100 shadow-sm space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-zinc-900">Reset Transaction PIN</h3>
                            <p className="text-sm text-zinc-500 font-medium">To protect your account, we need to verify your identity before you can change your withdrawal PIN.</p>
                        </div>
                        <Button
                            className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 transition-all active:scale-95 w-full sm:w-auto"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                        >
                            {isSendingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Verification Code'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Verification Code</Label>
                            <Input
                                className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                                placeholder="Enter OTP"
                                value={pinData.otp}
                                onChange={(e) => setPinData(prev => ({ ...prev, otp: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2.5">
                                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">New PIN</Label>
                                <Input
                                    type="password"
                                    className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                                    placeholder="••••"
                                    maxLength={6}
                                    value={pinData.newPin}
                                    onChange={(e) => setPinData(prev => ({ ...prev, newPin: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Confirm PIN</Label>
                                <Input
                                    type="password"
                                    className="h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900"
                                    placeholder="••••"
                                    maxLength={6}
                                    value={pinData.confirmPin}
                                    onChange={(e) => setPinData(prev => ({ ...prev, confirmPin: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 transition-all active:scale-95"
                                onClick={handleResetPin}
                                disabled={isResettingPin}
                            >
                                {isResettingPin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reset PIN'}
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                                onClick={() => setIsOtpSent(false)}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('pin');

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
        { id: 'pin', label: 'Transaction PIN', icon: Shield },
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
                <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Security Settings</h1>
                <p className="text-zinc-500 font-medium">Manage your transaction PIN and account password.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-3xl space-y-6">
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
                                    layoutId="active-settings-tab"
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
                                {activeTab === 'pin' && <TransactionPinTab />}
                                {activeTab === 'password' && <PasswordTab />}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
