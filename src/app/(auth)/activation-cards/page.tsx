'use client'

import React, { useState, useEffect, useCallback, startTransition } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CreditCard,
    Plus,
    History,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Wallet,
    Copy,
    Check,
    AlertCircle,
    RefreshCw,
    Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import LoadingScreen from '@/components/LoadingScreen'
import { useGetPimCardsQuery, useGetPimCardsSummaryQuery, usePurchasePimCardMutation, useVerifyCardPurchasePaymentMutation, useInitiateCardPurchasePaymentMutation, type PaymentAccountDetail, type PimCard } from '@/store/api/pimCardApi'
import { useGetUserQuery } from '@/store/api/userApi'
import { toast } from 'sonner'
import { useCurrencySymbol } from '@/hooks/useCurrencySymbol'

// ─── Paga inline checkout helpers ────────────────────────────────────────────
declare global { interface Window { PagaCheckout: { setOptions: (o: any) => void; openCheckout: () => void } } }

function loadScript(src: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) { resolve(); return; }
        const s = document.createElement('script');
        s.id = id; s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.body.appendChild(s);
    });
}

async function loadPagaScript(): Promise<void> {
    if (window.PagaCheckout) return;
    document.getElementById('paga-pim-script')?.remove();
    await loadScript('https://checkout.paga.com/checkout/inline-js', 'paga-pim-script');
    await loadScript('/paga-bridge.js');
    if (!window.PagaCheckout) throw new Error('PagaCheckout not defined after load');
}

const NairaIcon = ({ size = 24, className }: { size?: number, className?: string }) => {
    const currency = useCurrencySymbol()
    return <span className={cn("font-bold flex items-center justify-center", className)} style={{ fontSize: size }}>{currency}</span>
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PimCardsSummary {
    totalCards: number
    availableSlots: number
    usedSlots: number
    totalSlots: number
    pendingCards: number
    price: number
    basePrice: number
    activeCard: {
        id: string
        code: string
        amount: number
        pricePerUser: number
        createdAt: string
        slots: number
    } | null
    status: {
        PENDING: number
        APPROVED: number
        CANCELLED: number
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number | undefined | null, currency = '₦') =>
    n == null ? `${currency}0.00` : `${currency}${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (iso: string | undefined | null) =>
    iso ? new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const statusLabel = (status: number, slotsLeft: number = 0) => {
    if (status === 1 && slotsLeft <= 0) return 'Used'
    if (status === 0) return 'Pending'
    if (status === 1) return 'Approved'
    return 'Cancelled'
}

const statusClass = (status: number, slotsLeft: number = 0) => {
    if (status === 1 && slotsLeft <= 0) return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-400'
    if (status === 0) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
    if (status === 1) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
    return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse rounded-lg bg-muted', className)} />
)

// ─── Card Visual ─────────────────────────────────────────────────────────────

const CardVisual = ({ code, amount }: { code: string; amount: number }) => {
    const [copied, setCopied] = useState(false)
    const currency = useCurrencySymbol()

    const copy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative select-none">
            {/* Main card face */}
            <div className="relative w-full overflow-hidden rounded-3xl"
                style={{
                    aspectRatio: '1.586 / 1',
                    boxShadow: '0 30px 60px -10px rgba(0,0,0,.45)',
                }}
            >
                {/* Background Image */}
                <Image
                    src="/TRISONET 1.jpg"
                    alt="Card background"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                />

                {/* Subtle bottom scrim so text is readable */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Amount — bottom left */}
                <div className="absolute bottom-4 left-5">
                    <p className="text-white/50 text-[9px] font-semibold uppercase tracking-widest mb-0.5">Amount</p>
                    <p className="text-base font-black text-white drop-shadow">{fmt(amount, currency)}</p>
                </div>

                {/* Code — bottom right */}
                <div className="absolute flex items-center gap-2 bottom-4 right-4">
                    <span className="font-mono text-sm font-bold tracking-widest text-white/80 drop-shadow">{code}</span>
                    <button onClick={copy}
                        className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 transition-colors backdrop-blur-sm"
                        title="Copy code"
                    >
                        {copied
                            ? <Check className="w-3 h-3 text-emerald-400" />
                            : <Copy className="w-3 h-3 text-white/70" />
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────

const ActivationCards = () => {
    const currency = useCurrencySymbol()
    const [isMounted, setIsMounted] = useState(false)
    const [quantity, setQuantity] = useState(2)
    const [isOpen, setIsOpen] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [paymentDetails, setPaymentDetails] = useState<PaymentAccountDetail | null>(null)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)
    const [selectedCard, setSelectedCard] = useState<PimCard | null>(null)
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false)

    const [isVerifying, setIsVerifying] = useState(false)
    const [isTimeout, setIsTimeout] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [limit] = useState(10)

    const { data: cardsResponse, isLoading: isCardsLoading, isFetching: isCardsFetching, refetch: refetchCards } = useGetPimCardsQuery({ page: currentPage, limit })
    const { data: summaryResponse, isLoading: isSummaryLoading, refetch: refetchSummary } = useGetPimCardsSummaryQuery()
    const [purchaseCard, { isLoading: isPurchasing }] = usePurchasePimCardMutation()
    const [verifyPayment] = useVerifyCardPurchasePaymentMutation()
    const [initiateCardPayment, { isLoading: isInitiatingCard }] = useInitiateCardPurchasePaymentMutation()

    useEffect(() => {
        startTransition(() => {
            setIsMounted(true)
        })
    }, [])

    // Detect Paga redirect after card payment
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const chargeRef = params.get('charge_reference')
        const statusCode = params.get('status_code')
        if (!chargeRef) return

        params.delete('charge_reference')
        params.delete('status_message')
        params.delete('status_code')
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
        window.history.replaceState({}, '', newUrl)

        if (statusCode !== '0') {
            toast.error('Card payment was not completed. Please try again.')
            return
        }

        toast.loading('Verifying card payment…', { id: 'paga-verify' })
        const startTime = Date.now()
        const maxDuration = 120000
        let delay = 2000

        const poll = async () => {
            try {
                const res = await verifyPayment({ reference: chargeRef }).unwrap()
                if (res.status === 'success') {
                    toast.success('Card payment verified! Your PIM card is ready.', { id: 'paga-verify' })
                    refetchCards()
                    refetchSummary()
                    return
                }
            } catch {
                // continue polling
            }
            if (Date.now() - startTime >= maxDuration) {
                toast.error('Verification timed out. Contact support if payment was deducted.', { id: 'paga-verify' })
                return
            }
            setTimeout(poll, delay)
            delay = Math.min(delay * 1.5, 10000)
        }
        poll()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const cards = cardsResponse?.data?.data ?? []
    const meta = cardsResponse?.data?.meta
    const summary = summaryResponse?.data ?? null
    const loading = isCardsLoading || isSummaryLoading
    const isFetching = isCardsFetching
    const error = null // Error handling is now integrated in the hooks or toast

    const fetchData = useCallback(async () => {
        refetchCards()
        refetchSummary()
    }, [refetchCards, refetchSummary])

    const handleVerifyPayment = async () => {
        if (!paymentDetails?.reference) {
            toast.error('Payment reference missing');
            return;
        }

        setIsVerifying(true);
        setIsTimeout(false);

        const startTime = Date.now();
        const maxDuration = 60000; // 1 minute limit
        let currentDelay = 2000; // Start with 2 seconds

        const poll = async () => {
            try {
                const res = await verifyPayment({ reference: paymentDetails.reference }).unwrap();
                if (res.status === 'success') {
                    toast.success('Payment verified successfully!');
                    setIsPaymentModalOpen(false);
                    setIsVerifying(false);
                    setIsTimeout(false);
                    fetchData();
                    return;
                }
            } catch (err: unknown) {
                // If it's a 400 error (payment not yet detected), we continue polling
                console.log('Verification check failed, retrying...', err);
            }

            const elapsed = Date.now() - startTime;
            if (elapsed >= maxDuration) {
                setIsVerifying(false);
                setIsTimeout(true);
                return;
            }

            // Exponential backoff
            setTimeout(poll, currentDelay);
            currentDelay = Math.min(currentDelay * 1.5, 10000); // Max 10s delay
        };

        poll();
    };



    const { data: userResponse } = useGetUserQuery()
    const user = userResponse?.data?.user ?? null

    const pricePerCard = summary?.price ?? 0
    const basePrice = summary?.basePrice ?? 0
    // basePrice is the raw setting value (no charges). pricePerCard already has charges
    // for a single card baked in. Only calculate charge separately when we have the raw
    // basePrice — otherwise pricePerCard * quantity already approximates the correct total.
    const hasBasePrice = basePrice > 0
    const effectiveBase = hasBasePrice ? basePrice : pricePerCard
    const subtotal = quantity ? (user?.username === 'dev_user' ? 100 : quantity * effectiveBase) : 0

    const calculateCharge = (amount: number) => {
        if (amount === 0) return 0
        const chargeRate = 0.008062
        const vatRate = 0.075
        const capped = 1000

        const charge = amount * chargeRate
        const vat = charge * vatRate
        const totalCharge = charge + vat

        return Math.min(Math.round(totalCharge * 100) / 100, capped)
    }

    const charge = hasBasePrice ? calculateCharge(subtotal) : 0
    const totalAmount = subtotal + charge

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const handlePayWithCard = async () => {
        if (!quantity || quantity < 2) {
            toast.error('Minimum quantity is 2 cards')
            return
        }
        try {
            const res = await initiateCardPayment({ quantity, amount: totalAmount }).unwrap()
            const { reference, amount, publicKey, email, phoneNumber } = res.data!

            await loadPagaScript()

            const callbackUrl = `${window.location.origin}${window.location.pathname}`
            window.PagaCheckout.setOptions({
                publicKey,
                amount: Number(Number(amount).toFixed(2)),
                currency: 'NGN',
                phoneNumber,
                email,
                payment_reference: reference,
                funding_sources: 'CARD',
                callback_url: callbackUrl,
            })

            const observer = new MutationObserver(() => {
                const pagaIframe = document.querySelector('iframe[src*="paga"]') as HTMLElement | null
                if (pagaIframe) {
                    const parent = pagaIframe.parentElement as HTMLElement | null
                    if (parent) parent.style.zIndex = '2147483647'
                    pagaIframe.style.zIndex = '2147483647'
                    observer.disconnect()
                }
            })
            observer.observe(document.body, { childList: true, subtree: true })

            window.PagaCheckout.openCheckout()
            setIsOpen(false)
        } catch (err: unknown) {
            const error = err as { data?: { message?: string }; message?: string }
            toast.error(error?.data?.message || error?.message || 'Failed to initiate card payment')
        }
    }

    if (!isMounted || loading) return <LoadingScreen message="Loading your cards…" />

    const activeCard = summary?.activeCard ?? null

    const stats = summary ? [
        {
            label: 'Total Cards',
            value: summary.totalCards,
            icon: CreditCard,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20',
        },
        {
            label: 'Used Activation Slots',
            value: summary.usedSlots,
            icon: History,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
        },
        {
            label: 'Available Activation Slots',
            value: summary.availableSlots,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
        },
        {
            label: 'Pending Requests',
            value: summary.pendingCards,
            icon: Clock,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
        },
    ] : []

    return (
        <div className="container max-w-6xl px-3 py-6 mx-auto space-y-6 sm:py-10 sm:px-4 sm:space-y-10">

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col justify-between gap-6 md:flex-row md:items-center"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h1 className="text-2xl font-black tracking-tight text-transparent sm:text-3xl bg-linear-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text">
                            PIM Credit Cards
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Manage and request your community activation cards.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl border-muted-foreground/20 hover:bg-muted/30"
                        onClick={fetchData}
                        title="Refresh"
                    >
                        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                    </Button>

                    <Dialog open={isOpen} onOpenChange={(open) => {
                        setIsOpen(open)
                        if (!open) setQuantity(2)
                    }}>
                        <DialogTrigger render={
                            <Button
                                size="lg"
                                className="w-full font-bold transition-all shadow-lg rounded-xl shadow-primary/20 hover:scale-105 group sm:w-auto"
                            >
                                <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" />
                                Request New Card
                            </Button>
                        } />

                        <DialogContent className="sm:max-w-[440px] rounded-3xl border-none shadow-2xl p-8">
                            <DialogHeader className="mb-2 space-y-3">
                                <div className="flex items-center justify-center mb-1 border h-13 w-13 rounded-2xl bg-linear-to-br from-primary/20 to-emerald-500/10 border-primary/10">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                </div>
                                <DialogTitle className="text-2xl font-black">Purchase Cards</DialogTitle>
                                <DialogDescription>
                                    Fill the form to generate a virtual account for your card purchase.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-5 py-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black tracking-widest uppercase text-muted-foreground">
                                        Price Per Card
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            value={loading ? 'Loading…' : fmt(effectiveBase, currency)}
                                            disabled
                                            className="h-12 pr-10 text-base font-bold border-none bg-muted/40"
                                        />
                                        <Wallet className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground/40" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="qty" className="text-xs font-black tracking-widest uppercase text-muted-foreground">
                                        Quantity <span className="font-medium normal-case text-muted-foreground/50">(min: 2)</span>
                                    </Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        min={2}
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="h-12 text-base font-bold border-primary/20 focus-visible:ring-primary"
                                    />
                                </div>

                                {/* Total box */}
                                <div className="p-5 space-y-3 border rounded-2xl bg-linear-to-br from-primary/10 to-emerald-500/5 border-primary/15">
                                    <div className="flex items-center justify-between text-sm font-medium">
                                        <span className="overflow-hidden text-muted-foreground whitespace-nowrap text-ellipsis">Subtotal</span>
                                        <span className="flex-shrink-0 font-bold">{fmt(subtotal, currency)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm font-medium">
                                        <span className="overflow-hidden text-muted-foreground whitespace-nowrap text-ellipsis">Service Charge</span>
                                        <span className="flex-shrink-0 font-bold">{fmt(charge, currency)}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-primary/10">
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[.18em] mb-1">Total Amount</p>
                                            <p className="text-3xl font-black text-primary">
                                                {fmt(totalAmount, currency)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <Wallet className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="flex-col gap-3 sm:flex-col">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 text-base font-bold transition-all rounded-xl border-primary/30 hover:bg-primary/5 active:scale-95"
                                    onClick={handlePayWithCard}
                                    disabled={isInitiatingCard || isPurchasing}
                                >
                                    {isInitiatingCard ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <CreditCard className="w-5 h-5 mr-2" />}
                                    Pay with Card
                                </Button>
                                <Button
                                    className="w-full h-12 text-base font-bold transition-all shadow-xl rounded-xl shadow-primary/10 active:scale-95"
                                    onClick={async () => {
                                        try {
                                            const res = await purchaseCard({ quantity, amount: totalAmount }).unwrap();
                                            if (res.data) {
                                                setPaymentDetails(res.data.account_detail);
                                                setIsOpen(false);
                                                setIsPaymentModalOpen(true);
                                                toast.success('Virtual account generated!');
                                            }
                                        } catch (err: unknown) {
                                            const error = err as { data?: { message?: string }; message?: string };
                                            toast.error(error?.data?.message || error.message || 'Failed to generate virtual account');
                                        }
                                    }}
                                    disabled={isPurchasing || isInitiatingCard}
                                >
                                    {isPurchasing ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : null}
                                    Generate Virtual Account
                                    <ArrowUpRight className="w-5 h-5 ml-2" />
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* ── Error Banner ── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 p-4 text-sm font-medium text-red-700 border border-red-200 rounded-2xl bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                        <Button variant="ghost" size="sm" onClick={fetchData} className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-100">
                            Retry
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Active Card Visual + Stats ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Card Visual (spans 2 cols) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <Card className="h-full overflow-hidden border-none shadow-xl shadow-black/5 rounded-3xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between gap-2 text-sm font-black tracking-widest uppercase text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full animate-pulse",
                                        activeCard && activeCard.slots <= 0 ? "bg-zinc-400" : "bg-emerald-500"
                                    )} />
                                    Active Pim Code Card
                                </div>
                                {activeCard && activeCard.slots <= 0 && (
                                    <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-600 border-zinc-200">Used</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pt-0 pb-6">
                            {loading ? (
                                <Skeleton className="w-full h-52 rounded-3xl" />
                            ) : activeCard ? (
                                <CardVisual code={activeCard.code} amount={activeCard.amount} />
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full gap-3 border-2 border-dashed h-52 rounded-3xl border-muted-foreground/20 text-muted-foreground">
                                    <CreditCard className="w-10 h-10 opacity-30" />
                                    <p className="text-sm font-medium">No active card</p>
                                </div>
                            )}

                            {activeCard && !loading && (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className="p-3 rounded-2xl bg-muted/40">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Used</p>
                                        <p className="text-sm font-bold">{summary?.usedSlots ?? 0} Users</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-muted/40">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Available</p>
                                        <p className="text-sm font-bold text-emerald-600">{summary?.availableSlots ?? 0} Left</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-muted/40">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Price/Slot</p>
                                        <p className="text-sm font-bold">{fmt(activeCard.pricePerUser)}</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-muted/40">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Issued</p>
                                        <p className="text-sm font-bold">{fmtDate(activeCard.createdAt)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats grid (spans 3 cols) */}
                <div className="grid content-start grid-cols-1 gap-3 lg:col-span-3 md:grid-cols-2 sm:gap-4">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="w-full h-28 rounded-3xl" />
                        ))
                        : stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.07 }}
                            >
                                <Card className={cn(
                                    'border shadow-sm hover:shadow-md transition-all rounded-3xl group cursor-default h-full',
                                    stat.border
                                )}>
                                    <CardContent className="flex items-start justify-between h-full gap-3 p-4 sm:p-5">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-4xl font-black sm:text-4xl">{stat.value}</p>
                                        </div>
                                        <div className={cn('p-3 rounded-2xl mt-0.5 transition-transform group-hover:scale-110 shrink-0', stat.bg)}>
                                            <stat.icon className={cn('h-5 w-5', stat.color)} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    }
                </div>
            </div>

            {/* ── Price Banner ── */}
            {summary && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col justify-between gap-4 p-6 border rounded-3xl bg-linear-to-r from-primary/10 via-emerald-500/5 to-teal-500/10 border-primary/15 sm:flex-row sm:items-center"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/15 rounded-2xl">
                            <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5">Current Price Per Slot</p>
                            <p className="text-2xl font-black text-primary">{fmt(summary.price)}</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="font-bold transition-transform shadow-lg rounded-xl shadow-primary/20 hover:scale-105"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Get a Card
                    </Button>
                </motion.div>
            )}

            {/* ── Table ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
            >
                <Card className="overflow-hidden border-none shadow-xl shadow-black/5 rounded-3xl">
                    <CardHeader className="pb-4 p-7">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <History className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black">My PIM Credit Cards</CardTitle>
                                    <CardDescription className="text-xs mt-0.5">All your card purchases and their current status.</CardDescription>
                                </div>
                            </div>
                            {!loading && (
                                <Badge variant="secondary" className="px-3 text-xs font-black rounded-full">
                                    {meta?.totalItems ?? 0} card{(meta?.totalItems ?? 0) !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="space-y-3 p-7">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="w-full h-14 rounded-xl" />
                                ))}
                            </div>
                        ) : cards.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
                                <CreditCard className="w-12 h-12 opacity-20" />
                                <p className="text-sm font-medium">No cards found</p>
                                <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="rounded-xl">
                                    Request your first card
                                </Button>
                            </div>
                        ) : (
                            <Table className="min-w-[600px]">
                                <TableHeader className="bg-muted/20">
                                    <TableRow className="border-none hover:bg-transparent whitespace-nowrap">
                                        {['Code', 'Amount', 'Used', 'Available', 'Status', 'Date', 'Action'].map(h => (
                                            <TableHead key={h} className={cn(
                                                'font-black text-[10px] uppercase tracking-widest py-4',
                                                h === 'Code' && 'pl-4 sm:pl-7',
                                                h === 'Amount' && 'text-right',
                                                h === 'Used' && 'text-center',
                                                h === 'Available' && 'text-center',
                                                h === 'Status' && 'text-center',
                                                h === 'Date' && 'text-right table-cell',
                                                h === '' && 'pr-4 sm:pr-7'
                                            )}>
                                                {h}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cards.map((card) => (
                                        <TableRow
                                            key={card.id}
                                            className="transition-colors group hover:bg-muted/10 border-muted/10 last:border-0 whitespace-nowrap"
                                        >
                                            {/* Code */}
                                            <TableCell className="py-4 pl-4 sm:pl-7 sm:py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold sm:text-sm">{card.code}</span>
                                                    <button
                                                        onClick={() => copyCode(card.code)}
                                                        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-muted hover:bg-muted-foreground/20"
                                                        title="Copy code"
                                                    >
                                                        {copiedCode === card.code
                                                            ? <Check className="w-3 h-3 text-emerald-500" />
                                                            : <Copy className="w-3 h-3 text-muted-foreground" />
                                                        }
                                                    </button>
                                                </div>
                                            </TableCell>

                                            {/* Amount */}
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black sm:text-sm">{fmt(card.amount)}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">{fmt(card.pricePerUser)}/slot</span>
                                                </div>
                                            </TableCell>

                                            {/* Used */}
                                            <TableCell className="text-center">
                                                <span className="text-sm font-bold text-amber-600">{card.usersWithCard ? card.usersWithCard.length : (card._count?.usersWithCard || 0)}</span>
                                            </TableCell>

                                            {/* Available */}
                                            <TableCell className="text-center">
                                                <span className="text-sm font-bold text-emerald-600">
                                                    {card.slotsLeft !== undefined ? card.slotsLeft : (card.pricePerUser > 0 ? Math.max(0, Math.floor(card.amount / card.pricePerUser) - (card._count?.usersWithCard || 0)) : 0)}
                                                </span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="text-center">
                                                <Badge className={cn(
                                                    'rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wide border-none',
                                                    statusClass(card.status, card.slotsLeft !== undefined ? card.slotsLeft : (card.pricePerUser > 0 ? Math.max(0, Math.floor(card.amount / card.pricePerUser) - (card._count?.usersWithCard || 0)) : 0))
                                                )}>
                                                    {statusLabel(card.status, card.slotsLeft !== undefined ? card.slotsLeft : (card.pricePerUser > 0 ? Math.max(0, Math.floor(card.amount / card.pricePerUser) - (card._count?.usersWithCard || 0)) : 0))}
                                                </Badge>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell className="table-cell text-xs font-medium text-right text-muted-foreground">
                                                {fmtDate(card.createdAt)}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="pr-4 text-right sm:pr-7">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="rounded-xl hover:bg-muted/50"
                                                    onClick={() => {
                                                        setSelectedCard(card)
                                                        setIsUsersModalOpen(true)
                                                    }}
                                                >
                                                    View Users
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>

                    {/* Pagination Footer */}
                    {meta && meta.totalPages > 1 && (
                        <div className="flex flex-col items-center justify-between gap-4 p-6 border-t border-muted/10 bg-muted/5 sm:flex-row">
                            <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                                Page <span className="text-primary">{meta.currentPage}</span> of {meta.totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCurrentPage(p => Math.max(1, p - 1))
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }}
                                    disabled={!meta.hasPreviousPage || isFetching}
                                    className="px-4 font-bold rounded-xl h-9 border-muted-foreground/20"
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - meta.currentPage) <= 1)
                                        .map((p, i, arr) => (
                                            <React.Fragment key={p}>
                                                {i > 0 && arr[i - 1] !== p - 1 && <span className="mx-1 text-xs text-muted-foreground">...</span>}
                                                <Button
                                                    variant={p === meta.currentPage ? 'default' : 'ghost'}
                                                    size="sm"
                                                    onClick={() => {
                                                        setCurrentPage(p)
                                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                                    }}
                                                    disabled={isFetching}
                                                    className={cn(
                                                        "h-9 w-9 p-0 rounded-xl font-black text-xs",
                                                        p === meta.currentPage ? "shadow-lg shadow-primary/20" : "text-muted-foreground"
                                                    )}
                                                >
                                                    {p}
                                                </Button>
                                            </React.Fragment>
                                        ))
                                    }
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCurrentPage(p => Math.min(meta.totalPages, p + 1))
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }}
                                    disabled={!meta.hasNextPage || isFetching}
                                    className="px-4 font-bold rounded-xl h-9 border-muted-foreground/20"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Footer note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="p-6 text-center border border-dashed bg-muted/10 rounded-3xl border-muted-foreground/15"
            >
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    Need help with your activation cards? Contact support or check the FAQ.
                </div>
            </motion.div>

            {/* Payment Details Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
                setIsPaymentModalOpen(open);
                if (!open) {
                    setIsVerifying(false);
                    setIsTimeout(false);
                }
            }}>
                <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-y-auto">
                    <div className="relative p-8 text-white bg-emerald-600">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <NairaIcon size={80} />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                                <CheckCircle2 className="text-emerald-200" />
                                Payment details
                            </DialogTitle>
                            <DialogDescription className="font-medium text-emerald-50/70">
                                Transfer the exact amount to the account below.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 pb-12 space-y-6">
                        <div className="pb-2 space-y-2 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Amount to Transfer</p>
                            <h3 className="text-4xl font-black tracking-tighter text-zinc-900">{currency}{paymentDetails?.amount.toLocaleString()}</h3>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Badge variant="outline" className="px-3 py-1 font-bold bg-amber-50 text-amber-700 border-amber-200">
                                    <Clock size={12} className="mr-1.5" />
                                    Expires at {paymentDetails?.expiry_date}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div 
                                className="relative p-6 transition-all border-2 border-transparent cursor-pointer group rounded-3xl bg-zinc-50 hover:border-emerald-500/20"
                                onClick={() => {
                                    if(paymentDetails?.account_number) {
                                        navigator.clipboard.writeText(paymentDetails.account_number);
                                        toast.success('Account number copied');
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Account Number</p>
                                    <div className="flex items-center justify-center w-8 h-8 transition-colors bg-white shadow-sm rounded-xl text-muted-foreground group-hover:text-emerald-600">
                                        <Copy size={14} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black tracking-tight text-zinc-900">{paymentDetails?.account_number}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">{paymentDetails?.bank_name}</div>
                                    <div className="text-[11px] font-bold text-zinc-500">{paymentDetails?.account_name}</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            {isVerifying ? (
                                <div className="space-y-4">
                                    <Button 
                                        disabled
                                        className="w-full text-lg font-black border-2 border-dashed h-14 rounded-2xl bg-zinc-100 text-zinc-400 border-zinc-200"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                        Verifying Payment...
                                    </Button>
                                    <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                                        Please wait while we confirm your transaction
                                    </p>
                                </div>
                            ) : isTimeout ? (
                                <div className="space-y-4">
                                    <div className="p-4 space-y-2 border rounded-2xl bg-amber-50 border-amber-100">
                                        <p className="flex items-center gap-2 text-xs font-bold text-amber-800">
                                            <AlertCircle size={14} />
                                            Payment is being processed
                                        </p>
                                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                            If you don&apos;t get your PIM card in a few minutes, please contact the administrator.
                                        </p>
                                    </div>
                                    <Button 
                                        className="w-full text-lg font-black text-white transition-all shadow-xl h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 shadow-zinc-200 active:scale-95"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                    >
                                        Close Window
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    className="w-full text-lg font-black text-white transition-all shadow-xl h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 shadow-zinc-200 active:scale-95"
                                    onClick={handleVerifyPayment}
                                >
                                    I Have Made the Payment
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Users Modal */}
            <Dialog open={isUsersModalOpen} onOpenChange={setIsUsersModalOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-3xl border-none shadow-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Users on Card {selectedCard?.code}</DialogTitle>
                        <DialogDescription>
                            List of users who used this card for activation and the amount deducted for each.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 rounded-2xl bg-muted/40">
                                <p className="mb-1 text-xs font-black tracking-widest uppercase text-muted-foreground">Total Amount</p>
                                <p className="text-lg font-bold">{fmt(selectedCard?.amount)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/40">
                                <p className="mb-1 text-xs font-black tracking-widest uppercase text-muted-foreground">Amount Left</p>
                                <p className="text-lg font-bold text-emerald-600">{fmt(selectedCard?.amountLeft)}</p>
                            </div>
                        </div>

                        {selectedCard?.usersWithCard && selectedCard.usersWithCard.length > 0 ? (
                            <div className="space-y-3">
                                {selectedCard.usersWithCard.map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-4 border rounded-2xl border-muted/20 bg-muted/5">
                                        <div>
                                            <p className="font-bold">{u.name}</p>
                                            <p className="text-xs text-muted-foreground">@{u.username || 'unknown'}</p>
                                            {u.isInfant && !u.sponsorId && (
                                                <Badge variant="outline" className="mt-2 text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                                                    Independent Infant (Form Fee Added)
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="mb-1 text-xs font-black tracking-widest uppercase text-muted-foreground">Amount Used</p>
                                            <p className="font-black text-primary">{fmt(u.amountUsed)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-muted-foreground">
                                <p className="text-sm font-medium">No users have activated with this card yet.</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="w-full rounded-xl" onClick={() => setIsUsersModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ActivationCards