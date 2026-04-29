import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Shield, TrendingUp, CheckCircle2, ChevronRight, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCreatePatronGroupMutation, useGetPatronPlansQuery } from '@/store/api/patronApi';
import { useAppSelector } from '@/store/hooks';

const planStyles: Record<string, { color: string, bg: string }> = {
    bronze: { color: 'text-orange-700', bg: 'bg-orange-100' },
    silver: { color: 'text-zinc-700', bg: 'bg-zinc-100' },
    gold: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
    diamond: { color: 'text-cyan-700', bg: 'bg-cyan-100' },
    platinum: { color: 'text-indigo-700', bg: 'bg-indigo-100' },
};

export function CreateOrganizationForm({ 
    onSuccess,
    initialData
}: { 
    onSuccess: () => void;
    initialData?: { name?: string; plan?: string; amount?: number };
}) {
    const user = useAppSelector((state) => state.auth.user);
    
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState('group');
    const [planId, setPlanId] = useState(initialData?.plan || 'Bronze');
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [paymentData, setPaymentData] = useState<any>(null);
    
    const [createGroup, { isLoading }] = useCreatePatronGroupMutation();
    const { data: plansResponse, isLoading: isLoadingPlans } = useGetPatronPlansQuery();
    const plans = plansResponse?.data || [];
    const selectedPlan = plans.find(p => p.name === planId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const numAmount = Number(amount);
        if (!name || !amount) {
            toast.error('Please fill in all fields');
            return;
        }
        
        if (!selectedPlan) {
            toast.error('Please select a valid plan');
            return;
        }

        if (numAmount < selectedPlan.minAmount || numAmount > selectedPlan.maxAmount) {
            toast.error(`Amount for ${selectedPlan.name} must be between ₦${selectedPlan.minAmount.toLocaleString()} and ₦${selectedPlan.maxAmount.toLocaleString()}`);
            return;
        }

        try {
            const res = await createGroup({ name, amount: numAmount, type, plan: type === 'group' ? planId : 'bronze' }).unwrap();
            setPaymentData(res.data.payment);
            toast.success('Organization created successfully!');
        } catch (error) {
            const err = error as { data?: { message?: string } };
            toast.error(err.data?.message || 'Failed to create organization');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto py-10">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm">
                    <Building2 size={32} />
                </div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-4">Establish Your Organization</h1>
                <p className="text-zinc-500 font-medium text-lg max-w-xl mx-auto">
                    Create You Patron Organization
                </p>
            </div>

            <Card className="p-6 md:p-12 rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40 bg-white">
                {paymentData ? (
                    <div className="space-y-8 py-4">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
                                <CheckCircle2 size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Organization Established</h2>
                            <p className="text-zinc-500 font-medium text-sm">Please complete the funding to activate your account.</p>
                        </div>

                        <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 space-y-6">
                            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-zinc-200/50">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Bank Name</p>
                                    <p className="text-lg font-black text-zinc-900">{paymentData.bank_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Account Number</p>
                                    <p className="text-xl font-black text-indigo-600 tracking-wider">{paymentData.account_number}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Account Name</p>
                                    <p className="font-bold text-zinc-700">{paymentData.account_name}</p>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-zinc-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Total Amount to Send</p>
                                        <p className="text-2xl font-black text-zinc-900">₦{paymentData.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Includes Charges</p>
                                        <p className="text-sm font-bold text-zinc-500">₦{paymentData.charge.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button 
                                onClick={onSuccess}
                                className="w-full h-16 text-sm font-black tracking-widest uppercase rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl transition-all"
                            >
                                I have made the transfer
                            </Button>
                            <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-widest">
                                Your dashboard will unlock automatically once detected.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block">Organization Name</Label>
                        <div className="relative group">
                            <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none transition-colors group-focus-within:text-indigo-600" size={22} />
                            <Input 
                                placeholder="Enter organization name" 
                                className="w-full h-16 min-h-[4rem] pl-14 pr-6 bg-zinc-50/50 border-2 border-zinc-100 focus:border-indigo-600 focus:bg-white focus:ring-0 rounded-3xl text-lg font-black transition-all duration-300 shadow-sm hover:shadow-md box-border"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 pt-6 border-t border-zinc-100">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block">Select Plan</Label>
                                <Select value={planId} onValueChange={(value) => { if (value) setPlanId(value); }}>
                                    <div className="relative group">
                                        <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none transition-colors group-focus-within:text-indigo-600" size={22} />
                                        <SelectTrigger className="w-full h-16 min-h-[4rem] pl-14 pr-12 bg-zinc-50/50 border-2 border-zinc-100 focus:border-indigo-600 focus:bg-white focus:ring-0 rounded-3xl text-lg font-black transition-all duration-300 shadow-sm hover:shadow-md flex items-center box-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </div>
                                    <SelectContent className="rounded-3xl border-2 border-zinc-100 shadow-2xl p-2">
                                        {plans.map(plan => (
                                            <SelectItem key={plan.id} value={plan.name} className="font-black py-4 rounded-2xl focus:bg-indigo-50 focus:text-indigo-600 transition-colors cursor-pointer">
                                                {plan.name} ({plan.returns}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedPlan && (
                                    <div className="mt-6 p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-bold text-zinc-500">Plan Range</span>
                                        </div>
                                        <div className="font-black text-zinc-900 tracking-tight">
                                            ₦{(selectedPlan.minAmount / 1000000).toLocaleString()}M - {selectedPlan.maxAmount >= 1000000000 ? `₦${(selectedPlan.maxAmount / 1000000000).toLocaleString()}B` : `₦${(selectedPlan.maxAmount / 1000000).toLocaleString()}M`}
                                        </div>
                                    </div>
                                )}
                            </div>


                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block">Initial Funding Amount (₦)</Label>
                            <div className="relative group">
                                <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none transition-colors group-focus-within:text-indigo-600" size={22} />
                                <Input 
                                    type="number"
                                    placeholder="Enter amount" 
                                    className="w-full h-16 min-h-[4rem] pl-14 pr-6 bg-zinc-50/50 border-2 border-zinc-100 focus:border-indigo-600 focus:bg-white focus:ring-0 rounded-3xl text-lg font-black transition-all duration-300 shadow-sm hover:shadow-md box-border"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min={selectedPlan ? selectedPlan.minAmount : 1000000}
                                    max={selectedPlan ? selectedPlan.maxAmount : undefined}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest pl-2">
                                Minimum required: ₦{selectedPlan ? selectedPlan.minAmount.toLocaleString() : '1,000,000'}
                            </p>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-16 text-lg font-black tracking-widest uppercase rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1"
                    >
                        {isLoading ? 'Processing...' : 'Establish Organization'}
                        {!isLoading && <ChevronRight className="ml-2" />}
                    </Button>
                    </form>
                )}
            </Card>
        </motion.div>
    );
}
