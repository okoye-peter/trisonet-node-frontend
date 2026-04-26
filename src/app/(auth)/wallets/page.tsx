'use client';

import { 
    TrendingUp, 
    ArrowRightLeft,
    Plus,
    ShieldCheck,
    ArrowUpRight,
    CheckCircle2,
    RefreshCcw,
    Lock,
    Loader2,
    Copy,
    Clock,
    CheckCircle,
    AlertCircle,
    MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    walletApi, 
    useGetWalletsQuery, 
    useInitiateDirectWalletFundingMutation, 
    useLazyCheckFundingStatusQuery 
} from '@/store/api/walletApi';
import { useGetBanksQuery, useResolveAccountMutation, useGetUserBankQuery } from '@/store/api/bankApi';
import { useInitiateWithdrawalMutation } from '@/store/api/withdrawalApi';
import { useGetUserQuery } from '@/store/api/userApi';
import LoadingScreen from '@/components/LoadingScreen';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TransferModal } from '@/components/wallets/TransferModal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PagaOptions {
    amount: number;
    email?: string;
    phoneNumber?: string;
    publicKey: string;
    referenceNumber: string;
    onSuccess?: (response: unknown) => void;
    onError?: (error: unknown) => void;
    onClose?: () => void;
    [key: string]: unknown;
}

declare global {
    interface Window {
        PagaCheckout: {
            setOptions: (options: PagaOptions) => void;
            openCheckout: () => void;
        };
    }
}

type TabType = 'overview' | 'fund' | 'withdraw';

const NairaIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
    <span className={cn("font-bold flex items-center justify-center", className)} style={{ fontSize: size }}>₦</span>
);

const walletConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string; gradient: string }> = {
    direct: { 
        label: 'Direct Wallet', 
        icon: NairaIcon, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-100',
        gradient: 'from-emerald-600 to-teal-600'
    },
};

export default function WalletsPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: userResponse } = useGetUserQuery();
    const profile = userResponse?.data || user;

    const { data: userBankResponse, isLoading: isUserBankLoading } = useGetUserBankQuery(undefined, {
        skip: !profile?.bank || !profile?.accountNumber
    });
    const userBankDetail = userBankResponse?.data;

    const { data: walletsResponse, isLoading: isWalletsLoading, refetch: refetchWallets } = useGetWalletsQuery();
    const { data: banksResponse } = useGetBanksQuery();
    const [resolveAccount, { isLoading: isResolving }] = useResolveAccountMutation();
    const [initiateWithdrawal, { isLoading: isWithdrawing }] = useInitiateWithdrawalMutation();

    const wallets = walletsResponse?.data || [];
    const banks = useMemo(() => banksResponse?.data || [], [banksResponse?.data]);
    const directWallet = wallets.find(w => w.type === 'direct');

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const [initiateWalletFunding, { isLoading: isInitiatingFunding }] = useInitiateDirectWalletFundingMutation();
    const [checkStatus] = useLazyCheckFundingStatusQuery();

    // Funding Modal States
    const [fundingData, setFundingData] = useState<{
        reference: string;
        amount: number;
        publicKey: string;
        email: string;
        phone: string;
        account_detail: {
            account_name: string;
            bank_name: string;
            account_number: string;
            expiry_date: string;
        };
    } | null>(null);
    const [showBankModal, setShowBankModal] = useState(false);
    const [showPollingModal, setShowPollingModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(2000); // Start with 2s
    const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);

    const handleFundWallet = async () => {
        if (!fundAmount || Number(fundAmount) < 500) {
            toast.error('Minimum funding amount is ₦500');
            return;
        }

        try {
            const res = await initiateWalletFunding({ amount: Number(fundAmount) }).unwrap();
            
            if (!res.data) {
                toast.error('Failed to initiate funding: No data returned');
                return;
            }

            setFundingData(res.data);
            setShowBankModal(true);
        } catch (err: unknown) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to initiate funding');
        }
    };

    const startPolling = () => {
        setShowBankModal(false);
        setShowPollingModal(true);
        setPollingStartTime(Date.now());
        setPollingInterval(2000);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        const poll = async () => {
            if (!showPollingModal || !fundingData?.reference || !pollingStartTime) return;

            const timeElapsed = Date.now() - pollingStartTime;
            const maxDuration = 90000; // 1 minute 30 seconds

            if (timeElapsed >= maxDuration) {
                setShowPollingModal(false);
                setShowPendingModal(true);
                return;
            }

            try {
                const res = await checkStatus(fundingData.reference).unwrap();
                if (res.data?.status === 'success') {
                    setShowPollingModal(false);
                    setShowSuccessModal(true);
                    refetchWallets();
                    dispatch(walletApi.util.invalidateTags(['Wallet']));
                    return;
                }
            } catch (err) {
                console.error('Polling error:', err);
            }

            // Exponential backoff
            const nextInterval = Math.min(pollingInterval * 1.5, 10000); // Cap at 10s
            setPollingInterval(nextInterval);
            timer = setTimeout(poll, nextInterval);
        };

        if (showPollingModal) {
            timer = setTimeout(poll, pollingInterval);
        }

        return () => clearTimeout(timer);
    }, [showPollingModal, fundingData, pollingStartTime, pollingInterval, checkStatus, refetchWallets, dispatch]);

    // Form States
    const [fundAmount, setFundAmount] = useState('');
    const [withdrawData, setWithdrawData] = useState({
        bank_code: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        amount: '',
        pin: '',
        otp: ''
    });

    // Check for bank details when switching to withdraw tab
    useEffect(() => {
        if (activeTab === 'withdraw' && profile) {
            if (!profile.bank || !profile.accountNumber) {
                toast.error('Please set your bank details in your profile before withdrawing.');
                const timer = setTimeout(() => {
                    router.push('/profile');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [activeTab, profile, router]);

    const isPrefilled = useRef(false);

    // Prefill withdrawal data from user profile
    useEffect(() => {
        if (profile && activeTab === 'withdraw' && profile.bank && profile.accountNumber && banks.length > 0 && !isPrefilled.current) {
            const lowerProfileBank = profile.bank.toLowerCase();
            const userBank = banks.find((b: { name: string; uuid: string }) => 
                b.name.toLowerCase() === lowerProfileBank || 
                b.name.toLowerCase().includes(lowerProfileBank)
            );
            if (userBank) {
                const timer = setTimeout(() => {
                    setWithdrawData(prev => ({
                        ...prev,
                        account_number: profile.accountNumber || '',
                        bank_name: userBank.name,
                        bank_code: userBank.uuid || '',
                    }));
                }, 0);
                isPrefilled.current = true;
                return () => clearTimeout(timer);
            }
        }
    }, [profile, activeTab, banks]);

    // Reset prefilled state when tab changes
    useEffect(() => {
        if (activeTab !== 'withdraw') {
            isPrefilled.current = false;
        }
    }, [activeTab]);

    const handleResolveAccount = useCallback(async (accountNumber?: string, bankUUID?: string) => {
        const acc = accountNumber ?? withdrawData.account_number;
        const bnk = bankUUID ?? withdrawData.bank_code;
        
        if (acc.length >= 10 && bnk) {
            try {
                const res = await resolveAccount({
                    bankUUID: bnk,
                    accountNumber: acc
                }).unwrap();
                if (res.data && res.data.isValid) {
                    setWithdrawData(prev => ({ ...prev, account_name: res.data!.accountName }));
                } else {
                    setWithdrawData(prev => ({ ...prev, account_name: '' }));
                    if (res.data && !res.data.isValid) {
                        toast.error('The account details could not be validated');
                    }
                }
            } catch (err: unknown) {
                setWithdrawData(prev => ({ ...prev, account_name: '' }));
                const apiErr = err as { data?: { message?: string } };
                toast.error(apiErr.data?.message || 'Failed to resolve account');
            }
        }
    }, [withdrawData.account_number, withdrawData.bank_code, resolveAccount, setWithdrawData]);

    // Auto-resolve when prefilled
    useEffect(() => {
        const shouldResolve = 
            activeTab === 'withdraw' && 
            withdrawData.account_number.length === 10 && 
            withdrawData.bank_code && 
            !withdrawData.account_name && 
            !isResolving;

        if (shouldResolve) {
            const timer = setTimeout(() => {
                handleResolveAccount();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [activeTab, withdrawData.account_number, withdrawData.bank_code, withdrawData.account_name, isResolving, handleResolveAccount]);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!directWallet) {
            toast.error('Wallet not found. Please refresh and try again.');
            return;
        }

        if (!withdrawData.amount || Number(withdrawData.amount) <= 0) {
            toast.error('Please enter a valid amount to withdraw.');
            return;
        }
        

        if (profile?.role === 8 && !withdrawData.otp) {
            toast.error('Please enter your withdrawal OTP.');
            return;
        }

        if (profile?.role !== 8 && !withdrawData.pin) {
            toast.error('Please enter your transaction PIN.');
            return;
        }

        const resolvedAccountName = userBankDetail?.accountName || withdrawData.account_name;

        if (!resolvedAccountName) {
            toast.error('Please wait for account resolution or enter valid details.');
            return;
        }
        
        try {
            await initiateWithdrawal({
                amount: Number(withdrawData.amount),
                bank_code: withdrawData.bank_code,
                bank_name: withdrawData.bank_name,
                account_name: resolvedAccountName,
                account_number: withdrawData.account_number,
                wallet: directWallet.id!.toString(),
                ...(profile?.role === 8 
                    ? { withdrawal_otp: withdrawData.otp } 
                    : { withdrawal_pin: withdrawData.pin }
                )
            }).unwrap();
            
            toast.success('Withdrawal request initiated successfully');
            setActiveTab('overview');
        } catch (err) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Withdrawal failed');
        }
    };

    if (isWalletsLoading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                <TransferModal open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen} />

                {/* Hero Balance Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[3rem] bg-zinc-900 p-12 text-white shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl bg-indigo-500 w-96 h-96 rounded-full -mr-48 -mt-48 animate-pulse" />
                    <div className="absolute bottom-0 left-0 p-12 opacity-10 blur-3xl bg-emerald-500 w-96 h-96 rounded-full -ml-48 -mb-48 animate-pulse" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Total Direct Balance</span>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl md:text-6xl font-black text-zinc-500">₦</span>
                                <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
                                    {directWallet?.amount.toLocaleString() ?? '0.00'}
                                </h1>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-4 py-1 rounded-full font-bold">
                                    <TrendingUp size={14} className="mr-1 inline" /> +2.4% this week
                                </Badge>
                            </div>
                        </div>

                        {/* User Account Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mt-8 pt-8 border-t border-white/10">
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-left group hover:bg-white/10 transition-all">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Account Name</p>
                                <p className="text-lg font-black text-white truncate">{profile?.name || '---'}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-left group hover:bg-white/10 transition-all flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Account Number</p>
                                    <p className="text-lg font-black text-white tracking-wider truncate">
                                        {profile?.transferId || '---'}
                                    </p>
                                </div>
                                {profile?.transferId && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => {
                                            navigator.clipboard.writeText(profile.transferId!);
                                            toast.success('Account number copied!');
                                        }}
                                        className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
                                    >
                                        <Copy size={18} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Switcher */}
                <div className="flex justify-center">
                    <div className="inline-flex p-1.5 bg-zinc-200/50 backdrop-blur-md rounded-2xl border border-zinc-200">
                        {['overview', 'fund', 'withdraw'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as TabType)}
                                className={cn(
                                    "relative px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 capitalize",
                                    activeTab === tab ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white shadow-sm rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Overview Content */}
                    {activeTab === 'overview' && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            <div className="flex justify-center">
                                {directWallet && (
                                    <div className="w-full max-w-sm">
                                        <Card className="group border-none bg-white p-1 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 ring-1 ring-zinc-100 overflow-hidden">
                                            <CardContent className="p-8 bg-white rounded-[2.3rem]">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className={cn("rounded-2xl p-4 shadow-sm", walletConfig.direct.bg, walletConfig.direct.color)}>
                                                        <NairaIcon size={24} />
                                                    </div>
                                                    <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest border-2", walletConfig.direct.border, walletConfig.direct.color)}>
                                                        Primary
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-3">{walletConfig.direct.label}</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold text-zinc-400">₦</span>
                                                    <h3 className="text-3xl font-black tracking-tighter text-zinc-900">{directWallet.amount.toLocaleString()}</h3>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 justify-center">
                                <Button 
                                    onClick={() => setIsTransferModalOpen(true)}
                                    className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-2xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
                                >
                                    <ArrowRightLeft size={20} />
                                    Internal Transfer
                                </Button>
                                <Link href="/wallets/transfers">
                                    <Button variant="outline" className="h-16 px-10 rounded-2xl font-black border-zinc-200 hover:bg-zinc-50 transition-all flex items-center gap-3">
                                        <RefreshCcw size={20} />
                                        History
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* Fund Content */}
                    {activeTab === 'fund' && (
                        <motion.div 
                            key="fund"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-2xl mx-auto w-full"
                        >
                            <Card className="border-none bg-white rounded-[3rem] p-4 shadow-2xl ring-1 ring-zinc-100">
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-zinc-900">Fund Your Wallet</h2>
                                            <p className="text-sm text-zinc-500 font-medium italic">Instant deposit to your direct account.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">Deposit Amount</Label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-400">₦</div>
                                                <Input 
                                                    value={fundAmount}
                                                    onChange={(e) => setFundAmount(e.target.value)}
                                                    placeholder="0.00" 
                                                    className="h-20 pl-12 text-3xl font-black rounded-2xl bg-zinc-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={handleFundWallet}
                                            disabled={isInitiatingFunding}
                                            className="w-full h-20 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-black shadow-2xl shadow-indigo-100 transition-all font-inter disabled:opacity-50"
                                        >
                                            {isInitiatingFunding ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="animate-spin" />
                                                    Processing...
                                                </div>
                                            ) : (
                                                "Fund Wallet"
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Withdraw Content */}
                    {activeTab === 'withdraw' && (
                        <motion.div 
                            key="withdraw"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-3xl mx-auto w-full"
                        >
                            <Card className="border-none bg-white rounded-[3rem] p-4 shadow-2xl ring-1 ring-zinc-100">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                            <ArrowUpRight size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-zinc-900">Withdraw Funds</h2>
                                            <p className="text-sm text-zinc-500 font-medium italic">Secure transfer to your linked bank account.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleWithdraw} className="space-y-8">
                                        {profile?.bank && profile?.accountNumber ? (
                                            <div className="p-6 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Withdrawal Bank</p>
                                                        <p className="text-xl font-black text-zinc-900">{profile.bank}</p>
                                                    </div>
                                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Number</p>
                                                        <p className="text-xl font-black text-zinc-900">{profile.accountNumber}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Name</p>
                                                            <Link href="/profile" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
                                                                Change Details
                                                            </Link>
                                                        </div>
                                                        <p className="text-xl font-black text-zinc-900 truncate">
                                                            {userBankDetail?.accountName || withdrawData.account_name || (isResolving || isUserBankLoading ? 'Resolving...' : '---')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">Select Bank</Label>
                                                    <SearchableSelect
                                                        items={banks.map((bank: { name: string; uuid: string }) => ({ label: bank.name, value: bank.uuid }))}
                                                        value={withdrawData.bank_code}
                                                        onValueChange={(val: string) => {
                                                            const bank = banks.find((b: { name: string; uuid: string }) => b.uuid === val);
                                                            setWithdrawData(prev => ({ ...prev, bank_code: val || '', bank_name: bank?.name || '', account_name: '' }));
                                                            if (withdrawData.account_number.length >= 10 && val) {
                                                                handleResolveAccount(withdrawData.account_number, val);
                                                            }
                                                        }}
                                                        placeholder="Choose your bank"
                                                        triggerClassName="h-14 rounded-2xl bg-zinc-50 border-none font-bold text-zinc-900"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">Account Number</Label>
                                                    <div className="relative">
                                                        <Input 
                                                            value={withdrawData.account_number}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if(isNaN(parseInt(val))) return;
                                                                setWithdrawData(prev => ({ ...prev, account_number: val }));
                                                                if (val.length === 10 && withdrawData.bank_code) {
                                                                    handleResolveAccount(val, withdrawData.bank_code);
                                                                } else if (val.length < 10) {
                                                                    setWithdrawData(prev => ({ ...prev, account_name: '' }));
                                                                }
                                                            }}
                                                            placeholder="8103078096"
                                                            className="h-14 rounded-2xl bg-zinc-50 border-none font-bold placeholder:text-zinc-300"
                                                        />
                                                        {isResolving && <Loader2 size={20} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-400" />}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">Account Name</Label>
                                                <div className="relative">
                                                    <Input 
                                                        value={userBankDetail?.accountName || withdrawData.account_name}
                                                        readOnly
                                                        placeholder={isResolving || isUserBankLoading ? "Resolving..." : "Validated Account Name"}
                                                        className={cn(
                                                            "h-16 rounded-2xl border-none font-black transition-all duration-300",
                                                            (userBankDetail?.accountName || withdrawData.account_name) 
                                                                ? "bg-emerald-50 text-emerald-600" 
                                                                : "bg-zinc-50 text-zinc-400 placeholder:text-zinc-300"
                                                        )}
                                                    />
                                                    <AnimatePresence>
                                                        {(userBankDetail?.accountName || withdrawData.account_name) && !isResolving && !isUserBankLoading && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.5 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.5 }}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 bg-emerald-100/50 p-1 rounded-full"
                                                            >
                                                                <CheckCircle2 size={20} />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                        <div className="grid md:grid-cols-2 gap-6 items-end">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">Amount to Withdraw</Label>
                                                <div className="relative">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400">₦</div>
                                                    <Input 
                                                        value={withdrawData.amount}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if(isNaN(parseFloat(val))) return;
                                                            setWithdrawData(prev => ({ ...prev, amount: val }))}}
                                                        placeholder="0"
                                                        className="h-20 pl-12 text-3xl font-black rounded-2xl bg-zinc-50 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        type="number"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">
                                                    {profile?.role === 8 ? 'Withdrawal OTP' : 'Transaction PIN'}
                                                </Label>
                                                <div className="relative">
                                                    <Input 
                                                        value={profile?.role === 8 ? withdrawData.otp : withdrawData.pin}
                                                        onChange={(e) => setWithdrawData(prev => ({ 
                                                            ...prev, 
                                                            [profile?.role === 8 ? 'otp' : 'pin']: e.target.value 
                                                        }))}
                                                        type={profile?.role === 8 ? 'text' : 'password'}
                                                        maxLength={profile?.role === 8 ? 6 : 4}
                                                        placeholder={profile?.role === 8 ? "000000" : "****"}
                                                        className="h-20 text-center text-3xl tracking-widest font-black rounded-2xl bg-zinc-50 border-none placeholder:text-zinc-200"
                                                    />
                                                    <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" />
                                                </div>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit"
                                            disabled={isWithdrawing}
                                            className="w-full h-20 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-black shadow-2xl shadow-emerald-100 transition-all disabled:opacity-50"
                                        >
                                            {isWithdrawing ? "Processing..." : "Withdraw Funds"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Section */}
                {activeTab === 'overview' && (
                    <div className="grid gap-8 lg:grid-cols-2">
                        <Card className="border-none bg-linear-to-br from-indigo-900 via-indigo-900 to-indigo-800 text-white rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <ShieldCheck size={160} />
                            </div>
                            <CardContent className="p-0 relative z-10">
                                <h2 className="text-4xl font-black tracking-tighter mb-6">Secured Transactions</h2>
                                <p className="text-indigo-100 font-medium max-w-sm mb-10 text-lg leading-relaxed italic">
                                    Every transfer is encrypted and verified by multiple security layers.
                                </p>
                                <Button className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-black h-14 px-10 transition-all">
                                    Security Settings
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-100 bg-white rounded-[3rem] p-10 flex flex-col justify-center items-center text-center group transition-all hover:shadow-2xl">
                            <div className="h-20 w-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp className="text-indigo-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900 mb-4">GKWTH Wallet</h3>
                            <p className="text-zinc-500 font-medium mb-10 max-w-[280px] italic leading-relaxed">
                                Manage your GKWTH (Indirect) balance and assets with specialized tools.
                            </p>
                            <Link href="/wallets/gkwth">
                                <Button variant="outline" className="rounded-2xl border-zinc-200 font-black h-14 px-10 hover:bg-zinc-50">
                                    Switch to GKWTH
                                </Button>
                            </Link>
                        </Card>
                    </div>
                )}
            </div>

            {/* Bank Details Modal */}
            <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
                <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-[2rem] md:rounded-[2.5rem] border-none p-0 overflow-y-auto bg-white shadow-2xl">
                    <div className="bg-indigo-600 p-6 md:p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Plus size={120} />
                        </div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-xl md:text-2xl font-black">Transfer Details</DialogTitle>
                            <DialogDescription className="text-indigo-100 font-medium text-xs md:text-sm">
                                Follow the instructions below to fund your wallet.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-6 md:p-8 md:pb-12 space-y-6">
                        {/* Noticeable Amount Card */}
                        <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 text-center space-y-3 shadow-sm">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Amount to Transfer</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-3xl md:text-4xl font-black text-indigo-600">₦</span>
                                <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter">
                                    {fundingData?.amount?.toLocaleString()}
                                </h1>
                            </div>
                            <div className="flex justify-center pt-1">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                        if (fundingData?.amount) {
                                            navigator.clipboard.writeText(fundingData.amount.toString());
                                            toast.success('Amount copied!');
                                        }
                                    }}
                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:bg-indigo-100 rounded-full bg-white/50 border border-indigo-100/50"
                                >
                                    <Copy size={12} className="mr-2" /> Copy Amount
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-zinc-50 rounded-2xl flex items-center justify-between group hover:bg-zinc-100 transition-colors">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bank Name</p>
                                    <p className="text-lg font-black text-zinc-900">{fundingData?.account_detail?.bank_name}</p>
                                </div>
                                <div className="p-2 bg-white rounded-lg shadow-xs group-hover:scale-110 transition-transform">
                                    <Plus className="text-indigo-600" size={20} />
                                </div>
                            </div>

                            <div className="p-4 bg-zinc-50 rounded-2xl flex items-center justify-between group hover:bg-zinc-100 transition-colors">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Number</p>
                                    <p className="text-lg font-black text-zinc-900 tracking-wider">{fundingData?.account_detail?.account_number}</p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                        if (fundingData?.account_detail?.account_number) {
                                            navigator.clipboard.writeText(fundingData.account_detail.account_number);
                                            toast.success('Account number copied!');
                                        }
                                    }}
                                    className="bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl shadow-xs"
                                >
                                    <Copy size={18} />
                                </Button>
                            </div>

                            <div className="p-4 bg-zinc-50 rounded-2xl group hover:bg-zinc-100 transition-colors">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Name</p>
                                <p className="text-lg font-black text-zinc-900">{fundingData?.account_detail?.account_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl text-amber-700">
                            <Clock size={20} className="shrink-0" />
                            <p className="text-xs font-bold leading-relaxed italic">
                                This account expires at {fundingData?.account_detail?.expiry_date}. Please complete the transfer before then.
                            </p>
                        </div>

                        <Button 
                            onClick={startPolling}
                            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 transition-all mb-4"
                        >
                            I&apos;ve Made The Transfer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Polling/Processing Modal */}
            <Dialog open={showPollingModal} onOpenChange={() => {}}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm rounded-[2rem] md:rounded-[2.5rem] border-none p-0 overflow-y-auto bg-white shadow-2xl">
                    <div className="p-6 md:p-12 md:pb-16 text-center space-y-6 relative">
                        <div className="absolute top-0 inset-x-0 h-2 bg-zinc-100 overflow-hidden rounded-t-[2rem] md:rounded-t-[2.5rem]">
                            <motion.div 
                                className="h-full bg-indigo-600"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            />
                        </div>
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25" />
                            <div className="relative h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                                <Loader2 className="animate-spin" size={40} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-zinc-900 italic">Verifying Payment</h2>
                            <p className="text-sm text-zinc-500 font-medium">
                                We&apos;re checking your transfer details. This usually takes less than a minute.
                            </p>
                        </div>
                        <div className="flex justify-center gap-1.5 pt-4">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="h-2 w-2 bg-indigo-600 rounded-full"
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                />
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm rounded-[2rem] md:rounded-[3rem] border-none p-0 overflow-y-auto bg-white shadow-2xl">
                    <div className="bg-emerald-500 p-8 md:p-12 text-center text-white relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                            className="relative h-24 w-24 bg-white text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl mb-6"
                        >
                            <CheckCircle size={56} />
                        </motion.div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-2 italic">Success!</h2>
                        <p className="text-emerald-50 font-medium italic text-xs md:text-sm">Wallet Funded Successfully</p>
                    </div>
                    <div className="p-6 md:p-8 md:pb-12 space-y-6 text-center">
                        <div className="space-y-1">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Amount Credited</p>
                            <p className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter">₦{fundingData?.amount?.toLocaleString()}</p>
                        </div>
                        <Button 
                            onClick={() => {
                                setShowSuccessModal(false);
                                setActiveTab('overview');
                            }}
                            className="w-full h-16 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl shadow-emerald-100 transition-all font-inter"
                        >
                            Back to Overview
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Pending/Timeout Modal */}
            <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
                <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-[2rem] md:rounded-[2.5rem] border-none p-0 overflow-y-auto bg-white shadow-2xl">
                    <div className="bg-amber-500 p-8 md:p-12 text-center text-white relative">
                        <div className="relative h-20 w-20 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={48} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black italic">Still Processing</h2>
                        <p className="text-amber-50 font-medium italic text-xs md:text-sm">We haven&apos;t confirmed your payment yet.</p>
                    </div>
                    <div className="p-6 md:p-8 md:pb-12 space-y-8">
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-zinc-50 rounded-2xl items-start">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-zinc-900 text-sm italic">Don&apos;t worry!</p>
                                    <p className="text-xs text-zinc-500 font-medium">Your request is still in our queue and will be processed shortly.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-zinc-50 rounded-2xl items-start">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-zinc-900 text-sm italic">Need help?</p>
                                    <p className="text-xs text-zinc-500 font-medium">If your funds don&apos;t appear in 30 minutes, please contact support for assistance.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button 
                                variant="outline"
                                onClick={() => setShowPendingModal(false)}
                                className="w-full h-16 rounded-2xl border-zinc-200 font-black text-zinc-600 hover:bg-zinc-50 transition-all font-inter"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
