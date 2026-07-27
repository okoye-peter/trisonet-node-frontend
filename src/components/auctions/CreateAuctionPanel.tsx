'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useGetWalletsQuery } from '@/store/api/walletApi';
import { useCreateAuctionMutation, useGetAuctionSettingsQuery } from '@/store/api/auctionApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateAuctionSteps } from './CreateAuctionSteps';
import { AuctionPreviewSidebar } from './AuctionPreviewSidebar';
import { formatGkwth } from '@/lib/utils';

// Keep in sync with MIN/MAX_DURATION_HOURS in backend/src/services/auction.service.ts
const MIN_DURATION_HOURS = 1;
const MAX_DURATION_HOURS = 720; // 30 days

const createSchema = (maxGkwthAmount: number, maxStartingBid: number) => z.object({
    gkwthAmount: z.number()
        .min(1, 'Minimum auction amount is 1 GKWTH')
        .max(maxGkwthAmount, `You can put up to ${maxGkwthAmount} GKWTH up for sale. 1 GKWTH must always stay in your wallet, so this is the maximum you're able to list right now.`)
        .refine((v) => Math.round(v * 100) === v * 100, 'Amount can have at most 2 decimal places'),
    startingBid: z.number()
        .positive('Enter a starting bid greater than 0')
        .max(maxStartingBid, `Starting bid can't exceed ₦${maxStartingBid.toLocaleString()}`),
    buyItNowPrice: z.number().optional(),
    durationHours: z.number()
        .min(MIN_DURATION_HOURS, `Duration must be at least ${MIN_DURATION_HOURS} hour`)
        .max(MAX_DURATION_HOURS, `Duration can't be more than ${MAX_DURATION_HOURS} hours (30 days)`),
});

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const DURATIONS = [
    { hours: 6, label: '6', unit: 'Hours' },
    { hours: 24, label: '24', unit: 'Hours' },
    { hours: 72, label: '3', unit: 'Days' },
    { hours: 168, label: '7', unit: 'Days' },
];

export function CreateAuctionPanel({ onCreated }: { onCreated: (auctionId: string) => void }) {
    const currency = '₦'; // auctions are always Naira-denominated, regardless of the viewer's own wallet currency
    const [step, setStep] = useState(1);
    const { data: walletsResponse } = useGetWalletsQuery();
    const { data: settingsResponse } = useGetAuctionSettingsQuery();
    const commissionPercent = settingsResponse?.data?.commissionPercent ?? 0.5;
    const maxStartingBid = settingsResponse?.data?.maxPrice ?? Infinity;
    const gkwthWallet = (walletsResponse?.data || []).find((w) => w.type === 'indirect');
    // A GKWTH wallet must always keep at least 1 GKWTH — the last unit can never be sold or withdrawn.
    const maxSellableGkwth = formatGkwth(Math.max(0, (gkwthWallet?.amount ?? 0) - 1));
    const [createAuction, { isLoading }] = useCreateAuctionMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(createSchema(maxSellableGkwth, maxStartingBid)),
        defaultValues: {
            gkwthAmount: 0,
            startingBid: 0,
            durationHours: 24,
        },
    });

    const values = form.watch();
    // True once the seller opts into a custom duration, or if the current value doesn't match
    // any preset (e.g. it was set to a custom value before navigating back to this step).
    const [isCustomDuration, setIsCustomDuration] = useState(false);
    const isPresetDuration = DURATIONS.some((d) => d.hours === values.durationHours);

    const nextStep = async () => {
        const fieldsByStep: Record<number, (keyof FormValues)[]> = {
            1: ['gkwthAmount'],
            2: ['startingBid', 'buyItNowPrice'],
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
            onCreated(result.data?.id as string);
        } catch (error: unknown) {
            const apiError = error as { data?: { message?: string } };
            toast.error(apiError?.data?.message || 'Failed to launch auction');
        }
    };

    return (
        <div className="space-y-6">
            <CreateAuctionSteps current={step} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                    {step === 1 && (
                        <Card className="gap-0 py-0">
                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <div>
                                    <div className="text-sm font-semibold text-foreground">GKWTH Amount to Sell</div>
                                    <div className="text-xs text-muted-foreground">How much GKWTH do you want to auction?</div>
                                </div>
                                <div className="rounded-lg bg-indigo-50 px-3.5 py-2 text-right">
                                    <div className="text-xs text-muted-foreground">You Can Sell</div>
                                    <div className="text-base font-bold text-indigo-700">{maxSellableGkwth} GKWTH</div>
                                    <div className="text-[11px] text-muted-foreground">of {gkwthWallet?.amount ?? 0} total</div>
                                </div>
                            </div>
                            <div className="p-5">
                                <label className="mb-1.5 block text-sm font-semibold text-foreground">Amount (GKWTH)</label>
                                <input
                                    type="number"
                                    min={1}
                                    step={0.01}
                                    {...form.register('gkwthAmount', { valueAsNumber: true })}
                                    className="w-full rounded-xl border-[1.5px] border-border bg-muted/40 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-background"
                                />
                                {form.formState.errors.gkwthAmount && (
                                    <p className="mt-1 text-xs text-destructive">{form.formState.errors.gkwthAmount.message}</p>
                                )}
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    Available to sell: {maxSellableGkwth} GKWTH · Minimum: 1 GKWTH
                                    <span className="block text-muted-foreground">(1 GKWTH always stays in your wallet)</span>
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
                        </Card>
                    )}

                    {step === 2 && (
                        <Card className="gap-0 py-0">
                            <div className="border-b border-border px-5 py-4">
                                <div className="text-sm font-semibold text-foreground">Bidding & Pricing Setup</div>
                                <div className="text-xs text-muted-foreground">Define the starting price</div>
                            </div>
                            <div className="space-y-4 p-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Starting Bid ({currency})</label>
                                    <input
                                        type="number"
                                        {...form.register('startingBid', { valueAsNumber: true })}
                                        className="w-full rounded-xl border-[1.5px] border-border bg-muted/40 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-background"
                                    />
                                    {form.formState.errors.startingBid ? (
                                        <p className="mt-1 text-xs text-destructive">{form.formState.errors.startingBid.message}</p>
                                    ) : Number.isFinite(maxStartingBid) && (
                                        <p className="mt-1 text-xs text-muted-foreground">Maximum starting bid: {currency}{maxStartingBid.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {step === 3 && (
                        <Card className="gap-0 py-0">
                            <div className="border-b border-border px-5 py-4">
                                <div className="text-sm font-semibold text-foreground">Auction Duration</div>
                                <div className="text-xs text-muted-foreground">How long should bidding be open?</div>
                            </div>
                            <div className="p-5">
                                <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                                    {DURATIONS.map((d) => (
                                        <button
                                            key={d.hours}
                                            type="button"
                                            onClick={() => {
                                                setIsCustomDuration(false);
                                                form.setValue('durationHours', d.hours, { shouldValidate: true });
                                            }}
                                            className={`rounded-xl border-2 p-3.5 text-center transition-all ${
                                                !isCustomDuration && values.durationHours === d.hours ? 'border-indigo-600 bg-indigo-50' : 'border-border hover:border-indigo-300'
                                            }`}
                                        >
                                            <div className={`text-xl font-bold ${!isCustomDuration && values.durationHours === d.hours ? 'text-indigo-700' : 'text-foreground'}`}>{d.label}</div>
                                            <div className={`text-xs ${!isCustomDuration && values.durationHours === d.hours ? 'text-indigo-500' : 'text-muted-foreground'}`}>{d.unit}</div>
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCustomDuration(true);
                                            if (isPresetDuration) form.setValue('durationHours', 48, { shouldValidate: true });
                                        }}
                                        className={`rounded-xl border-2 p-3.5 text-center transition-all ${
                                            isCustomDuration || !isPresetDuration ? 'border-indigo-600 bg-indigo-50' : 'border-border hover:border-indigo-300'
                                        }`}
                                    >
                                        <div className={`text-xl font-bold ${isCustomDuration || !isPresetDuration ? 'text-indigo-700' : 'text-foreground'}`}>...</div>
                                        <div className={`text-xs ${isCustomDuration || !isPresetDuration ? 'text-indigo-500' : 'text-muted-foreground'}`}>Custom</div>
                                    </button>
                                </div>

                                {(isCustomDuration || !isPresetDuration) && (
                                    <div className="mb-4">
                                        <label className="mb-1.5 block text-sm font-semibold text-foreground">Custom duration (hours)</label>
                                        <input
                                            type="number"
                                            min={MIN_DURATION_HOURS}
                                            max={MAX_DURATION_HOURS}
                                            value={values.durationHours || ''}
                                            onChange={(e) => form.setValue('durationHours', Number(e.target.value), { shouldValidate: true })}
                                            placeholder={`Between ${MIN_DURATION_HOURS} and ${MAX_DURATION_HOURS} hours`}
                                            className="w-full rounded-xl border-[1.5px] border-border bg-muted/40 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-background"
                                        />
                                        {form.formState.errors.durationHours && (
                                            <p className="mt-1 text-xs text-destructive">{form.formState.errors.durationHours.message}</p>
                                        )}
                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                            {MAX_DURATION_HOURS / 24} days max — e.g. 48 for 2 days, 336 for 14 days.
                                        </p>
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    Auction ends: <strong>{new Date(Date.now() + values.durationHours * 3600 * 1000).toLocaleString()}</strong>
                                </p>
                            </div>
                        </Card>
                    )}

                    {step === 4 && (
                        <Card className="gap-0 py-0">
                            <div className="border-b border-border px-5 py-4">
                                <div className="text-sm font-semibold text-foreground">Advanced Settings</div>
                                <div className="text-xs text-muted-foreground">Buy now price</div>
                            </div>
                            <div className="space-y-4 p-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Buy It Now Price ({currency}) <span className="font-normal text-muted-foreground">(Optional)</span></label>
                                    <input
                                        type="number"
                                        placeholder="Allow instant purchase at this price"
                                        {...form.register('buyItNowPrice', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
                                        className="w-full rounded-xl border-[1.5px] border-border bg-muted/40 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-400 focus:bg-background"
                                    />
                                    {form.formState.errors.buyItNowPrice ? (
                                        <p className="mt-1.5 text-xs text-destructive">{form.formState.errors.buyItNowPrice.message}</p>
                                    ) : (
                                        <p className="mt-1.5 text-xs text-muted-foreground">If set, anyone can buy immediately — and any bid that reaches this price wins the auction instantly, even before the timer runs out</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep((s) => Math.max(s - 1, 1))}
                            disabled={step === 1}
                            className="disabled:opacity-0"
                        >
                            Back
                        </Button>
                        {step < 4 && (
                            <Button type="button" onClick={nextStep} className="bg-indigo-600 text-white hover:bg-indigo-700">
                                Continue
                            </Button>
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
