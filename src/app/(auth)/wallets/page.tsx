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
import { useCurrencySymbol } from '@/hooks/useCurrencySymbol';

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

const NairaIcon = ({ size = 24, className }: { size?: number, className?: string }) => {
    const currency = useCurrencySymbol();
    return <span className={cn("font-bold flex items-center justify-center", className)} style={{ fontSize: size }}>{currency}</span>;
};

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
    const currency = useCurrencySymbol();
    const { data: userResponse } = useGetUserQuery();
    const profile = userResponse?.data?.user || user;

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
            toast.error(`Minimum funding amount is ${currency}500`);
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
            <div className="p-4 mx-auto space-y-8 md:p-8 max-w-7xl">
                <TransferModal open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen} />

                {/* Hero Balance Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[3rem] bg-zinc-900 p-12 text-white shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-12 -mt-48 -mr-48 bg-indigo-500 rounded-full opacity-10 blur-3xl w-96 h-96 animate-pulse" />
                    <div className="absolute bottom-0 left-0 p-12 -mb-48 -ml-48 rounded-full opacity-10 blur-3xl bg-emerald-500 w-96 h-96 animate-pulse" />

                    <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
                        <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">Total Wallet Balance</span>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-black md:text-6xl text-zinc-500">{currency}</span>
                                <h1 className="text-6xl font-black tracking-tighter md:text-8xl">
                                    {directWallet?.amount.toLocaleString() ?? '0.00'}
                                </h1>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="px-4 py-1 font-bold border-none rounded-full bg-emerald-500/20 text-emerald-400">
                                    <TrendingUp size={14} className="inline mr-1" /> +2.4% this week
                                </Badge>
                            </div>
                        </div>

                        {/* User Account Details */}
                        <div className="grid w-full max-w-xl grid-cols-1 gap-4 pt-8 mt-8 border-t md:grid-cols-2 border-white/10">
                            <div className="p-4 text-left transition-all border bg-white/5 backdrop-blur-md rounded-2xl border-white/10 group hover:bg-white/10">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Account Name</p>
                                <p className="text-lg font-black text-white truncate">{profile?.name || '---'}</p>
                            </div>
                            <div className="flex items-center justify-between p-4 text-left transition-all border bg-white/5 backdrop-blur-md rounded-2xl border-white/10 group hover:bg-white/10">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Account Number</p>
                                    <p className="text-lg font-black tracking-wider text-white truncate">
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
                                        className="w-10 h-10 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
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
                                                    <span className="text-2xl font-bold text-zinc-400">{currency}</span>
                                                    <h3 className="text-3xl font-black tracking-tighter text-zinc-900">{directWallet.amount.toLocaleString()}</h3>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button 
                                    onClick={() => setIsTransferModalOpen(true)}
                                    className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-2xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
                                >
                                    <ArrowRightLeft size={20} />
                                    Internal Transfer
                                </Button>
                                <Link href="/wallets/transfers">
                                    <Button variant="outline" className="flex items-center h-16 gap-3 px-10 font-black transition-all rounded-2xl border-zinc-200 hover:bg-zinc-50">
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
                            className="w-full max-w-2xl mx-auto"
                        >
                            <Card className="border-none bg-white rounded-[3rem] p-4 shadow-2xl ring-1 ring-zinc-100">
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 text-indigo-600 bg-indigo-50 rounded-2xl">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-zinc-900">Fund Your Wallet</h2>
                                            <p className="text-sm italic font-medium text-zinc-500">Instant deposit to your direct account.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-400">Deposit Amount</Label>
                                            <div className="relative">
                                                <div className="absolute text-2xl font-bold -translate-y-1/2 left-6 top-1/2 text-zinc-400">{currency}</div>
                                                <Input 
                                                    value={fundAmount}
                                                    onChange={(e) => setFundAmount(e.target.value)}
                                                    placeholder="0.00" 
                                                    className="h-20 pl-12 text-3xl font-black transition-all border-none rounded-2xl bg-zinc-50 focus-visible:ring-2 focus-visible:ring-indigo-600"
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={handleFundWallet}
                                            disabled={isInitiatingFunding}
                                            className="w-full h-20 text-xl font-black text-white transition-all bg-indigo-600 shadow-2xl rounded-2xl hover:bg-indigo-700 shadow-indigo-100 font-inter disabled:opacity-50"
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
                            className="w-full max-w-3xl mx-auto"
                        >
                            <Card className="border-none bg-white rounded-[3rem] p-4 shadow-2xl ring-1 ring-zinc-100">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                            <ArrowUpRight size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-zinc-900">Withdraw Funds</h2>
                                            <p className="text-sm italic font-medium text-zinc-500">Secure transfer to your linked bank account.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleWithdraw} className="space-y-8">
                                        {profile?.bank && profile?.accountNumber ? (
                                            <div className="p-6 space-y-4 border border-dashed bg-zinc-50 rounded-2xl border-zinc-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Withdrawal Bank</p>
                                                        <p className="text-xl font-black text-zinc-900">{profile.bank}</p>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                </div>
                                                <div className="grid gap-4 pt-4 border-t md:grid-cols-2 border-zinc-100">
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
                                                        <p className="text-xl font-black truncate text-zinc-900">
                                                            {userBankDetail?.accountName || withdrawData.account_name || (isResolving || isUserBankLoading ? 'Resolving...' : '---')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-400">Select Bank</Label>
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
                                                    <Label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-400">Account Number</Label>
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
                                                            className="font-bold border-none h-14 rounded-2xl bg-zinc-50 placeholder:text-zinc-300"
                                                        />
                                                        {isResolving && <Loader2 size={20} className="absolute -translate-y-1/2 right-4 top-1/2 animate-spin text-zinc-400" />}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                            <div className="space-y-2">
                                                <Label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-400">Account Name</Label>
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
                                                                className="absolute p-1 -translate-y-1/2 rounded-full right-4 top-1/2 text-emerald-500 bg-emerald-100/50"
                                                            >
                                                                <CheckCircle2 size={20} />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                        <div className="grid items-end gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-400">Amount to Withdraw</Label>
                                                <div className="relative">
                                                    <div className="absolute text-xl font-bold -translate-y-1/2 left-6 top-1/2 text-zinc-400">{currency}</div>
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
                                                <Label className="ml-1 text-xs font-black tracking-widest uppercase text-zinc-400">
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
                                                        className="h-20 text-3xl font-black tracking-widest text-center border-none rounded-2xl bg-zinc-50 placeholder:text-zinc-200"
                                                    />
                                                    <Lock size={18} className="absolute -translate-y-1/2 left-6 top-1/2 text-zinc-300" />
                                                </div>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit"
                                            disabled={isWithdrawing}
                                            className="w-full h-20 text-xl font-black text-white transition-all shadow-2xl rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 disabled:opacity-50"
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
                            <div className="absolute top-0 right-0 p-8 transition-transform duration-700 opacity-10 group-hover:scale-110">
                                <ShieldCheck size={160} />
                            </div>
                            <CardContent className="relative z-10 p-0">
                                <h2 className="mb-6 text-4xl font-black tracking-tighter">Secured Transactions</h2>
                                <p className="max-w-sm mb-10 text-lg italic font-medium leading-relaxed text-indigo-100">
                                    Every transfer is encrypted and verified by multiple security layers.
                                </p>
                                <Button className="px-10 font-black text-white transition-all border rounded-2xl bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 h-14">
                                    Security Settings
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-100 bg-white rounded-[3rem] p-10 flex flex-col justify-center items-center text-center group transition-all hover:shadow-2xl">
                            <div className="flex items-center justify-center w-20 h-20 mb-8 transition-transform duration-500 rounded-3xl bg-indigo-50 group-hover:scale-110">
                                <TrendingUp className="text-indigo-600" size={40} />
                            </div>
                            <h3 className="mb-4 text-2xl font-black text-zinc-900">GKWTH Wallet</h3>
                            <p className="text-zinc-500 font-medium mb-10 max-w-[280px] italic leading-relaxed">
                                Manage your GKWTH (Indirect) balance and assets with specialized tools.
                            </p>
                            <Link href="/wallets/gkwth">
                                <Button variant="outline" className="px-10 font-black rounded-2xl border-zinc-200 h-14 hover:bg-zinc-50">
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
                    <div className="relative p-6 overflow-hidden text-white bg-indigo-600 md:p-8">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Plus size={120} />
                        </div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-xl font-black md:text-2xl">Transfer Details</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-indigo-100 md:text-sm">
                                Follow the instructions below to fund your wallet.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-6 space-y-6 md:p-8 md:pb-12">
                        {/* Noticeable Amount Card */}
                        <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 text-center space-y-3 shadow-sm">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Amount to Transfer</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-3xl font-black text-indigo-600 md:text-4xl">{currency}</span>
                                <h1 className="text-4xl font-black tracking-tighter md:text-6xl text-zinc-900">
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
                            <div className="flex items-center justify-between p-4 transition-colors bg-zinc-50 rounded-2xl group hover:bg-zinc-100">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bank Name</p>
                                    <p className="text-lg font-black text-zinc-900">{fundingData?.account_detail?.bank_name}</p>
                                </div>
                                <div className="p-2 transition-transform bg-white rounded-lg shadow-xs group-hover:scale-110">
                                    <Plus className="text-indigo-600" size={20} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 transition-colors bg-zinc-50 rounded-2xl group hover:bg-zinc-100">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Number</p>
                                    <p className="text-lg font-black tracking-wider text-zinc-900">{fundingData?.account_detail?.account_number}</p>
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
                                    className="text-indigo-600 bg-white shadow-xs hover:bg-indigo-50 rounded-xl"
                                >
                                    <Copy size={18} />
                                </Button>
                            </div>

                            <div className="p-4 transition-colors bg-zinc-50 rounded-2xl group hover:bg-zinc-100">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Name</p>
                                <p className="text-lg font-black text-zinc-900">{fundingData?.account_detail?.account_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl text-amber-700">
                            <Clock size={20} className="shrink-0" />
                            <p className="text-xs italic font-bold leading-relaxed">
                                This account expires at {fundingData?.account_detail?.expiry_date}. Please complete the transfer before then.
                            </p>
                        </div>

                        <Button 
                            onClick={startPolling}
                            className="w-full h-16 mb-4 font-black text-white transition-all bg-indigo-600 shadow-xl rounded-2xl hover:bg-indigo-700 shadow-indigo-100"
                        >
                            I&apos;ve Made The Transfer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Polling/Processing Modal */}
            <Dialog open={showPollingModal} onOpenChange={() => {}}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm rounded-[2rem] md:rounded-[2.5rem] border-none p-0 overflow-y-auto bg-white shadow-2xl">
                    <div className="relative p-6 space-y-6 text-center md:p-12 md:pb-16">
                        <div className="absolute top-0 inset-x-0 h-2 bg-zinc-100 overflow-hidden rounded-t-[2rem] md:rounded-t-[2.5rem]">
                            <motion.div 
                                className="h-full bg-indigo-600"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            />
                        </div>
                        <div className="relative inline-flex">
                            <div className="h-24 w-24 rounded-full border-4 border-[#6639ff]/10 border-t-[#6639ff] animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={32} className="text-[#6639ff] animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-black text-zinc-900 text-2xl tracking-tight">Verifying Payment</h4>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed px-6">
                                Confirming your transfer — this may take up to 2 minutes. Do not close this page.
                            </p>
                        </div>
                        <div className="bg-[#6639ff]/5 border border-[#6639ff]/10 px-5 py-3 rounded-2xl inline-block">
                            <p className="text-[10px] font-black text-[#6639ff] uppercase tracking-widest animate-pulse">
                                Polling Transaction Status…
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm rounded-[2rem] md:rounded-[3rem] border-none p-0 overflow-y-auto bg-white shadow-2xl">
                    <div className="relative p-8 text-center text-white bg-emerald-500 md:p-12">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                            className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-white rounded-full shadow-2xl text-emerald-500"
                        >
                            <CheckCircle size={56} />
                        </motion.div>
                        <h2 className="mb-2 text-2xl italic font-black tracking-tighter md:text-3xl">Success!</h2>
                        <p className="text-xs italic font-medium text-emerald-50 md:text-sm">Wallet Funded Successfully</p>
                    </div>
                    <div className="p-6 space-y-6 text-center md:p-8 md:pb-12">
                        <div className="space-y-1">
                            <p className="text-xs font-black tracking-widest uppercase text-zinc-400">Amount Credited</p>
                            <p className="text-3xl font-black tracking-tighter md:text-4xl text-zinc-900">{currency}{fundingData?.amount?.toLocaleString()}</p>
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
                    <div className="relative p-8 text-center text-white bg-amber-500 md:p-12">
                        <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6 text-white rounded-full bg-white/20">
                            <AlertCircle size={48} />
                        </div>
                        <h2 className="text-xl italic font-black md:text-2xl">Still Processing</h2>
                        <p className="text-xs italic font-medium text-amber-50 md:text-sm">We haven&apos;t confirmed your payment yet.</p>
                    </div>
                    <div className="p-6 space-y-8 md:p-8 md:pb-12">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl">
                                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-sm italic font-black text-zinc-900">Don&apos;t worry!</p>
                                    <p className="text-xs font-medium text-zinc-500">Your request is still in our queue and will be processed shortly.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl">
                                <div className="p-2 text-indigo-600 rounded-lg bg-indigo-50">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-sm italic font-black text-zinc-900">Need help?</p>
                                    <p className="text-xs font-medium text-zinc-500">If your funds don&apos;t appear in 30 minutes, please contact support for assistance.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button 
                                variant="outline"
                                onClick={() => setShowPendingModal(false)}
                                className="w-full h-16 font-black transition-all rounded-2xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-inter"
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
