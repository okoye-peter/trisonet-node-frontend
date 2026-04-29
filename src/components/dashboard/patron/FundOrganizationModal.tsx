import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    useCreatePatronGroupMutation, 
    useCheckPatronFundingStatusQuery,
    useGetPatronPlansQuery 
} from '@/store/api/patronApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Shield, Loader2, CheckCircle2, Wallet, ArrowRight, Copy } from 'lucide-react';

interface FundOrganizationModalProps {
    initialName: string;
    initialPlan: string;
    onSuccess: () => void;
}

export function FundOrganizationModal({ initialName, initialPlan, onSuccess }: FundOrganizationModalProps) {
    const [name, setName] = useState(initialName || '');
    const [planId, setPlanId] = useState(initialPlan || 'Bronze');
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'input' | 'payment' | 'polling'>('input');
    
    const [createGroup, { isLoading: isFunding }] = useCreatePatronGroupMutation();
    const { data: plansResponse } = useGetPatronPlansQuery();
    
    const plans = plansResponse?.data || [];
    const selectedPlan = plans.find(p => p.name === planId);
    
    const [paymentData, setPaymentData] = useState<any>(null);
    const [pollStart, setPollStart] = useState<number | null>(null);

    // Update amount when plan changes
    useEffect(() => {
        if (selectedPlan) {
            setAmount(selectedPlan.minAmount.toString());
        }
    }, [selectedPlan]);

    const { data: statusData } = useCheckPatronFundingStatusQuery(paymentData?.reference, {
        skip: step !== 'polling' || !paymentData?.reference,
        pollingInterval: 5000,
    });

    useEffect(() => {
        if (step === 'polling') {
            if (statusData?.data?.status === 'success') {
                toast.success('Payment verified successfully!');
                onSuccess();
            } else if (pollStart && Date.now() - pollStart > 120000) {
                // 2 minutes max
                toast.info('Payment is being processed. Your account will be unlocked once confirmed.');
                onSuccess(); // Close modal and let them wait or refresh later
            }
        }
    }, [statusData, step, pollStart, onSuccess]);

    const handleInitiate = async () => {
        const numAmount = Number(amount);
        
        if (!name || !planId || !amount) {
            toast.error('Please fill in all fields');
            return;
        }

        if (selectedPlan) {
            if (numAmount < selectedPlan.minAmount || numAmount > selectedPlan.maxAmount) {
                toast.error(`Amount for ${selectedPlan.name} must be between ₦${selectedPlan.minAmount.toLocaleString()} and ₦${selectedPlan.maxAmount.toLocaleString()}`);
                return;
            }
        }

        try {
            const res = await createGroup({ 
                name, 
                amount: numAmount, 
                type: 'group', 
                plan: planId 
            }).unwrap();
            setPaymentData(res.data.payment);
            setStep('payment');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to initiate funding');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-900/60">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
            >
                <Card className="p-8 rounded-[2rem] border-zinc-100 shadow-2xl bg-white overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-400 to-rose-400" />
                    
                    <div className="text-center mb-8 pt-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-500 mb-4">
                            <Shield size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Organization Required</h2>
                        <p className="text-zinc-500 font-medium text-sm mt-2">
                            Please finalize your organization details and complete the funding to unlock all features.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'input' && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Organization Name</Label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none transition-colors group-focus-within:text-indigo-600" size={20} />
                                        <Input 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter organization name"
                                            className="w-full h-16 pl-14 pr-6 bg-zinc-50/50 border-2 border-zinc-100 focus:border-indigo-600 focus:bg-white focus:ring-0 rounded-3xl text-lg font-black transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Plan</Label>
                                        <Select value={planId} onValueChange={setPlanId}>
                                            <div className="relative group">
                                                <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none transition-colors group-focus-within:text-indigo-600" size={20} />
                                                <SelectTrigger className="w-full h-16 min-h-[4rem] pl-14 pr-12 bg-zinc-50/50 border-2 border-zinc-100 focus:border-indigo-600 focus:bg-white focus:ring-0 rounded-3xl text-lg font-black shadow-sm flex items-center box-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </div>
                                            <SelectContent className="rounded-2xl border-2 border-zinc-100 shadow-2xl p-2">
                                                {plans.map(plan => (
                                                    <SelectItem key={plan.id} value={plan.name} className="font-bold py-3 rounded-xl focus:bg-indigo-50 focus:text-indigo-600">
                                                        {plan.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount (₦)</Label>
                                        <div className="relative group">
                                            <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none transition-colors group-focus-within:text-indigo-600" size={20} />
                                            <Input 
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full h-16 min-h-[4rem] pl-14 pr-6 bg-zinc-50/50 border-2 border-zinc-100 focus:border-indigo-600 focus:bg-white focus:ring-0 rounded-3xl text-lg font-black shadow-sm box-border"
                                                min={selectedPlan?.minAmount || 1000000}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {selectedPlan && (
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Plan Requirement</p>
                                        <p className="text-xs font-bold text-indigo-900">
                                            Min: ₦{selectedPlan.minAmount.toLocaleString()} — Max: ₦{selectedPlan.maxAmount.toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                <Button 
                                    onClick={handleInitiate} 
                                    disabled={isFunding}
                                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1"
                                >
                                    {isFunding ? <Loader2 className="animate-spin" /> : 'Generate Payment Details'}
                                </Button>
                            </motion.div>
                        )}

                        {step === 'payment' && paymentData && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Bank Name</span>
                                        <span className="text-sm font-black text-zinc-900">{paymentData.account_detail.bank_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-zinc-200">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Account Name</span>
                                        <span className="text-sm font-black text-zinc-900">{paymentData.account_detail.account_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Account Number</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-indigo-600">{paymentData.account_detail.account_number}</span>
                                            <button onClick={() => copyToClipboard(paymentData.account_detail.account_number)} className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-center p-4 bg-orange-50 rounded-2xl">
                                    <p className="text-sm font-bold text-orange-800">
                                        Please transfer exactly ₦{paymentData.amount.toLocaleString()} to the account above.
                                    </p>
                                </div>

                                <Button 
                                    onClick={() => {
                                        setStep('polling');
                                        setPollStart(Date.now());
                                    }} 
                                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest"
                                >
                                    I Have Transferred The Money <ArrowRight className="ml-2" size={18} />
                                </Button>
                            </motion.div>
                        )}

                        {step === 'polling' && (
                            <motion.div
                                key="polling"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8 flex flex-col items-center justify-center space-y-6 text-center"
                            >
                                <div className="w-20 h-20 relative">
                                    <div className="absolute inset-0 border-4 border-zinc-100 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                                        <Wallet size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900">Confirming Payment</h3>
                                    <p className="text-sm font-medium text-zinc-500 mt-2 max-w-[250px] mx-auto">
                                        Please wait while we verify your transfer. This usually takes less than a minute.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
}
