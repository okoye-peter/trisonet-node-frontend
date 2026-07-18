'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useGetWalletsQuery } from '@/store/api/walletApi';
import { useCreateAuctionMutation, useGetAuctionSettingsQuery } from '@/store/api/auctionApi';
import { CreateAuctionSteps } from '@/components/auctions/CreateAuctionSteps';
import { AuctionPreviewSidebar } from '@/components/auctions/AuctionPreviewSidebar';

const createSchema = (maxGkwthAmount: number) => z.object({
    gkwthAmount: z.number()
        .positive('Enter an amount greater than 0')
        .max(maxGkwthAmount, `You can put up to ${maxGkwthAmount} GKWTH up for sale. 1 GKWTH must always stay in your wallet, so this is the maximum you're able to list right now.`),
    startingBid: z.number().positive('Enter a starting bid greater than 0'),
    buyItNowPrice: z.number().optional(),
    minIncrement: z.number().positive(),
    durationHours: z.number(),
});

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const DURATIONS = [
    { hours: 6, label: '6', unit: 'Hours' },
    { hours: 24, label: '24', unit: 'Hours' },
    { hours: 72, label: '3', unit: 'Days' },
    { hours: 168, label: '7', unit: 'Days' },
];

const INCREMENTS = [500, 1000, 2000];

export default function CreateAuctionPage() {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const router = useRouter();
    const [step, setStep] = useState(1);
    const { data: walletsResponse } = useGetWalletsQuery();
    const { data: settingsResponse } = useGetAuctionSettingsQuery();
    const commissionPercent = settingsResponse?.data?.commissionPercent ?? 0.5;
    const gkwthWallet = (walletsResponse?.data || []).find((w) => w.type === 'indirect');
    // A GKWTH wallet must always keep at least 1 GKWTH — the last unit can never be sold or withdrawn.
    const maxSellableGkwth = Math.max(0, (gkwthWallet?.amount ?? 0) - 1);
    const [createAuction, { isLoading }] = useCreateAuctionMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(createSchema(maxSellableGkwth)),
        defaultValues: {
            gkwthAmount: 50,
            startingBid: 900000,
            minIncrement: 1000,
            durationHours: 24,
        },
    });

    const values = form.watch();

    const nextStep = async () => {
        const fieldsByStep: Record<number, (keyof FormValues)[]> = {
            1: ['gkwthAmount'],
            2: ['startingBid', 'buyItNowPrice', 'minIncrement'],
            3: ['durationHours'],
        };
        const valid = await form.trigger(fieldsByStep[step]);
        if (valid) setStep((s) => Math.min(s + 1, 4));
    };

    const handleLaunch = async () => {
        const valid = await form.trigger();
        if (!valid) return;
        try {
            const result = await createAuction(form.getValues()).unwrap();
            toast.success('Auction launched successfully!');
            router.push(`/wallets/gkwth/auction/${result.data?.id}`);
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Failed to launch auction');
        }
    };

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-[#1a1060] p-8 md:p-10">
                <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="relative z-10">
                    <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur">
                        <Plus size={12} strokeWidth={2.5} /> Create a New Auction
                    </div>
                    <h1 className="text-2xl font-black text-white md:text-3xl">
                        List Your GKWTH <span className="text-indigo-300">for Sale</span>
                    </h1>
                    <p className="mt-3 text-sm text-white/60">Set your terms, open it to bidders, and accept the offer you&apos;re happy with.</p>
                </div>
            </div>

            <CreateAuctionSteps current={step} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                    {step === 1 && (
                        <div className="rounded-2xl border border-zinc-200 bg-white">
                            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                                <div>
                                    <div className="text-sm font-bold text-zinc-900">GKWTH Amount to Sell</div>
                                    <div className="text-xs text-zinc-400">How much GKWTH do you want to auction?</div>
                                </div>
                                <div className="rounded-lg bg-indigo-50 px-3.5 py-2 text-right">
                                    <div className="text-xs text-zinc-400">You Can Sell</div>
                                    <div className="text-base font-black text-indigo-700">{maxSellableGkwth} GKWTH</div>
                                    <div className="text-[11px] text-zinc-400">of {gkwthWallet?.amount ?? 0} total</div>
                                </div>
                            </div>
                            <div className="p-5">
                                <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Amount (GKWTH)</label>
                                <input
                                    type="number"
                                    {...form.register('gkwthAmount', { valueAsNumber: true })}
                                    className="w-full rounded-xl border-[1.5px] border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                                />
                                {form.formState.errors.gkwthAmount && (
                                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.gkwthAmount.message}</p>
                                )}
                                <p className="mt-1.5 text-xs text-zinc-400">
                                    Available to sell: {maxSellableGkwth} GKWTH · Minimum: 0.5 GKWTH
                                    <span className="block text-zinc-400">(1 GKWTH always stays in your wallet)</span>
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {[10, 25, 50, 100].filter((amt) => amt <= maxSellableGkwth).map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => form.setValue('gkwthAmount', amt)}
                                            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                                                values.gkwthAmount === amt ? 'bg-indigo-600 text-white' : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                            }`}
                                        >
                                            {amt} GKWTH
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => form.setValue('gkwthAmount', maxSellableGkwth)}
                                        disabled={maxSellableGkwth <= 0}
                                        className="rounded-lg border border-indigo-600 px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Max ({maxSellableGkwth})
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="rounded-2xl border border-zinc-200 bg-white">
                            <div className="border-b border-zinc-100 px-5 py-4">
                                <div className="text-sm font-bold text-zinc-900">Bidding & Pricing Setup</div>
                                <div className="text-xs text-zinc-400">Define the starting price</div>
                            </div>
                            <div className="space-y-4 p-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Starting Bid ({currency})</label>
                                    <input
                                        type="number"
                                        {...form.register('startingBid', { valueAsNumber: true })}
                                        className="w-full rounded-xl border-[1.5px] border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                                    />
                                    {form.formState.errors.startingBid && (
                                        <p className="mt-1 text-xs text-red-500">{form.formState.errors.startingBid.message}</p>
                                    )}
                                </div>
                                <div className="h-px bg-zinc-100" />
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Minimum Bid Increment ({currency})</label>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {INCREMENTS.map((inc) => (
                                            <button
                                                key={inc}
                                                type="button"
                                                onClick={() => form.setValue('minIncrement', inc)}
                                                className={`rounded-lg py-2 text-xs font-bold transition-all ${
                                                    values.minIncrement === inc ? 'bg-indigo-600 text-white' : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                                }`}
                                            >
                                                {currency}{inc.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="rounded-2xl border border-zinc-200 bg-white">
                            <div className="border-b border-zinc-100 px-5 py-4">
                                <div className="text-sm font-bold text-zinc-900">Auction Duration</div>
                                <div className="text-xs text-zinc-400">How long should bidding be open?</div>
                            </div>
                            <div className="p-5">
                                <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                    {DURATIONS.map((d) => (
                                        <button
                                            key={d.hours}
                                            type="button"
                                            onClick={() => form.setValue('durationHours', d.hours)}
                                            className={`rounded-xl border-2 p-3.5 text-center transition-all ${
                                                values.durationHours === d.hours ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            <div className={`text-xl font-black ${values.durationHours === d.hours ? 'text-indigo-700' : 'text-zinc-700'}`}>{d.label}</div>
                                            <div className={`text-xs ${values.durationHours === d.hours ? 'text-indigo-500' : 'text-zinc-400'}`}>{d.unit}</div>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-400">
                                    Auction ends: <strong>{new Date(Date.now() + values.durationHours * 3600 * 1000).toLocaleString()}</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="rounded-2xl border border-zinc-200 bg-white">
                            <div className="border-b border-zinc-100 px-5 py-4">
                                <div className="text-sm font-bold text-zinc-900">Advanced Settings</div>
                                <div className="text-xs text-zinc-400">Buy now price</div>
                            </div>
                            <div className="space-y-4 p-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Buy It Now Price ({currency}) <span className="font-normal text-zinc-400">(Optional)</span></label>
                                    <input
                                        type="number"
                                        placeholder="Allow instant purchase at this price"
                                        {...form.register('buyItNowPrice', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
                                        className="w-full rounded-xl border-[1.5px] border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-white"
                                    />
                                    {form.formState.errors.buyItNowPrice ? (
                                        <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.buyItNowPrice.message}</p>
                                    ) : (
                                        <p className="mt-1.5 text-xs text-zinc-400">If set, anyone can buy immediately — and any bid that reaches this price wins the auction instantly, even before the timer runs out</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setStep((s) => Math.max(s - 1, 1))}
                            disabled={step === 1}
                            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-bold text-zinc-600 disabled:opacity-0"
                        >
                            Back
                        </button>
                        {step < 4 && (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                            >
                                Continue
                            </button>
                        )}
                    </div>
                </div>

                <AuctionPreviewSidebar
                    gkwthAmount={values.gkwthAmount}
                    startingBid={values.startingBid}
                    durationHours={values.durationHours}
                    commissionPercent={commissionPercent}
                    isSubmitting={isLoading}
                    onLaunch={handleLaunch}
                />
            </div>
        </div>
    );
}
