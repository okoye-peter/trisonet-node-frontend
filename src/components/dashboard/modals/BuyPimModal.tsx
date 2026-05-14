'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Send, Ticket, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ActivationCandidate } from '@/types';
import { toast } from 'sonner';
import { useGetActivationCandidatesQuery, useInitiateActivationPaymentMutation, useGenerateActivationVirtualAccountMutation, useLazyCheckActivationStatusQuery, useSubmitActivationProofMutation, useActivateByCodeMutation } from '@/store/api/userApi';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        PagaCheckout: {
            setOptions: (options: {
                amount: number;
                email?: string;
                phoneNumber?: string;
                publicKey: string;
                referenceNumber: string;
                paymentMethods?: string[];
                onSuccess?: (response: unknown) => void;
                onError?: (error: unknown) => void;
                onClose?: () => void;
            }) => void;
            openCheckout: () => void;
        };
    }
}

interface BuyPimModalProps {
    isOpen: boolean;
    onClose: () => void;
    activationData?: {
        price: number;
        charge: number;
        infantFormFee: number;
        total: number;
    };
}

type ModalView = 'selection' | 'code' | 'transfer' | 'card' | 'transfer_details';

export default function BuyPimModal({ isOpen, onClose, activationData }: BuyPimModalProps) {
    const [view, setView] = useState<ModalView>('selection');
    const [activationCode, setActivationCode] = useState('');
    const [isMultiple, setIsMultiple] = useState(false);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [transferDetails, setTransferDetails] = useState<{
        account_name: string;
        bank_name: string;
        account_number: string;
        expires_at: string;
        amount: string;
        reference: string;
    } | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [selectedProof, setSelectedProof] = useState<File | null>(null);
    const [checkStatus] = useLazyCheckActivationStatusQuery();
    const [submitProof, { isLoading: isSubmittingProof }] = useSubmitActivationProofMutation();

    const { data: candidatesResponse } = useGetActivationCandidatesQuery(undefined, {
        skip: !isOpen || !isMultiple
    });

    const [initiateActivationPayment, { isLoading: isInitiating }] = useInitiateActivationPaymentMutation();
    const [generateVirtualAccount, { isLoading: isGenerating }] = useGenerateActivationVirtualAccountMutation();
    const [activateByCode, { isLoading: isActivatingByCode }] = useActivateByCodeMutation();

    const candidates = candidatesResponse?.data || [];
    const filteredCandidates = candidates.filter(c => 
        c.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMember = (id: string) => {
        setSelectedTeamMembers(prev => 
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const resetAndClose = () => {
        setView('selection');
        setActivationCode('');
        setIsMultiple(false);
        setSelectedTeamMembers([]);
        setSearchTerm('');
        onClose();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handlePayWithCard = async () => {
        try {
            const res = await initiateActivationPayment({
                teamMateIds: selectedTeamMembers
            }).unwrap();

            if (!res.data) {
                toast.error('Failed to initiate payment - missing data');
                return;
            }

            const { reference, amount, publicKey, email, phoneNumber } = res.data;

            const initPaga = () => {
                const getPagaCheckout = () => {
                    try {
                        return new Function('return typeof PagaCheckout !== "undefined" ? PagaCheckout : null')();
                    } catch {
                        return null;
                    }
                };
                
                const PagaCheckout = getPagaCheckout();
                
                if (!PagaCheckout) {
                    toast.error('Payment gateway not loaded. Please refresh the page.');
                    return;
                }
                
                try {
                    PagaCheckout.setOptions({
                        publicKey: publicKey,
                        amount: Number(Number(amount).toFixed(2)),
                        currency: "NGN",
                        phoneNumber: phoneNumber,
                        email: email,
                        payment_reference: reference,
                        funding_sources: 'CARD',
                        callback_url: window.location.origin + '/dashboard',
                        onSuccess: (response: any) => {
                            toast.success('Payment successful! Your account is being activated.');
                            window.location.reload();
                        },
                        onError: (error: any) => {
                            console.error('Paga error callback:', error);
                            toast.error('Payment failed. Please try again.');
                        },
                        onClose: () => {
                            console.log('Checkout closed callback');
                        }
                    });

                    // Close our modal first
                    resetAndClose();

                    PagaCheckout.openCheckout();

                    // The Paga iframe is injected with z-index: 5, which puts it behind the navbar (z-50).
                    // We dynamically find it and boost its z-index so the entire checkout is visible.
                    setTimeout(() => {
                        const iframes = document.querySelectorAll('iframe');
                        iframes.forEach(iframe => {
                            if (iframe.src.includes('checkout.paga.com')) {
                                iframe.style.zIndex = '999999';
                            }
                        });
                    }, 500);

                } catch (e: any) {
                    console.error('Paga error during openCheckout:', e);
                    toast.error('Error opening payment gateway: ' + (e.message || e));
                }
            };

            const checkPaga = () => {
                try {
                    return new Function('return typeof PagaCheckout !== "undefined" ? PagaCheckout : null')();
                } catch {
                    return null;
                }
            };

            if (typeof window !== 'undefined' && !checkPaga()) {
                toast.info('Loading payment gateway...');
                const script = document.createElement('script');
                script.src = 'https://checkout.paga.com/checkout/inline-js';
                script.onload = () => initPaga();
                script.onerror = () => toast.error('Failed to load payment gateway script');
                document.body.appendChild(script);
            } else {
                initPaga();
            }

        } catch (err: unknown) {
            console.error('Payment initiation error:', err);
            const apiErr = err as { data?: { message?: string }, status?: number };
            toast.error(apiErr.data?.message || 'Failed to initiate activation payment. Please try again.');
        }
    };

    const handleGenerateVirtualAccount = async () => {
        try {
            const amount = ((activationData?.total || 0) * (1 + selectedTeamMembers.length)).toFixed(2);
            const res = await generateVirtualAccount({
                amount,
                teamMateIds: selectedTeamMembers
            }).unwrap();

            if (res.status === 'success' && res.data) {
                setTransferDetails({
                    ...res.data.account_detail,
                    amount,
                    reference: res.data.account_detail.reference || '' // Backend should return ref
                });
                setView('transfer_details');
            }
        } catch (err: unknown) {
            console.log('handleGenerateVirtualAccount', err);

            const apiErr = err as { data?: { message?: string, error?: string } };
            toast.error(apiErr.data?.error || apiErr.data?.message || 'Failed to generate virtual account');
        }
    };

    const handleSentMoney = async () => {
        if (!transferDetails?.reference) return;

        setIsPolling(true);
        toast.info('Verifying your payment... please wait.');

        let totalTime = 0;
        let delay = 2000; // Start with 2s
        const maxTime = 120000; // 2 minutes

        const poll = async () => {
            if (totalTime >= maxTime) {
                setIsPolling(false);
                toast.info('Payment is still being processed. We will notify you once it is confirmed.');
                resetAndClose();
                return;
            }

            try {
                const res = await checkStatus(transferDetails.reference).unwrap();
                if (res.data?.status === 'approved') {
                    setIsPolling(false);
                    toast.success('Payment confirmed! Your account has been activated.');
                    resetAndClose();
                    return;
                }
            } catch (err) {
                console.error('Polling error:', err);
            }

            setTimeout(() => {
                totalTime += delay;
                delay = Math.min(delay * 1.5, 30000); // Exponential backoff up to 30s
                poll();
            }, delay);
        };

        poll();
    };

    const handleUploadProof = async () => {
        if (!selectedProof || !transferDetails?.reference) return;

        const formData = new FormData();
        formData.append('prove', selectedProof);
        formData.append('reference', transferDetails.reference);

        try {
            await submitProof(formData).unwrap();
            toast.success('Proof of payment submitted successfully! We will verify it shortly.');
            resetAndClose();
        } catch (err: unknown) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to submit proof of payment');
        }
    };

    const handleActivateByCode = async () => {
        if (!activationCode) {
            toast.error('Please enter an activation code');
            return;
        }

        try {
            await activateByCode({
                activation_code: activationCode,
                teamMateIds: selectedTeamMembers
            }).unwrap();

            toast.success('Account activated successfully!');
            resetAndClose();
            // Refresh page to reflect new status
            window.location.reload();
        } catch (err: unknown) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to activate with code');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-[2.5rem]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                        <h2 className="text-xl font-black text-zinc-900 tracking-tight">
                            {view === 'selection' && 'Activate Your Account'}
                            {view === 'code' && 'Activation with Code'}
                            {view === 'transfer' && 'Activation by Transfer'}
                            {view === 'transfer_details' && 'Transfer Details'}
                            {view === 'card' && 'Pay With Card'}
                        </h2>
                        <button onClick={resetAndClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                            <X size={20} className="text-zinc-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        {view === 'selection' && (
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-zinc-600 leading-relaxed mb-4">
                                    Select your preferred activation method to proceed.
                                </p>
                                <div className="space-y-3">
                                    <Button 
                                        onClick={() => setView('code')}
                                        className="w-full h-12 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl font-bold transition-all"
                                    >
                                        Activate With Code
                                    </Button>
                                    <Button 
                                        onClick={() => setView('transfer')}
                                        className="w-full h-12 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl font-bold transition-all"
                                    >
                                        Pay By Transfer
                                    </Button>
                                    {/* <Button
                                        onClick={() => setView('card')}
                                        className="w-full h-12 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl font-bold transition-all"
                                    >
                                        Pay With Card
                                    </Button> */}
                                    <Button 
                                        variant="outline"
                                        onClick={resetAndClose}
                                        className="w-full h-12 border-zinc-200 text-zinc-500 rounded-xl font-bold hover:bg-zinc-50 transition-all"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {view === 'card' && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                                        Enter your card details to proceed with payment
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700">Activation Total Amount</label>
                                        <div className="h-14 px-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center">
                                            <span className="text-lg font-bold text-zinc-600">
                                                {((activationData?.total || 0) * (1 + selectedTeamMembers.length)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <label className="text-sm font-bold text-zinc-700">Multiple Account Activation</label>
                                        <input 
                                            type="checkbox" 
                                            checked={isMultiple}
                                            onChange={(e) => setIsMultiple(e.target.checked)}
                                            className="w-5 h-5 rounded border-zinc-300 text-[#9333ea] focus:ring-[#9333ea]"
                                        />
                                    </div>

                                    {isMultiple && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-700">Select Activation Team Member</label>
                                            <div className="relative">
                                                <div className="min-h-[48px] p-2 border border-zinc-200 rounded-xl bg-white flex flex-wrap gap-2">
                                                    {selectedTeamMembers.map(id => {
                                                        const member = candidates.find(c => c.id === id);
                                                        return (
                                                            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-lg">
                                                                {member?.username}
                                                                <button onClick={() => toggleMember(id)} className="hover:text-red-500">
                                                                    <X size={12} />
                                                                </button>
                                                            </span>
                                                        );
                                                    })}
                                                    <input 
                                                        placeholder={selectedTeamMembers.length === 0 ? "Search members..." : ""}
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="flex-1 min-w-[100px] border-none outline-none text-sm p-1"
                                                    />
                                                </div>

                                                {searchTerm && filteredCandidates.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                        {filteredCandidates.map(member => (
                                                            <button
                                                                key={member.id}
                                                                onClick={() => toggleMember(member.id)}
                                                                className="w-full p-3 text-left hover:bg-zinc-50 flex items-center justify-between group"
                                                            >
                                                                <span className="text-sm font-medium text-zinc-700">{member.username}</span>
                                                                {selectedTeamMembers.includes(member.id) && <Check size={16} className="text-[#9333ea]" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        variant="outline"
                                        onClick={() => setView('selection')}
                                        className="flex-1 h-12 border-zinc-200 text-zinc-500 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handlePayWithCard}
                                        disabled={isInitiating}
                                        className="flex-1 h-12 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl font-bold shadow-lg shadow-purple-200/50 disabled:opacity-50"
                                    >
                                        {isInitiating ? 'Processing...' : 'Submit'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {view === 'code' && (
                            <div className="space-y-6">
                                <p className="text-sm text-zinc-500">Fill the form below with details to activate your account</p>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Activation Code</label>
                                    <Input 
                                        placeholder="activation code"
                                        value={activationCode}
                                        onChange={(e) => setActivationCode(e.target.value)}
                                        className="h-12 border-zinc-200 focus:border-[#9333ea] focus:ring-[#9333ea]"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-bold text-zinc-700">Multiple Account Activation</label>
                                    <input 
                                        type="checkbox" 
                                        checked={isMultiple}
                                        onChange={(e) => setIsMultiple(e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-300 text-[#9333ea] focus:ring-[#9333ea]"
                                    />
                                </div>

                                {isMultiple && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700">Select Activation Team Member</label>
                                        <div className="relative">
                                            <div className="min-h-[48px] p-2 border border-zinc-200 rounded-xl bg-white flex flex-wrap gap-2">
                                                {selectedTeamMembers.map(id => {
                                                    const member = candidates.find(c => c.id === id);
                                                    return (
                                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-lg">
                                                            {member?.username}
                                                            <button onClick={() => toggleMember(id)} className="hover:text-red-500">
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    );
                                                })}
                                                <input 
                                                    placeholder={selectedTeamMembers.length === 0 ? "Search members..." : ""}
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="flex-1 min-w-[100px] border-none outline-none text-sm p-1"
                                                />
                                            </div>

                                            {searchTerm && filteredCandidates.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                    {filteredCandidates.map(member => (
                                                        <button
                                                            key={member.id}
                                                            onClick={() => toggleMember(member.id)}
                                                            className="w-full p-3 text-left hover:bg-zinc-50 flex items-center justify-between group"
                                                        >
                                                            <span className="text-sm font-medium text-zinc-700">{member.username}</span>
                                                            {selectedTeamMembers.includes(member.id) && <Check size={16} className="text-[#9333ea]" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        variant="outline"
                                        onClick={() => setView('selection')}
                                        className="flex-1 h-12 border-zinc-200 text-zinc-500 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleActivateByCode}
                                        disabled={!activationCode || isActivatingByCode}
                                        className="flex-1 h-12 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl font-bold disabled:opacity-50"
                                    >
                                        {isActivatingByCode ? 'Activating...' : 'Activate'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {view === 'transfer' && (
                            <div className="space-y-6">
                                <p className="text-sm text-zinc-500">Add team member if any, if not click continue to transfer</p>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Amount</label>
                                    <Input 
                                        readOnly
                                        value={((activationData?.total || 0) * (1 + (selectedTeamMembers.length))).toFixed(2)}
                                        className="h-12 bg-zinc-50 border-zinc-200 text-zinc-600 font-bold"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-bold text-zinc-700">Multiple Account Activation</label>
                                    <input 
                                        type="checkbox" 
                                        checked={isMultiple}
                                        onChange={(e) => setIsMultiple(e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-300 text-[#9333ea] focus:ring-[#9333ea]"
                                    />
                                </div>

                                {isMultiple && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700">Select Activation Team Member</label>
                                        <div className="relative">
                                            <div className="min-h-[48px] p-2 border border-zinc-200 rounded-xl bg-white flex flex-wrap gap-2">
                                                {selectedTeamMembers.map(id => {
                                                    const member = candidates.find(c => c.id === id);
                                                    return (
                                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-lg">
                                                            {member?.username}
                                                            <button onClick={() => toggleMember(id)} className="hover:text-red-500">
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    );
                                                })}
                                                <input 
                                                    placeholder={selectedTeamMembers.length === 0 ? "Search members..." : ""}
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="flex-1 min-w-[100px] border-none outline-none text-sm p-1"
                                                />
                                            </div>

                                        {searchTerm && filteredCandidates.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                    {filteredCandidates.map(member => (
                                                        <button
                                                            key={member.id}
                                                            onClick={() => toggleMember(member.id)}
                                                            className="w-full p-3 text-left hover:bg-zinc-50 flex items-center justify-between group"
                                                        >
                                                            <span className="text-sm font-medium text-zinc-700">{member.username}</span>
                                                            {selectedTeamMembers.includes(member.id) && <Check size={16} className="text-[#9333ea]" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        variant="outline"
                                        onClick={() => setView('selection')}
                                        className="flex-1 h-12 border-zinc-200 text-zinc-500 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleGenerateVirtualAccount}
                                        disabled={isGenerating}
                                        className="flex-1 h-12 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl font-bold disabled:opacity-50"
                                    >
                                        {isGenerating ? 'Generating...' : 'Continue to Transfer'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {view === 'transfer_details' && transferDetails && (
                            <div className="space-y-6">
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                                        <span className="text-sm font-medium text-purple-600">Bank Name</span>
                                        <span className="text-sm font-bold text-zinc-900">{transferDetails.bank_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                                        <span className="text-sm font-medium text-purple-600">Account Name</span>
                                        <span className="text-sm font-bold text-zinc-900">{transferDetails.account_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                                        <span className="text-sm font-medium text-purple-600">Account Number</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-zinc-900 tracking-wider text-lg">{transferDetails.account_number}</span>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(transferDetails.account_number);
                                                    toast.success('Account number copied!');
                                                }}
                                                className="p-1 hover:bg-purple-100 rounded text-purple-600"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                                        <span className="text-sm font-medium text-purple-600">Amount to Pay</span>
                                        <span className="text-sm font-black text-zinc-900 text-lg">{formatCurrency(Number(transferDetails.amount))}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-purple-600">Expires At</span>
                                        <span className="text-sm font-bold text-red-500">{transferDetails.expires_at}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                        <span className="font-bold">Important:</span> This account is valid for 30 minutes only. Please ensure you make the exact transfer within this period.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                                        Upload Proof of Payment (Optional)
                                    </label>
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => setSelectedProof(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={cn(
                                            "w-full h-14 border-2 border-dashed rounded-2xl flex items-center px-4 transition-all",
                                            selectedProof ? "border-purple-500 bg-purple-50" : "border-zinc-200 hover:border-purple-300 bg-zinc-50"
                                        )}>
                                            <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100 mr-3">
                                                <Ticket size={18} className={selectedProof ? "text-purple-600" : "text-zinc-400"} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-bold truncate",
                                                    selectedProof ? "text-purple-700" : "text-zinc-500"
                                                )}>
                                                    {selectedProof ? selectedProof.name : "Select receipt image"}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 font-medium">JPG, PNG or WEBP</p>
                                            </div>
                                            {selectedProof && (
                                                <Check size={18} className="text-purple-600" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button 
                                        onClick={handleSentMoney}
                                        disabled={isPolling || isSubmittingProof}
                                        className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold disabled:opacity-50"
                                    >
                                        {isPolling ? 'Verifying...' : 'I have sent the money'}
                                    </Button>
                                    {selectedProof && (
                                        <Button 
                                            onClick={handleUploadProof}
                                            disabled={isSubmittingProof || isPolling}
                                            className="flex-1 h-12 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl font-bold disabled:opacity-50"
                                        >
                                            {isSubmittingProof ? 'Uploading...' : 'Submit Proof'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
