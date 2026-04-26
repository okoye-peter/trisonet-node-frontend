'use client';

import { 
    TrendingUp, 
    ArrowRightLeft,
    ShieldCheck,
    RefreshCcw,
    Loader2,
    Plus,
    Clock,
    CheckCircle,
    CheckCircle2,
    AlertCircle,
    MessageCircle,
    Lock,
    Copy,
    ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useGetWalletsQuery, useGetGkwthPricesQuery, useInitiateIndirectGkwthFundingMutation, useLazyCheckFundingStatusQuery, walletApi } from '@/store/api/walletApi';
import { useGetBanksQuery, useResolveAccountMutation, useGetUserBankQuery } from '@/store/api/bankApi';
import { useInitiateWithdrawalMutation } from '@/store/api/withdrawalApi';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

type TabType = 'overview' | 'fund' | 'sell';

const NairaIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
    <span className={cn("font-bold flex items-center justify-center", className)} style={{ fontSize: size }}>₦</span>
);

export default function GkwthWalletPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: walletsResponse, isLoading: isWalletsLoading, refetch: refetchWallets } = useGetWalletsQuery();
    const { data: pricesResponse } = useGetGkwthPricesQuery();
    const { data: banksResponse } = useGetBanksQuery();
    const [resolveAccount, { isLoading: isResolving }] = useResolveAccountMutation();
    const [initiateWithdrawal, { isLoading: isWithdrawing }] = useInitiateWithdrawalMutation();
    const [initiateGkwthFunding, { isLoading: isPurchasing }] = useInitiateIndirectGkwthFundingMutation();
    const [checkStatus] = useLazyCheckFundingStatusQuery();
    const wallets = walletsResponse?.data || [];
    const banks = useMemo(() => banksResponse?.data || [], [banksResponse]);
    const indirectWallet = wallets.find(w => w.type === 'indirect');
    const prices = pricesResponse?.data;

    const purchasePrice = Number(prices?.gkwthPurchasePrice) || 0;
    const salePrice = Number(prices?.gkwthSalePrice) || 0;

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const { data: userBankResponse } = useGetUserBankQuery(undefined, { skip: !user?.bank || !user?.accountNumber || activeTab !== 'sell' });
    const userBankDetails = userBankResponse?.data;
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<{
        account_name: string;
        bank_name: string;
        account_number: string;
        amount: number;
        expiry_date: string;
        reference: string;
    } | null>(null);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [showPollingModal, setShowPollingModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(2000);
    const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);

    // Form States
    const [fundQuantity, setFundQuantity] = useState('');
    const [withdrawData, setWithdrawData] = useState({
        bank_code: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        amount: '',
        pin: '',
        otp: ''
    });

    useEffect(() => {
        if (user && activeTab === 'sell' && !withdrawData.account_number) {
            const timer = setTimeout(() => {
                setWithdrawData(prev => ({
                    ...prev,
                    account_number: user.accountNumber || '',
                    bank_name: user.bank || '',
                }));
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [user, activeTab, withdrawData.account_number]);

    // Check for bank details when switching to sell tab
    useEffect(() => {
        if (activeTab === 'sell' && user) {
            if (!user.bank || !user.accountNumber) {
                toast.error('Please set your bank details in your profile before withdrawing.');
                const timer = setTimeout(() => {
                    router.push('/profile');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [activeTab, user, router]);

    const [isPrefilled, setIsPrefilled] = useState(false);

    // Prefill withdrawal data from user profile
    useEffect(() => {
        if (user && activeTab === 'sell' && user.bank && user.accountNumber && banks.length > 0 && !isPrefilled) {
            const userBank = banks.find(b => 
                b.name.toLowerCase() === user.bank?.toLowerCase() || 
                b.name.toLowerCase().includes(user.bank?.toLowerCase() || '')
            );
            if (userBank) {
                const timer = setTimeout(() => {
                    setWithdrawData(prev => ({
                        ...prev,
                        account_number: user.accountNumber || '',
                        bank_name: user.bank || '',
                        bank_code: userBank.uuid
                    }));
                    setIsPrefilled(true);
                }, 0);
                return () => clearTimeout(timer);
            }
        }
    }, [user, activeTab, banks, isPrefilled]);

    // Reset prefilled state when tab changes
    useEffect(() => {
        if (activeTab !== 'sell') {
            const timer = setTimeout(() => {
                setIsPrefilled(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);

    // Sync resolved name from backend if available
    useEffect(() => {
        if (userBankDetails?.accountName && !withdrawData.account_name) {
            const timer = setTimeout(() => {
                setWithdrawData(prev => ({ ...prev, account_name: userBankDetails.accountName }));
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [userBankDetails, withdrawData.account_name]);

    const handleResolveAccount = useCallback(async (accountNumber?: string, bankUUID?: string) => {
        const acc = accountNumber ?? withdrawData.account_number;
        const bnk = bankUUID ?? withdrawData.bank_code;
        
        if (acc.length >= 10 && bnk) {
            try {
                const res = await resolveAccount({
                    bankUUID: bnk,
                    accountNumber: acc
                }).unwrap();
                if (res.data) {
                    setWithdrawData(prev => ({ ...prev, account_name: res.data!.accountName }));
                }
            } catch {
                setWithdrawData(prev => ({ ...prev, account_name: '' }));
            }
        }
    }, [withdrawData.account_number, withdrawData.bank_code, resolveAccount, setWithdrawData]);

    // Auto-resolve when prefilled
    useEffect(() => {
        const shouldResolve = 
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
    }, [withdrawData.account_number, withdrawData.bank_code, withdrawData.account_name, handleResolveAccount, isResolving]);
    const startPolling = () => {
        setIsPaymentModalOpen(false);
        setShowPollingModal(true);
        setPollingStartTime(Date.now());
        setPollingInterval(2000);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        const poll = async () => {
            if (!showPollingModal || !paymentDetails?.reference || !pollingStartTime) return;

            const timeElapsed = Date.now() - pollingStartTime;
            const maxDuration = 90000; // 1 minute 30 seconds

            if (timeElapsed >= maxDuration) {
                setShowPollingModal(false);
                setShowPendingModal(true);
                return;
            }

            try {
                const res = await checkStatus(paymentDetails.reference).unwrap();
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
            const nextInterval = Math.min(pollingInterval * 1.5, 10000);
            setPollingInterval(nextInterval);
            timer = setTimeout(poll, nextInterval);
        };

        if (showPollingModal) {
            timer = setTimeout(poll, pollingInterval);
        }

        return () => clearTimeout(timer);
    }, [showPollingModal, paymentDetails, pollingStartTime, pollingInterval, checkStatus, refetchWallets, dispatch]);

    const handleFund = async (e: React.FormEvent) => {
        e.preventDefault();
        const quantity = Number(fundQuantity);
        
        if (!fundQuantity || quantity < 0.5) {
            toast.error('Minimum purchase quantity is 0.5 GKWTH');
            return;
        }

        try {
            const res = await initiateGkwthFunding({ gkwthAmount: quantity }).unwrap();
            
            // The new endpoint might return account_detail nested or direct, 
            // but based on my earlier check it returns { reference, amount, account_detail: { ... } }
            if (res.data?.account_detail) {
                setPaymentDetails({
                    ...res.data.account_detail,
                    amount: res.data.amount, // amount is outside account_detail in this response
                    reference: res.data.reference
                });
                setIsPaymentModalOpen(true);
                toast.success('Virtual account generated successfully');
            }
        } catch (err) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to initiate purchase');
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!indirectWallet) {
            toast.error('GKWTH Wallet not found. Please refresh and try again.');
            return;
        }

        const availableAmount = (indirectWallet?.amount ?? 0) > 1 ? (Number(indirectWallet?.amount ?? 1) - 1) : 0;
        
        if (!withdrawData.amount || Number(withdrawData.amount) < 1) {
            toast.error('Minimum withdrawal is 1 GKWTH.');
            return;
        }

        if (Number(withdrawData.amount) > availableAmount) {
            toast.error(`Insufficient balance. Max available: ${availableAmount.toLocaleString()} GKWTH`);
            return;
        }

        if (user?.role === 8 && !withdrawData.otp) {
            toast.error('Please enter your withdrawal OTP.');
            return;
        }

        if (user?.role !== 8 && !withdrawData.pin) {
            toast.error('Please enter your transaction PIN.');
            return;
        }

        if (!withdrawData.account_name) {
            toast.error('Please wait for account resolution or enter valid bank details.');
            return;
        }
        
        try {
            await initiateWithdrawal({
                amount: Number(withdrawData.amount),
                bank_code: withdrawData.bank_code,
                bank_name: withdrawData.bank_name,
                account_name: withdrawData.account_name,
                account_number: withdrawData.account_number,
                wallet: indirectWallet.id!.toString(),
                ...(user?.role === 8 
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

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const handlePaymentModalOpenChange = (open: boolean) => {
        setIsPaymentModalOpen(open);
        if (!open) {
            setPaymentDetails(null);
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
                    className="relative overflow-hidden rounded-[3rem] bg-indigo-950 p-12 text-white shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl bg-purple-500 w-96 h-96 rounded-full -mr-48 -mt-48 animate-pulse" />
                    <div className="absolute bottom-0 left-0 p-12 opacity-10 blur-3xl bg-indigo-500 w-96 h-96 rounded-full -ml-48 -mb-48 animate-pulse" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <span className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Total GKWTH Balance</span>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl md:text-6xl font-black text-indigo-400">G</span>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
                                {(indirectWallet?.amount ?? 0) > 1 ? ((Number(indirectWallet?.amount ?? 1) - 1).toLocaleString()) : '0.00'}
                            </h1>
                        </div>
                        <p className="text-indigo-300/80 font-medium text-sm">
                            ≈ ₦{((indirectWallet?.amount ?? 1) - 1 > 0 ? ((Number(indirectWallet?.amount ?? 1) - 1) * salePrice) : 0).toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                            <Badge className="bg-indigo-500/20 text-indigo-400 border-none px-4 py-1 rounded-full font-bold">
                                <TrendingUp size={14} className="mr-1 inline" /> Growing Stable
                            </Badge>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Switcher */}
                <div className="flex justify-center">
                    <div className="inline-flex p-1.5 bg-zinc-200/50 backdrop-blur-md rounded-2xl border border-zinc-200 max-w-full overflow-x-auto no-scrollbar">
                        {['overview', 'fund', 'sell'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as TabType)}
                                className={cn(
                                    "relative px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 capitalize",
                                    activeTab === tab ? "text-indigo-900" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white shadow-sm rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">
                                    {tab === 'sell' ? 'Sell GKWTH' : tab === 'fund' ? 'Fund GKWTH' : 'Overview'}
                                </span>
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
                                {indirectWallet && (
                                    <div className="w-full max-w-sm">
                                        <Card className="group border-none bg-white p-1 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 ring-1 ring-zinc-100 overflow-hidden">
                                            <CardContent className="p-8 bg-white rounded-[2.3rem]">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="rounded-2xl p-4 shadow-sm bg-indigo-50 text-indigo-600">
                                                        <TrendingUp size={24} strokeWidth={2.5} />
                                                    </div>
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-2 border-indigo-100 text-indigo-600">
                                                        Secondary
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-3">GKWTH Wallet</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold text-zinc-400">G</span>
                                                    <h3 className="text-3xl font-black tracking-tighter text-zinc-900">{(indirectWallet.amount > 1 ? (indirectWallet.amount - 1) : 0).toLocaleString()}</h3>
                                                </div>
                                                <p className="text-[10px] font-bold text-zinc-400 mt-1">
                                                    ≈ ₦{((indirectWallet.amount > 1 ? (indirectWallet.amount - 1) : 0) * salePrice).toLocaleString()}
                                                </p>
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

                            <div className="grid gap-8 lg:grid-cols-2">
                                <Card className="border-none bg-linear-to-br from-indigo-900 via-indigo-900 to-indigo-800 text-white rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <ShieldCheck size={160} />
                                    </div>
                                    <CardContent className="p-0 relative z-10">
                                        <h2 className="text-4xl font-black tracking-tighter mb-6">Safe GKWTH Trading</h2>
                                        <p className="text-indigo-100 font-medium max-w-sm mb-10 text-lg leading-relaxed italic">
                                            Your indirect assets are protected by industry-leading security protocols.
                                        </p>
                                        <Button className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-black h-14 px-10 transition-all">
                                            Asset Protection
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="border-zinc-100 bg-white rounded-[3rem] p-10 flex flex-col justify-center items-center text-center group transition-all hover:shadow-2xl">
                                    <div className="h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                        <NairaIcon className="text-emerald-600" size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-900 mb-4">Direct Wallet</h3>
                                    <p className="text-zinc-500 font-medium mb-10 max-w-[280px] italic leading-relaxed">
                                        Quick access to your primary currency balance and instant transactions.
                                    </p>
                                    <Link href="/wallets">
                                        <Button variant="outline" className="rounded-2xl border-zinc-200 font-black h-14 px-10 hover:bg-zinc-50">
                                            Switch to Direct
                                        </Button>
                                    </Link>
                                </Card>
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
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-zinc-900">Fund GKWTH</h2>
                                            <p className="text-sm text-zinc-500 font-medium italic">Buy GKWTH assets instantly.</p>
                                        </div>
                                    </div>
                                    <p className="text-lg text-zinc-400 font-bold mb-4">Unit Price: <span className="text-zinc-600">₦{salePrice.toLocaleString()}.00</span></p>

                                    <form onSubmit={handleFund} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">GKWTH Quantity</Label>
                                            <Input 
                                                value={fundQuantity}
                                                onChange={(e) => setFundQuantity(e.target.value)}
                                                placeholder="Enter quantity" 
                                                className="h-14 px-6 text-xl font-bold rounded-xl bg-zinc-50 border border-zinc-100 focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all"
                                                type="number"
                                                step="0.01"
                                                min="0.5"
                                            />
                                            {fundQuantity && (
                                                <motion.p 
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1"
                                                >
                                                    ≈ ₦{(Number(fundQuantity) * salePrice).toLocaleString()}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Price</Label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-400">₦</div>
                                                <Input 
                                                    value={fundQuantity ? (Number(fundQuantity) * salePrice).toLocaleString() : '0'}
                                                    readOnly
                                                    className="h-14 pl-12 text-xl font-bold rounded-xl bg-zinc-100/50 border-none cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            type='submit'
                                            disabled={isPurchasing}
                                            className="w-full h-16 rounded-2xl bg-[rgb(79,70,229)] hover:bg-indigo-700 text-white font-black shadow-xl transition-all mt-4"
                                        >
                                            {isPurchasing ? "Processing..." : "Fund Wallet"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Sell Content */}
                    {activeTab === 'sell' && (
                        <motion.div 
                            key="sell"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-3xl mx-auto w-full"
                        >
                            <Card className="border-none bg-white rounded-[3rem] p-4 shadow-2xl ring-1 ring-zinc-100">
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                            <ArrowUpRight size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-zinc-900">Sell GKWTH</h2>
                                            <p className="text-sm text-zinc-500 font-medium italic">Instant sale to your linked bank account.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleWithdraw} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Name</Label>
                                            <Input 
                                                value={user?.name || 'User'}
                                                readOnly
                                                className="h-14 px-6 font-bold rounded-xl bg-zinc-50 border border-zinc-100 cursor-not-allowed text-zinc-600"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Wallet</Label>
                                            <Select defaultValue="indirect">
                                                <SelectTrigger className="h-14 px-6 rounded-xl bg-white border border-zinc-200 font-bold text-zinc-900 w-full justify-between">
                                                    <SelectValue>GKWTH Wallet ({(indirectWallet?.amount ?? 0) > 1 ? (Number(indirectWallet?.amount ?? 1) - 1).toLocaleString() : '0.00'})</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                                    <SelectItem value="indirect" className="font-medium px-6">GKWTH Wallet ({(indirectWallet?.amount ?? 0) > 1 ? (Number(indirectWallet?.amount ?? 1) - 1).toLocaleString() : '0.00'})</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>


                                        {user?.bank && user?.accountNumber ? (
                                            <div className="p-6 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Withdrawal Bank</p>
                                                        <p className="text-xl font-black text-zinc-900">{user.bank}</p>
                                                    </div>
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Number</p>
                                                        <p className="text-xl font-black text-zinc-900">{user.accountNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Name</p>
                                                        <p className="text-xl font-black text-zinc-900">{withdrawData.account_name || (isResolving ? 'Resolving...' : '---')}</p>
                                                    </div>
                                                    <Link href="/profile" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
                                                        Change Details
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-zinc-500 ml-1">Bank</Label>
                                                    <SearchableSelect 
                                                         items={banks.map(bank => ({ label: bank.name, value: bank.uuid }))}
                                                         value={withdrawData.bank_code} 
                                                         onValueChange={(val: string) => {
                                                             const bank = banks.find(b => b.uuid === val);
                                                             setWithdrawData(prev => ({ ...prev, bank_code: val || '', bank_name: bank?.name || '', account_name: '' }));
                                                             if (withdrawData.account_number.length === 10 && val) {
                                                                 handleResolveAccount(withdrawData.account_number, val);
                                                             }
                                                         }}
                                                         placeholder="Select Bank"
                                                         triggerClassName="h-14 px-6 rounded-xl bg-white border border-zinc-200 font-bold text-zinc-900"
                                                     />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-zinc-500 ml-1">Account Number</Label>
                                                    <div className="relative">
                                                        <Input 
                                                            value={withdrawData.account_number}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setWithdrawData(prev => ({ ...prev, account_number: val }));
                                                                if (val.length === 10 && withdrawData.bank_code) {
                                                                    handleResolveAccount(val, withdrawData.bank_code);
                                                                } else if (val.length < 10) {
                                                                    setWithdrawData(prev => ({ ...prev, account_name: '' }));
                                                                }
                                                            }}
                                                            placeholder="Enter account number"
                                                            className="h-14 px-6 rounded-xl bg-zinc-50 border border-zinc-100 font-bold"
                                                        />
                                                        {isResolving && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-400" />}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {!isPrefilled && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-zinc-500 ml-1">Account Name</Label>
                                                <div className="relative">
                                                    <Input 
                                                        value={withdrawData.account_name}
                                                        readOnly
                                                        placeholder={isResolving ? "Resolving..." : "Validated Account Name"}
                                                        className={cn(
                                                            "h-16 rounded-2xl border-none font-black transition-all duration-300",
                                                            withdrawData.account_name 
                                                                ? "bg-emerald-50 text-emerald-600" 
                                                                : "bg-zinc-50 text-zinc-400 placeholder:text-zinc-300"
                                                        )}
                                                    />
                                                    <AnimatePresence>
                                                        {withdrawData.account_name && !isResolving && (
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
                                        )}


                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">GKWTH Quantity</Label>
                                            <Input 
                                                value={withdrawData.amount}
                                                onChange={(e) => setWithdrawData(prev => ({ ...prev, amount: e.target.value }))}
                                                placeholder="Enter quantity"
                                                className="h-14 px-6 rounded-xl bg-white border border-zinc-200 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                type="number"
                                            />
                                            {withdrawData.amount && (
                                                <motion.p 
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1"
                                                >
                                                    ≈ ₦{(Number(withdrawData.amount) * purchasePrice).toLocaleString()}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Price</Label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-400">₦</div>
                                                <Input 
                                                    value={withdrawData.amount ? (Number(withdrawData.amount) * purchasePrice).toLocaleString() : '0'}
                                                    readOnly
                                                    className="h-14 pl-12 text-xl font-bold rounded-xl bg-zinc-100/50 border-none cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">
                                                {user?.role === 8 ? 'Withdrawal OTP' : 'Withdrawal PIN'}
                                            </Label>
                                            <div className="relative">
                                                <Input 
                                                    value={user?.role === 8 ? withdrawData.otp : withdrawData.pin}
                                                    onChange={(e) => setWithdrawData(prev => ({ 
                                                        ...prev, 
                                                        [user?.role === 8 ? 'otp' : 'pin']: e.target.value 
                                                    }))}
                                                    type={user?.role === 8 ? 'text' : 'password'}
                                                    maxLength={user?.role === 8 ? 6 : 4}
                                                    placeholder={user?.role === 8 ? "000000" : "****"}
                                                    className="h-14 px-12 rounded-xl bg-white border border-zinc-200 font-bold"
                                                />
                                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit"
                                            disabled={isWithdrawing}
                                            className="w-40 h-14 rounded-xl bg-[rgb(79,70,229)] hover:bg-indigo-700 text-white font-black shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {isWithdrawing ? "Processing..." : "Withdraw"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                </AnimatePresence>
                {/* Payment Modal */}
                <Dialog open={isPaymentModalOpen} onOpenChange={handlePaymentModalOpenChange}>
                    <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-[2rem] md:rounded-[2.5rem] border-none p-0 overflow-y-auto bg-white shadow-2xl">
                        <div className="bg-indigo-600 p-6 md:p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Plus size={120} />
                            </div>
                            <DialogHeader className="relative z-10">
                                <DialogTitle className="text-xl md:text-2xl font-black">Transfer Details</DialogTitle>
                                <DialogDescription className="text-indigo-100 font-medium text-xs md:text-sm">
                                    Follow the instructions below to fund your GKWTH wallet.
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
                                        {paymentDetails?.amount?.toLocaleString()}
                                    </h1>
                                </div>
                                <div className="flex justify-center pt-1">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                            if (paymentDetails?.amount) {
                                                navigator.clipboard.writeText(paymentDetails.amount.toString());
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
                                        <p className="text-lg font-black text-zinc-900">{paymentDetails?.bank_name}</p>
                                    </div>
                                    <div className="p-2 bg-white rounded-lg shadow-xs group-hover:scale-110 transition-transform">
                                        <Plus className="text-indigo-600" size={20} />
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-50 rounded-2xl flex items-center justify-between group hover:bg-zinc-100 transition-colors">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Number</p>
                                        <p className="text-lg font-black text-zinc-900 tracking-wider">{paymentDetails?.account_number}</p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => copyToClipboard(paymentDetails?.account_number || '', 'Account Number')}
                                        className="bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl shadow-xs"
                                    >
                                        <Copy size={18} />
                                    </Button>
                                </div>

                                <div className="p-4 bg-zinc-50 rounded-2xl group hover:bg-zinc-100 transition-colors">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Account Name</p>
                                    <p className="text-lg font-black text-zinc-900">{paymentDetails?.account_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl text-amber-700">
                                <Clock size={20} className="shrink-0" />
                                <p className="text-xs font-bold leading-relaxed italic">
                                    This account expires at {paymentDetails?.expiry_date}. Please complete the transfer before then.
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
            </div>

            {/* Polling/Processing Modal (Replicated from wallets/page.tsx) */}
            <Dialog open={showPollingModal} onOpenChange={() => {}}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm rounded-[2rem] md:rounded-[2.5rem] border-none p-6 md:p-12 text-center bg-white shadow-2xl overflow-y-auto">
                    <div className="absolute top-0 inset-x-0 h-2 bg-zinc-100 overflow-hidden">
                        <motion.div 
                            className="h-full bg-indigo-600"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </div>
                    <div className="space-y-6">
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
                                    initial={{ opacity: 0.3 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                                    className="w-2 h-2 rounded-full bg-indigo-600"
                                />
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm rounded-[2rem] md:rounded-[2.5rem] border-none p-0 overflow-y-auto bg-white shadow-2xl">
                    <div className="p-6 md:p-12 md:pb-16 text-center space-y-6">
                        <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-black text-zinc-900">Success!</h2>
                            <p className="text-sm text-zinc-500 font-medium italic">
                                Your payment has been confirmed and your GKWTH wallet has been funded.
                            </p>
                        </div>
                        <Button 
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-100 transition-all"
                        >
                            Back To Wallet
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Pending/Manual Modal */}
            <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
                <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-[2rem] md:rounded-[2.5rem] border-none p-0 overflow-y-auto bg-white shadow-2xl">
                    <div className="p-6 md:p-12 md:pb-16 text-center space-y-6">
                        <div className="h-20 w-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-zinc-900">Payment Processing</h2>
                            <p className="text-sm text-zinc-500 font-medium leading-relaxed italic">
                                Your transfer is taking a bit longer to verify. Don&apos;t worry, your funds are safe! 
                                If your wallet isn&apos;t updated within 30 minutes, please contact support.
                            </p>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl flex items-center gap-3 text-left">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <MessageCircle size={20} className="text-indigo-600" />
                            </div>
                            <div className="text-xs">
                                <p className="font-black text-zinc-900">Need Help?</p>
                                <p className="text-zinc-500 font-medium">Chat with our support team</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setShowPendingModal(false)}
                            className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black shadow-lg transition-all"
                        >
                            Got It
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
