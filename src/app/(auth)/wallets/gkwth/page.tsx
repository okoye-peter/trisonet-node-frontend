'use client';

import { 
    TrendingUp, 
    ArrowRightLeft,
    DollarSign,
    ShieldCheck,
    RefreshCcw,
    AlertCircle,
    Activity,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetWalletsQuery, useGetGkwthPricesQuery, usePurchaseGkwthMutation, useRequestAssetLoanMutation, useGetAssetLoansQuery } from '@/store/api/walletApi';
import { useGetBanksQuery, useResolveAccountMutation } from '@/store/api/bankApi';
import { useInitiateWithdrawalMutation } from '@/store/api/withdrawalApi';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Clock, CheckCircle2 } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TransferModal } from '@/components/wallets/TransferModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';

type TabType = 'overview' | 'fund' | 'sell' | 'loan';

export default function GkwthWalletPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: walletsResponse, isLoading: isWalletsLoading } = useGetWalletsQuery();
    const { data: pricesResponse } = useGetGkwthPricesQuery();
    const { data: banksResponse } = useGetBanksQuery();
    const [resolveAccount, { isLoading: isResolving }] = useResolveAccountMutation();
    const [initiateWithdrawal, { isLoading: isWithdrawing }] = useInitiateWithdrawalMutation();
    const [purchaseGkwth, { isLoading: isPurchasing }] = usePurchaseGkwthMutation();
    const [requestAssetLoan, { isLoading: isRequestingLoan }] = useRequestAssetLoanMutation();
    const { data: loansResponse } = useGetAssetLoansQuery();
    
    // Eligibility calculation
    const threeMonthsAgo = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        return d;
    })[0];

    const wallets = walletsResponse?.data || [];
    const banks = banksResponse?.data || [];
    const indirectWallet = wallets.find(w => w.type === 'indirect');
    const prices = pricesResponse?.data;

    const sellPrice = Number(prices?.gkwthSalePrice) || 5000;
    const fundPrice = Number(prices?.gkwthPurchasePrice) || 10000;

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [loanQuantity, setLoanQuantity] = useState('');
    const [paymentDetails, setPaymentDetails] = useState<{
        account_name: string;
        bank_name: string;
        account_number: string;
        amount: number;
        expiry_date: string;
        reference: string;
    } | null>(null);

    // Form States
    const [fundQuantity, setFundQuantity] = useState('');
    const [withdrawData, setWithdrawData] = useState({
        bank_code: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        amount: '',
        pin: ''
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

    const handleResolveAccount = async () => {
        if (withdrawData.account_number.length >= 10 && withdrawData.bank_code) {
            try {
                const res = await resolveAccount({
                    bank_code: withdrawData.bank_code,
                    account_number: withdrawData.account_number
                }).unwrap();
                if (res.data) {
                    setWithdrawData(prev => ({ ...prev, account_name: res.data!.accountName }));
                    toast.success('Account resolved successfully');
                }
            } catch (err) {
                const apiErr = err as { data?: { message?: string } };
                toast.error(apiErr.data?.message || 'Failed to resolve account');
            }
        }
    };

    const handleFund = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fundQuantity || Number(fundQuantity) < 0.5) {
            toast.error('Minimum purchase quantity is 0.5 GKWTH');
            return;
        }

        try {
            const res = await purchaseGkwth({ quantity: Number(fundQuantity) }).unwrap();
            if (res.data?.account_detail) {
                setPaymentDetails(res.data.account_detail);
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
        if (!indirectWallet) return;
        
        try {
            await initiateWithdrawal({
                amount: Number(withdrawData.amount),
                bank_code: withdrawData.bank_code,
                bank_name: withdrawData.bank_name,
                account_name: withdrawData.account_name,
                account_number: withdrawData.account_number,
                wallet: indirectWallet.id!.toString(),
                withdrawal_pin: withdrawData.pin
            }).unwrap();
            
            toast.success('Withdrawal request initiated successfully');
            setActiveTab('overview');
        } catch (err) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Withdrawal failed');
        }
    };

    const handleLoanRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loanQuantity || Number(loanQuantity) <= (indirectWallet?.amount || 0)) {
            toast.error(`Loan quantity must be greater than your current balance (${indirectWallet?.amount || 0})`);
            return;
        }

        try {
            await requestAssetLoan({ quantity: Number(loanQuantity) }).unwrap();
            toast.success('Asset loan request submitted successfully');
            setLoanQuantity('');
            setActiveTab('overview');
        } catch (err) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to submit loan request');
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
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
                                {indirectWallet?.amount.toLocaleString() ?? '0.00'}
                            </h1>
                        </div>
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
                        {['overview', 'fund', 'sell', 'loan'].map((tab) => (
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
                                    {tab === 'sell' ? 'Sell GKWTH' : tab === 'fund' ? 'Fund GKWTH' : tab === 'loan' ? 'Asset Loan' : 'Overview'}
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
                                                    <h3 className="text-3xl font-black tracking-tighter text-zinc-900">{indirectWallet.amount.toLocaleString()}</h3>
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
                                        <DollarSign className="text-emerald-600" size={40} />
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
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-zinc-900">Fund GKWTH</h2>
                                        <p className="text-lg text-zinc-400 font-bold">Unit Price: <span className="text-zinc-600">₦{fundPrice.toLocaleString()}.00</span></p>
                                    </div>

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
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Price</Label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-400">₦</div>
                                                <Input 
                                                    value={fundQuantity ? (Number(fundQuantity) * fundPrice).toLocaleString() : '0'}
                                                    readOnly
                                                    className="h-14 pl-12 text-xl font-bold rounded-xl bg-zinc-100/50 border-none cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <Button 
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
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-zinc-900">Sell GKWTH</h2>
                                        <p className="text-lg text-zinc-400 font-bold">Unit Price: <span className="text-zinc-600">₦{sellPrice.toLocaleString()}</span></p>
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
                                            <Select value="indirect">
                                                <SelectTrigger className="h-14 px-6 rounded-xl bg-white border border-zinc-200 font-bold text-zinc-900">
                                                    <SelectValue placeholder="Select Wallet" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                                    <SelectItem value="indirect" className="font-medium px-6">GKWTH Wallet ({indirectWallet?.amount.toLocaleString() || '0'})</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Bank</Label>
                                            <Select 
                                                value={withdrawData.bank_code} 
                                                onValueChange={(val) => {
                                                    const bank = banks.find(b => b.uuid === val);
                                                    setWithdrawData(prev => ({ ...prev, bank_code: val || '', bank_name: bank?.name || '' }));
                                                }}
                                            >
                                                <SelectTrigger className="h-14 px-6 rounded-xl bg-white border border-zinc-200 font-bold text-zinc-900">
                                                    <SelectValue placeholder="Select Bank" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                                    {banks.map(bank => (
                                                        <SelectItem key={bank.uuid} value={bank.uuid} className="font-medium px-6">
                                                            {bank.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Account Number</Label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input 
                                                        value={withdrawData.account_number}
                                                        onChange={(e) => setWithdrawData(prev => ({ ...prev, account_number: e.target.value }))}
                                                        placeholder="Enter account number"
                                                        className="h-14 px-6 rounded-xl bg-zinc-50 border border-zinc-100 font-bold"
                                                    />
                                                    {isResolving && <RefreshCcw size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-400" />}
                                                </div>
                                                <Button 
                                                    type="button"
                                                    onClick={handleResolveAccount}
                                                    disabled={isResolving || withdrawData.account_number.length < 10}
                                                    className="h-14 px-8 rounded-xl bg-[rgb(79,70,229)] hover:bg-indigo-700 text-white font-bold"
                                                >
                                                    Resolve
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Account Name</Label>
                                            <Input 
                                                value={withdrawData.account_name}
                                                readOnly
                                                placeholder="Validated Account Name"
                                                className="h-14 px-6 rounded-xl bg-zinc-100/50 border-none font-bold text-zinc-600"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Amount</Label>
                                            <Input 
                                                value={withdrawData.amount}
                                                onChange={(e) => setWithdrawData(prev => ({ ...prev, amount: e.target.value }))}
                                                placeholder="Enter amount"
                                                className="h-14 px-6 rounded-xl bg-white border border-zinc-200 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                type="number"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-zinc-500 ml-1">Withdrawal Pin</Label>
                                            <Input 
                                                value={withdrawData.pin}
                                                onChange={(e) => setWithdrawData(prev => ({ ...prev, pin: e.target.value }))}
                                                type="password"
                                                maxLength={4}
                                                placeholder="****"
                                                className="h-14 px-6 rounded-xl bg-white border border-zinc-200 font-bold"
                                            />
                                        </div>

                                        <Button 
                                            disabled={isWithdrawing || !withdrawData.account_name}
                                            className="w-40 h-14 rounded-xl bg-[rgb(79,70,229)] hover:bg-indigo-700 text-white font-black shadow-lg transition-all"
                                        >
                                            {isWithdrawing ? "Processing..." : "Withdraw"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Loan Content */}
                    {activeTab === 'loan' && (
                        <motion.div 
                            key="loan"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Eligibility Checklist */}
                                <Card className="border-none bg-white rounded-[3rem] p-8 shadow-2xl ring-1 ring-zinc-100 h-fit">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <h3 className="text-2xl font-black text-zinc-900">Loan Eligibility</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { label: "Account Age 3+ Months", check: user?.createdAt && new Date(user.createdAt) <= threeMonthsAgo },
                                                { label: "12+ Direct Referrals", check: null }, // We don't have this count directly here
                                                { label: "No Outstanding Debt", check: null },
                                                { label: "Active Bank Details", check: !!user?.bank && !!user?.accountNumber },
                                                { label: "Requested > Balance", check: Number(loanQuantity) > (indirectWallet?.amount || 0) }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                                    <span className="font-bold text-zinc-600">{item.label}</span>
                                                    {item.check === true ? (
                                                        <CheckCircle2 className="text-emerald-500" size={20} />
                                                    ) : item.check === false ? (
                                                        <AlertCircle className="text-rose-500" size={20} />
                                                    ) : (
                                                        <Info className="text-zinc-300" size={20} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                            <AlertCircle className="text-amber-500 shrink-0" size={24} />
                                            <p className="text-sm font-bold text-amber-900 leading-relaxed italic">
                                                Loan requests are reviewed by the administration. Ensure your profile is fully up-to-date before requesting.
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Request Form */}
                                <Card className="border-none bg-white rounded-[3rem] p-8 shadow-2xl ring-1 ring-zinc-100">
                                    <div className="space-y-8">
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black text-zinc-900">Request Loan</h2>
                                            <p className="text-lg text-zinc-400 font-bold italic">
                                                Borrow assets to increase your trading power
                                            </p>
                                        </div>

                                        <form onSubmit={handleLoanRequest} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-zinc-500 ml-1">Asset Quantity (GKWTH)</Label>
                                                <Input 
                                                    value={loanQuantity}
                                                    onChange={(e) => setLoanQuantity(e.target.value)}
                                                    placeholder="Enter quantity to borrow" 
                                                    className="h-16 px-6 text-2xl font-black rounded-2xl bg-zinc-50 border border-zinc-100 focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all"
                                                    type="number"
                                                    step="0.01"
                                                />
                                            </div>

                                            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Total Repayment Amount</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold text-indigo-400">₦</span>
                                                    <span className="text-3xl font-black text-indigo-900">
                                                        {(Number(loanQuantity) * fundPrice).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-indigo-400 font-bold mt-2 italic">
                                                    *Based on current market price of ₦{fundPrice.toLocaleString()}
                                                </p>
                                            </div>

                                            <Button 
                                                disabled={isRequestingLoan || !loanQuantity || Number(loanQuantity) <= (indirectWallet?.amount || 0)}
                                                className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 transition-all"
                                            >
                                                {isRequestingLoan ? "Submitting..." : "Submit Loan Request"}
                                            </Button>
                                        </form>
                                    </div>
                                </Card>
                            </div>

                            {/* Loan History Table */}
                            <Card className="border-none bg-white rounded-[4rem] p-8 shadow-2xl ring-1 ring-zinc-100 overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-zinc-100 text-zinc-600 rounded-2xl">
                                            <Activity size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-900">Loan History</h3>
                                    </div>
                                    <Badge variant="outline" className="px-4 py-1.5 rounded-full font-black text-zinc-400 border-zinc-100">
                                        Recent Requests
                                    </Badge>
                                </div>

                                <div className="overflow-x-auto no-scrollbar -mx-8 px-8">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-100">
                                                <th className="pb-4 text-left text-xs font-black text-zinc-400 uppercase tracking-widest px-4">Date</th>
                                                <th className="pb-4 text-left text-xs font-black text-zinc-400 uppercase tracking-widest px-4">Quantity</th>
                                                <th className="pb-4 text-left text-xs font-black text-zinc-400 uppercase tracking-widest px-4">Status</th>
                                                <th className="pb-4 text-right text-xs font-black text-zinc-400 uppercase tracking-widest px-4">Repaid</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loansResponse?.data?.data?.map((loan) => (
                                                <tr key={loan.id} className="group hover:bg-zinc-50/50 transition-colors">
                                                    <td className="py-6 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-zinc-900">{new Date(loan.createdAt).toLocaleDateString()}</span>
                                                            <span className="text-[10px] text-zinc-400 font-black">{new Date(loan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <span className="text-lg font-black text-zinc-900">G {loan.quantityRequested.toLocaleString()}</span>
                                                    </td>
                                                    <td className="py-6 px-4">
                                                        <Badge className={cn(
                                                            "rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-tighter",
                                                            loan.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                            loan.status === 'granted' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                            "bg-rose-50 text-rose-600 border border-rose-100"
                                                        )}>
                                                            {loan.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-6 px-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-black text-indigo-600">G {loan.quantityRepaid.toLocaleString()}</span>
                                                            <div className="w-20 h-1.5 bg-zinc-100 rounded-full mt-2 overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                                                    style={{ width: `${(loan.quantityRepaid / (loan.quantityGranted || 1)) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!loansResponse?.data?.data || loansResponse.data.data.length === 0) && (
                                                <tr>
                                                    <td colSpan={4} className="py-20 text-center">
                                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                                            <Activity size={60} />
                                                            <p className="font-black text-zinc-900 uppercase tracking-widest text-sm">No loan history found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Payment Modal */}
                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                        <div className="bg-indigo-600 p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <DollarSign size={80} />
                            </div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                    <CheckCircle2 className="text-indigo-200" />
                                    Fund Your Wallet
                                </DialogTitle>
                                <DialogDescription className="text-indigo-100 font-medium">
                                    Transfer the exact amount below to the virtual account to complete your purchase.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Account Number</p>
                                        <p className="text-2xl font-black text-zinc-900 tracking-tight">{paymentDetails?.account_number}</p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => copyToClipboard(paymentDetails?.account_number || '', 'Account Number')}
                                        className="h-12 w-12 rounded-xl hover:bg-white hover:shadow-md transition-all"
                                    >
                                        <Copy size={20} className="text-indigo-600" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Bank Name</p>
                                        <p className="font-black text-zinc-900">{paymentDetails?.bank_name}</p>
                                    </div>
                                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Account Name</p>
                                        <p className="font-black text-zinc-900">{paymentDetails?.account_name}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Total Amount</p>
                                        <p className="text-2xl font-black text-indigo-700">₦{paymentDetails?.amount.toLocaleString()}</p>
                                    </div>
                                    <Badge className="bg-white text-indigo-600 border-indigo-200 font-bold px-3 py-1">Exact Amount</Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <Clock className="text-amber-500 shrink-0" size={20} />
                                <p className="text-sm font-bold text-amber-700">
                                    This account expires at <span className="underline">{paymentDetails?.expiry_date} today</span>. Please complete the transfer before then.
                                </p>
                            </div>

                            <Button 
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="w-full h-14 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black shadow-lg"
                            >
                                Done
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
