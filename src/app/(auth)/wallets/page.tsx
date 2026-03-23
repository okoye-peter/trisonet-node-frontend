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
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetWalletsQuery, useInitiateWalletFundingMutation } from '@/store/api/walletApi';
import { useGetBanksQuery, useResolveAccountMutation } from '@/store/api/bankApi';
import { useInitiateWithdrawalMutation } from '@/store/api/withdrawalApi';
import { decrypt } from '@/lib/crypto';
import LoadingScreen from '@/components/LoadingScreen';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TransferModal } from '@/components/wallets/TransferModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/ui/searchable-select';

declare global {
    interface Window {
        PagaCheckout: any;
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
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: walletsResponse, isLoading: isWalletsLoading } = useGetWalletsQuery();
    const { data: banksResponse } = useGetBanksQuery();
    const [resolveAccount, { isLoading: isResolving }] = useResolveAccountMutation();
    const [initiateWithdrawal, { isLoading: isWithdrawing }] = useInitiateWithdrawalMutation();

    const wallets = walletsResponse?.data || [];
    const banks = useMemo(() => banksResponse?.data || [], [banksResponse?.data]);
    const directWallet = wallets.find(w => w.type === 'direct');

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const [initiateWalletFunding, { isLoading: isInitiatingFunding }] = useInitiateWalletFundingMutation();

    const handleFundWallet = async () => {
        if (!fundAmount || Number(fundAmount) < 500) {
            toast.error('Minimum funding amount is ₦500');
            return;
        }

        try {
            const res = await initiateWalletFunding({ amount: Number(fundAmount) }).unwrap();
            const decryptedPublicKey = await decrypt(res.data.publicKey);
            
            if (window.PagaCheckout) {
                window.PagaCheckout.setOptions({
                    publicKey: decryptedPublicKey,
                    amount: res.data.amount,
                    currency: "NGN",
                    phoneNumber: res.data.phone,
                    email: res.data.email,
                    callback_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/webhook/paga`,
                    payment_reference: res.data.reference,
                    funding_sources: 'CARD'
                });
                window.PagaCheckout.openCheckout();
            } else {
                toast.error('Payment gateway is not ready. Please refresh.');
            }
        } catch (err: unknown) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to initiate funding');
        }
    };

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
        if (activeTab === 'withdraw' && user) {
            if (!user.bank || !user.accountNumber) {
                toast.error('Please set your bank details in your profile before withdrawing.');
                const timer = setTimeout(() => {
                    router.push('/profile');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [activeTab, user, router]);

    const isPrefilled = useRef(false);

    // Prefill withdrawal data from user profile
    useEffect(() => {
        if (user && activeTab === 'withdraw' && user.bank && user.accountNumber && banks.length > 0 && !isPrefilled.current) {
            const userBank = banks.find((b: { name: string; uuid: string }) => b.name === user.bank);
            if (userBank) {
                const timer = setTimeout(() => {
                    setWithdrawData(prev => ({
                        ...prev,
                        account_number: user.accountNumber || '',
                        bank_name: user.bank || '',
                        bank_code: userBank.uuid || '',
                    }));
                }, 0);
                isPrefilled.current = true;
                return () => clearTimeout(timer);
            }
        }
    }, [user, activeTab, banks]);

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
        

        if (user?.role === 8 && !withdrawData.otp) {
            toast.error('Please enter your withdrawal OTP.');
            return;
        }

        if (user?.role !== 8 && !withdrawData.pin) {
            toast.error('Please enter your transaction PIN.');
            return;
        }

        if (!withdrawData.account_name) {
            toast.error('Please wait for account resolution or enter valid details.');
            return;
        }
        
        try {
            await initiateWithdrawal({
                amount: Number(withdrawData.amount),
                bank_code: withdrawData.bank_code,
                bank_name: withdrawData.bank_name,
                account_name: withdrawData.account_name,
                account_number: withdrawData.account_number,
                wallet: directWallet.id!.toString(),
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

                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Total Direct Balance</span>
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
                                        {user?.bank && user?.accountNumber ? (
                                            <div className="p-6 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Withdrawal Bank</p>
                                                        <p className="text-xl font-black text-zinc-900">{user.bank}</p>
                                                    </div>
                                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                        <CheckCircle2 size={24} />
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

                                        <div className="grid md:grid-cols-2 gap-6 items-end">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">Amount to Withdraw</Label>
                                                <div className="relative">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400">₦</div>
                                                    <Input 
                                                        value={withdrawData.amount}
                                                        onChange={(e) => setWithdrawData(prev => ({ ...prev, amount: e.target.value }))}
                                                        placeholder="0"
                                                        className="h-20 pl-12 text-3xl font-black rounded-2xl bg-zinc-50 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        type="number"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest ml-1">
                                                    {user?.role === 8 ? 'Withdrawal OTP' : 'Transaction PIN'}
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
        </div>
    );
}
