'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Send, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ActivationCandidate } from '@/types';
import { toast } from 'sonner';
import { useGetActivationCandidatesQuery, useInitiateActivationPaymentMutation, useGenerateActivationVirtualAccountMutation, useLazyCheckActivationStatusQuery, useActivateByCodeMutation } from '@/store/api/userApi';

declare global {
    interface Window {
        PagaCheckout: {
            setOptions: (options: {
                publicKey: string;
                amount: number;
                currency?: string;
                email?: string;
                phoneNumber?: string;
                payment_reference?: string;
                funding_sources?: string;
                callback_url?: string;
                charge_url?: string // browser redirect URL for the JS setOptions API
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

type ModalView = 'selection' | 'code' | 'transfer' | 'card' | 'transfer_details' | 'verifying';

const PAGA_SCRIPT_URL = 'https://checkout.paga.com/checkout/inline-js';

function loadScript(src: string, id?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (id && document.getElementById(id)) { resolve(); return; }
        const s = document.createElement('script');
        if (id) s.id = id;
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.body.appendChild(s);
    });
}

async function loadPagaScript(): Promise<void> {
    if (window.PagaCheckout) return;

    // Remove stale tag so Paga's script re-executes — Paga clears window.PagaCheckout
    // after each checkout session, so the script must run fresh every time.
    document.getElementById('paga-script')?.remove();
    await loadScript(PAGA_SCRIPT_URL, 'paga-script');

    // The bridge runs without an id so it always re-executes after the Paga script.
    // It accesses PagaCheckout as a bare global name (class declarations live in the
    // global scope but are NOT properties of window, so window/globalThis won't see it).
    await loadScript('/paga-bridge.js');

    if (!window.PagaCheckout) throw new Error('PagaCheckout not defined after load');
}

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
    const [checkStatus] = useLazyCheckActivationStatusQuery();

    // Preload Paga script as soon as the modal is opened
    useEffect(() => {
        if (isOpen) loadPagaScript().catch(() => { });
    }, [isOpen]);

    // Handle redirect back from Paga checkout.
    // Paga appends charge_reference, status_message, status_code to charge_url.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const chargeRef = params.get('charge_reference');
        const statusCode = params.get('status_code');
        if (!chargeRef) return;

        // Clean Paga params from URL without triggering navigation
        ['charge_reference', 'status_message', 'status_code'].forEach(k => params.delete(k));
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);

        // status_code=0 means success; anything else is a failure or cancel
        if (statusCode !== '0') {
            toast.error('Payment was not completed. Please try again.');
            return;
        }

        toast.info('Verifying your payment…');

        let totalTime = 0;
        let delay = 2000;
        const maxTime = 120000;
        let cancelled = false;

        const poll = async () => {
            if (cancelled || totalTime >= maxTime) {
                if (!cancelled) toast.info('Payment is still being processed. We will notify you once confirmed.');
                return;
            }
            try {
                const res = await checkStatus(chargeRef).unwrap();
                if (res.data?.status === 'approved') {
                    toast.success('Payment confirmed! Your account has been activated.');
                    window.location.reload();
                    return;
                }
            } catch { /* keep polling */ }

            setTimeout(() => {
                totalTime += delay;
                delay = Math.min(delay * 1.5, 30000);
                poll();
            }, delay);
        };

        poll();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

            await loadPagaScript();

            // Paga redirects the browser here on close/cancel/success.
            // Must be a frontend page — the webhook env var is for Paga's server-to-server
            // charge_url = where the browser is redirected after payment/cancel (docs).
            // callback_url = server-side webhook (Paga validates it; use the registered one).
            // Paga appends charge_reference, status_message, status_code to charge_url.
            const chargeUrl = `${window.location.origin}${window.location.pathname}`;

            window.PagaCheckout.setOptions({
                publicKey,
                amount: Number(Number(amount).toFixed(2)),
                currency: 'NGN',
                phoneNumber,
                email,
                payment_reference: reference,
                funding_sources: 'CARD',
                callback_url: process.env.NEXT_PUBLIC_PAGA_CALLBACK_URL,
                charge_url: chargeUrl,
            });

            resetAndClose();
            window.PagaCheckout.openCheckout();

            // Paga injects its iframe/overlay with a low z-index — boost only z-index,
            // never position (changing position breaks Paga's own close/layout logic).
            const boostZ = (node: Element) => {
                (node as HTMLElement).style.setProperty('z-index', '2147483647', 'important');
            };

            // Remove Paga's iframe and any wrapper it injected.
            const closePagaOverlay = () => {
                document.querySelectorAll('iframe').forEach(iframe => {
                    if (iframe.src.includes('paga.com')) {
                        iframe.parentElement?.remove();
                        iframe.remove();
                    }
                });
            };

            // Listen for Paga's postMessage close event. Paga calls onClose() via
            // postMessage; since we can't pass onClose (it causes 403 in redirect mode),
            // we handle the message ourselves and tear down the overlay manually.
            const onPagaMessage = (e: MessageEvent) => {
                if (!String(e.origin).includes('paga')) return;
                const d = e.data;
                const isClose =
                    d === 'close' ||
                    d?.type === 'close' ||
                    d?.event === 'close' ||
                    d?.action === 'close' ||
                    d?.status === 'cancelled' ||
                    d?.status === 'closed';
                if (isClose) {
                    closePagaOverlay();
                    window.removeEventListener('message', onPagaMessage);
                }
            };
            window.addEventListener('message', onPagaMessage);

            const observer = new MutationObserver(() => {
                document.querySelectorAll('iframe').forEach(iframe => {
                    if (iframe.src.includes('paga.com')) {
                        boostZ(iframe);
                        if (iframe.parentElement) boostZ(iframe.parentElement);
                    }
                });
            });

            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => observer.disconnect(), 10000);

        } catch (err: unknown) {
            console.error('Payment error:', err);
            const apiErr = err as { data?: { message?: string }, message?: string };
            const msg = apiErr.data?.message || apiErr.message || 'Failed to initiate payment. Please try again.';
            toast.error(msg);
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
                    amount: res.data.account_detail.amount ?? Number(amount),
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

        setView('verifying');
        setIsPolling(true);

        let totalTime = 0;
        let delay = 2000;
        const maxTime = 120000;

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
                delay = Math.min(delay * 1.5, 30000);
                poll();
            }, delay);
        };

        poll();
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

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 flex items-center justify-center p-4 z-9999 bg-zinc-950/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-[2.5rem]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                        <h2 className="text-xl font-black tracking-tight text-zinc-900">
                            {view === 'selection' && 'Activate Your Account'}
                            {view === 'code' && 'Activation with Code'}
                            {view === 'transfer' && 'Activation by Transfer'}
                            {view === 'transfer_details' && 'Transfer Details'}
                            {view === 'card' && 'Pay With Card'}
                            {view === 'verifying' && 'Verifying Payment'}
                        </h2>
                        <button onClick={resetAndClose} className="p-2 transition-colors rounded-full hover:bg-zinc-100">
                            <X size={20} className="text-zinc-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        {view === 'selection' && (
                            <div className="space-y-4">
                                <p className="mb-4 text-sm font-medium leading-relaxed text-zinc-600">
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
                                    <Button
                                        onClick={() => setView('card')}
                                        className="w-full h-12 bg-[#9333ea] hover:bg-[#7e22ce] text-white rounded-xl font-bold transition-all"
                                    >
                                        Pay With Card
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={resetAndClose}
                                        className="w-full h-12 font-bold transition-all border-zinc-200 text-zinc-500 rounded-xl hover:bg-zinc-50"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {view === 'card' && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold leading-tight text-zinc-900">
                                        Enter your card details to proceed with payment
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700">Activation Total Amount</label>
                                        <div className="flex items-center px-4 border h-14 bg-zinc-50 rounded-xl border-zinc-200">
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
                                                            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg bg-zinc-100 text-zinc-700">
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
                                                    <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border shadow-lg border-zinc-200 rounded-xl max-h-48">
                                                        {filteredCandidates.map(member => (
                                                            <button
                                                                key={member.id}
                                                                onClick={() => toggleMember(member.id)}
                                                                className="flex items-center justify-between w-full p-3 text-left hover:bg-zinc-50 group"
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
                                        className="flex-1 h-12 font-bold border-zinc-200 text-zinc-500 rounded-xl"
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
                                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg bg-zinc-100 text-zinc-700">
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
                                                <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border shadow-lg border-zinc-200 rounded-xl max-h-48">
                                                    {filteredCandidates.map(member => (
                                                        <button
                                                            key={member.id}
                                                            onClick={() => toggleMember(member.id)}
                                                            className="flex items-center justify-between w-full p-3 text-left hover:bg-zinc-50 group"
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
                                        className="flex-1 h-12 font-bold border-zinc-200 text-zinc-500 rounded-xl"
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
                                        className="h-12 font-bold bg-zinc-50 border-zinc-200 text-zinc-600"
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
                                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg bg-zinc-100 text-zinc-700">
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
                                                <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border shadow-lg border-zinc-200 rounded-xl max-h-48">
                                                    {filteredCandidates.map(member => (
                                                        <button
                                                            key={member.id}
                                                            onClick={() => toggleMember(member.id)}
                                                            className="flex items-center justify-between w-full p-3 text-left hover:bg-zinc-50 group"
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
                                        className="flex-1 h-12 font-bold border-zinc-200 text-zinc-500 rounded-xl"
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
                                <div className="p-4 space-y-4 border border-purple-100 bg-purple-50 rounded-2xl">
                                    <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                                        <span className="text-sm font-medium text-purple-600">Bank Name</span>
                                        <span className="text-sm font-bold text-zinc-900">{transferDetails.bank_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                                        <span className="text-sm font-medium text-purple-600">Account Name</span>
                                        <span className="text-sm font-bold text-zinc-900">{transferDetails.account_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                                        <span className="text-sm font-medium text-purple-600">Account Number</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-lg font-bold tracking-wider text-zinc-900">{transferDetails.account_number}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(transferDetails.account_number);
                                                    toast.success('Account number copied!');
                                                }}
                                                className="p-1 text-purple-600 rounded hover:bg-purple-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                                        <span className="text-sm font-medium text-purple-600">Amount to Pay</span>
                                        <span className="text-sm text-lg font-black text-zinc-900">{formatCurrency(Number(transferDetails.amount))}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-purple-600">Expires At</span>
                                        <span className="text-sm font-bold text-red-500">{transferDetails.expires_at}</span>
                                    </div>
                                </div>

                                <div className="p-4 border bg-amber-50 rounded-2xl border-amber-100">
                                    <p className="text-xs font-medium leading-relaxed text-amber-700">
                                        <span className="font-bold">Important:</span> This account is valid for 30 minutes only. Please ensure you make the exact transfer within this period.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleSentMoney}
                                    disabled={isPolling}
                                    className="w-full h-12 font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl disabled:opacity-50"
                                >
                                    I have sent the money
                                </Button>
                            </div>
                        )}

                        {view === 'verifying' && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-6">
                                <div className="relative flex items-center justify-center w-24 h-24">
                                    <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-60" />
                                    <div className="absolute bg-purple-200 rounded-full inset-2 animate-pulse" />
                                    <Loader2 size={36} className="relative z-10 text-purple-600 animate-spin" />
                                </div>

                                <div className="space-y-2 text-center">
                                    <h3 className="text-xl font-black text-zinc-900">Verifying Payment</h3>
                                    <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
                                        We&apos;re confirming your transfer. This usually takes a few seconds.
                                    </p>
                                </div>

                                <div className="w-full p-4 border bg-amber-50 rounded-2xl border-amber-100">
                                    <p className="text-xs font-medium leading-relaxed text-center text-amber-700">
                                        <span className="font-bold">Please wait</span> — do not close this window while we verify your payment.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
