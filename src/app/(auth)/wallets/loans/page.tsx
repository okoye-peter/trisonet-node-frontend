'use client';

import { 
    ShieldCheck,
    AlertCircle,
    Activity,
    Info,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetWalletsQuery, useGetGkwthPricesQuery, useRequestAssetLoanMutation, useGetAssetLoansQuery } from '@/store/api/walletApi';
import { useGetUserDashboardStatsQuery } from '@/store/api/userApi';
import LoadingScreen from '@/components/LoadingScreen';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';

export default function LoansPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const { data: walletsResponse, isLoading: isWalletsLoading } = useGetWalletsQuery();
    const { data: pricesResponse } = useGetGkwthPricesQuery();
    const [requestAssetLoan, { isLoading: isRequestingLoan }] = useRequestAssetLoanMutation();
    const { data: loansResponse } = useGetAssetLoansQuery();
    const { data: statsResponse } = useGetUserDashboardStatsQuery();
    
    // Eligibility calculation
    const threeMonthsAgo = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        return d;
    })[0];

    const wallets = walletsResponse?.data || [];
    const indirectWallet = wallets.find(w => w.type === 'indirect');
    const prices = pricesResponse?.data;

    const loanPrice = Number(prices?.loanPurchasePrice) || 0;

    const [loanQuantity, setLoanQuantity] = useState('');

    const handleLoanRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentBalance = indirectWallet?.amount || 0;
        const requestedQuantity = Number(loanQuantity);

        if (!loanQuantity || requestedQuantity <= currentBalance) {
            toast.error(`Loan quantity must be greater than your current balance (${currentBalance})`);
            return;
        }

        try {
            await requestAssetLoan({ quantity: requestedQuantity }).unwrap();
            toast.success('Asset loan request submitted successfully');
            setLoanQuantity('');
        } catch (err) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to submit loan request');
        }
    };

    if (isWalletsLoading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl md:rounded-[3rem] bg-indigo-950 p-8 md:p-12 text-white shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl bg-purple-500 w-96 h-96 rounded-full -mr-48 -mt-48 animate-pulse" />
                    <div className="absolute bottom-0 left-0 p-12 opacity-10 blur-3xl bg-indigo-500 w-96 h-96 rounded-full -ml-48 -mb-48 animate-pulse" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 mb-4">
                            <ShieldCheck size={48} className="text-indigo-300" />
                        </div>
                        <span className="text-indigo-300 font-bold uppercase tracking-[0.3em] text-xs">Asset Loan Center</span>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter">
                            Empower Your <span className="text-indigo-400">Growth</span>
                        </h1>
                        <p className="text-indigo-200/70 font-medium max-w-xl text-lg italic">
                            Access additional GKWTH assets to leverage your trading position and maximize your potential returns.
                        </p>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Eligibility Checklist */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="border-none bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-8 shadow-2xl ring-1 ring-zinc-100 h-full">
                            <CardContent className="p-0 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-900">Loan Eligibility</h3>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: "Account Age 3+ Months", check: user?.createdAt && new Date(user.createdAt) <= threeMonthsAgo },
                                        { label: "12+ Direct Referrals", check: (statsResponse?.data?.totalSales || 0) >= 12 },
                                        { label: "No Outstanding Debt", check: !loansResponse?.data?.data?.some(l => l.status === 'granted' && l.quantityGranted > l.quantityRepaid) },
                                        { label: "Active Bank Details", check: !!user?.bank && !!user?.accountNumber },
                                        { label: "Requested > Balance", check: loanQuantity ? Number(loanQuantity) > (indirectWallet?.amount || 0) : null }
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
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Request Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-none bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-8 shadow-2xl ring-1 ring-zinc-100">
                            <CardContent className="p-0 space-y-8">
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

                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Amount to Receive */}
                                        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Amount to Receive</p>
                                            <div className="flex items-baseline gap-2 justify-center">
                                                <span className="text-lg font-bold text-emerald-500">₦</span>
                                                <span className="text-3xl font-black text-emerald-900">
                                                    {(Number(loanQuantity) * loanPrice).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-emerald-500 font-bold mt-2 italic">
                                                *Valued at ₦{loanPrice.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit"
                                        disabled={isRequestingLoan || !loanQuantity || Number(loanQuantity) <= (indirectWallet?.amount || 0)}
                                        className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 transition-all"
                                    >
                                        {isRequestingLoan ? "Submitting..." : "Submit Loan Request"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Loan History Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-none bg-white rounded-3xl md:rounded-[4rem] p-6 md:p-8 shadow-2xl ring-1 ring-zinc-100 overflow-hidden">
                        <CardContent className="p-0">
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
                                        {loansResponse?.data?.data?.map((loan: { id: string; createdAt: string; quantityRequested: number; status: string; quantityRepaid: number; quantityGranted: number }) => (
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
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
