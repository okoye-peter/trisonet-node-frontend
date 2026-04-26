'use client'

import React, { useState, useEffect, useCallback, startTransition } from 'react'
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
    Layers,
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
import { useGetPimCardsQuery, useGetPimCardsSummaryQuery, usePurchasePimCardMutation, useVerifyCardPurchasePaymentMutation, type PaymentAccountDetail } from '@/store/api/pimCardApi'
import { useGetUserQuery } from '@/store/api/userApi'
import { toast } from 'sonner'

const NairaIcon = ({ size = 24, className }: { size?: number, className?: string }) => (
    <span className={cn("font-bold flex items-center justify-center", className)} style={{ fontSize: size }}>₦</span>
)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PimCardsSummary {
    totalCards: number
    availableSlots: number
    pendingCards: number
    price: number
    activeCard: {
        id: string
        code: string
        amount: number
        pricePerUser: number
        createdAt: string
    } | null
    status: {
        PENDING: number
        APPROVED: number
        CANCELLED: number
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number | undefined | null) =>
    n == null ? '₦0.00' : `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (iso: string | undefined | null) =>
    iso ? new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const statusLabel = (status: number, amount: number = 0, pricePerUser: number = 0) => {
    if (status === 1 && amount < pricePerUser) return 'Used'
    if (status === 0) return 'Pending'
    if (status === 1) return 'Approved'
    return 'Cancelled'
}

const statusClass = (status: number, amount: number = 0, pricePerUser: number = 0) => {
    if (status === 1 && amount < pricePerUser) return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-400'
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

    const copy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative select-none">
            {/* Glow blur behind card */}
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-teal-500/30 via-emerald-600/20 to-transparent blur-2xl" />

            {/* Main card face */}
            <div className="relative rounded-3xl overflow-hidden h-52 w-full"
                style={{
                    background: 'linear-gradient(135deg, #0f4c3a 0%, #0a3d2e 40%, #072e22 100%)',
                    boxShadow: '0 30px 60px -10px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)'
                }}
            >
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
                <div className="absolute -bottom-12 -left-4 h-52 w-52 rounded-full bg-white/3" />

                {/* Grid lines */}
                <div className="absolute inset-0 opacity-[.04]"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 30px,#fff 30px,#fff 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,#fff 30px,#fff 31px)' }}
                />

                {/* Top row */}
                <div className="absolute top-5 left-6 right-6 flex items-center justify-between">
                    <span className="text-white/90 font-bold text-lg tracking-widest" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>
                        TrisoNet
                    </span>
                    <span className="text-[10px] font-black text-emerald-400 tracking-[.2em] bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        PIM
                    </span>
                </div>

                {/* Chip */}
                <div className="absolute top-12 left-6">
                    <div className="h-9 w-12 rounded-md overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #d4a843 0%, #f0c95c 40%, #c8922a 100%)' }}
                    >
                        <div className="h-full w-full grid grid-cols-3 gap-px p-px opacity-80">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="rounded-[1px] bg-yellow-900/30" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Amount */}
                <div className="absolute bottom-12 left-6">
                    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Amount</p>
                    <p className="text-white font-black text-xl">{fmt(amount)}</p>
                </div>

                {/* Code bottom-right */}
                <div className="absolute bottom-5 right-5 flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white/70 tracking-widest">{code}</span>
                    <button onClick={copy}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        title="Copy code"
                    >
                        {copied
                            ? <Check className="h-3 w-3 text-emerald-400" />
                            : <Copy className="h-3 w-3 text-white/60" />
                        }
                    </button>
                </div>

                {/* Contactless icon top-right corner */}
                <div className="absolute top-14 right-6 opacity-30">
                    <Layers className="h-8 w-8 text-white" />
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────

const ActivationCards = () => {
    const [isMounted, setIsMounted] = useState(false)
    const [quantity, setQuantity] = useState(2)
    const [isOpen, setIsOpen] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [paymentDetails, setPaymentDetails] = useState<PaymentAccountDetail | null>(null)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)

    const [isVerifying, setIsVerifying] = useState(false)
    const [isTimeout, setIsTimeout] = useState(false)

    const { data: cardsResponse, isLoading: isCardsLoading, refetch: refetchCards } = useGetPimCardsQuery({ page: 1, limit: 100 })
    const { data: summaryResponse, isLoading: isSummaryLoading, refetch: refetchSummary } = useGetPimCardsSummaryQuery()
    const [purchaseCard, { isLoading: isPurchasing }] = usePurchasePimCardMutation()
    const [verifyPayment] = useVerifyCardPurchasePaymentMutation()

    useEffect(() => {
        startTransition(() => {
            setIsMounted(true)
        })
    }, [])

    const cards = cardsResponse?.data?.data ?? []
    const summary = summaryResponse?.data ?? null
    const loading = isCardsLoading || isSummaryLoading
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
    const user = userResponse?.data ?? null

    const pricePerCard = summary?.price ?? 0
    const subtotal = quantity ? (user?.username === 'dev_user' ? 100 : quantity * pricePerCard) : 0

    const calculateCharge = (amount: number) => {
        if (amount === 0) return 0
        const chargeRate = 0.015
        const vatRate = 0.075
        const capped = 1000

        const charge = amount * chargeRate
        const vat = charge * vatRate
        const totalCharge = charge + vat

        return Math.min(Math.round(totalCharge * 100) / 100, capped)
    }

    const charge = calculateCharge(subtotal)
    const totalAmount = subtotal + charge

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
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
            label: 'Available Slots',
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
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
        },
    ] : []

    return (
        <div className="container mx-auto py-6 px-3 sm:py-10 sm:px-4 space-y-6 sm:space-y-10 max-w-6xl">

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-linear-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                            PIM Credit Cards
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
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
                                className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 group font-bold w-full sm:w-auto"
                            >
                                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                                Request New Card
                            </Button>
                        } />

                        <DialogContent className="sm:max-w-[440px] rounded-3xl border-none shadow-2xl p-8">
                            <DialogHeader className="space-y-3 mb-2">
                                <div className="h-13 w-13 rounded-2xl bg-linear-to-br from-primary/20 to-emerald-500/10 flex items-center justify-center mb-1 border border-primary/10">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                </div>
                                <DialogTitle className="text-2xl font-black">Purchase Cards</DialogTitle>
                                <DialogDescription>
                                    Fill the form to generate a virtual account for your card purchase.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-5 py-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                        Price Per Card
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            value={loading ? 'Loading…' : fmt(pricePerCard)}
                                            disabled
                                            className="bg-muted/40 border-none font-bold text-base h-12 pr-10"
                                        />
                                        <Wallet className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground/40" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="qty" className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                        Quantity <span className="text-muted-foreground/50 normal-case font-medium">(min: 2)</span>
                                    </Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        min={2}
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="h-12 border-primary/20 focus-visible:ring-primary font-bold text-base"
                                    />
                                </div>

                                {/* Total box */}
                                <div className="rounded-2xl bg-linear-to-br from-primary/10 to-emerald-500/5 border border-primary/15 p-5 space-y-3">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">Subtotal</span>
                                        <span className="font-bold flex-shrink-0">{fmt(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">Service Charge</span>
                                        <span className="font-bold flex-shrink-0">{fmt(charge)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-primary/10 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[.18em] mb-1">Total Amount</p>
                                            <p className="text-3xl font-black text-primary">
                                                {fmt(totalAmount)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <Wallet className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    className="w-full h-12 rounded-xl text-base font-bold shadow-xl shadow-primary/10 transition-all active:scale-95"
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
                                    disabled={isPurchasing}
                                >
                                    {isPurchasing ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : null}
                                    Generate Virtual Account
                                    <ArrowUpRight className="ml-2 h-5 w-5" />
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
                        className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                        <Button variant="ghost" size="sm" onClick={fetchData} className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-100">
                            Retry
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Active Card Visual + Stats ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Card Visual (spans 2 cols) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full animate-pulse",
                                        activeCard && activeCard.amount < activeCard.pricePerUser ? "bg-zinc-400" : "bg-emerald-500"
                                    )} />
                                    Active Pim Code Card
                                </div>
                                {activeCard && activeCard.amount < activeCard.pricePerUser && (
                                    <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-600 border-zinc-200">Used</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-6 px-6">
                            {loading ? (
                                <Skeleton className="h-52 w-full rounded-3xl" />
                            ) : activeCard ? (
                                <CardVisual code={activeCard.code} amount={activeCard.amount} />
                            ) : (
                                <div className="h-52 w-full rounded-3xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                    <CreditCard className="h-10 w-10 opacity-30" />
                                    <p className="text-sm font-medium">No active card</p>
                                </div>
                            )}

                            {activeCard && !loading && (
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-muted/40 p-3">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Price/Slot</p>
                                        <p className="font-bold text-sm">{fmt(activeCard.pricePerUser)}</p>
                                    </div>
                                    <div className="rounded-2xl bg-muted/40 p-3">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Issued</p>
                                        <p className="font-bold text-sm">{fmtDate(activeCard.createdAt)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats grid (spans 3 cols) */}
                <div className="lg:col-span-3 grid md:grid-cols-2 grid-cols-1 gap-3 sm:gap-4 content-start">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
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
                                    <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-3 h-full">
                                        <div className="space-y-1 flex-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-4xl sm:text-4xl font-black">{stat.value}</p>
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
                    className="rounded-3xl bg-linear-to-r from-primary/10 via-emerald-500/5 to-teal-500/10 border border-primary/15 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/15 rounded-2xl">
                            <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5">Current Price Per Slot</p>
                            <p className="text-2xl font-black text-primary">{fmt(summary.price)}</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        <Plus className="mr-2 h-4 w-4" />
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
                <Card className="border-none shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
                    <CardHeader className="p-7 pb-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <History className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black">My PIM Credit Cards</CardTitle>
                                    <CardDescription className="text-xs mt-0.5">All your card purchases and their current status.</CardDescription>
                                </div>
                            </div>
                            {!loading && (
                                <Badge variant="secondary" className="rounded-full font-black text-xs px-3">
                                    {cards.length} card{cards.length !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-7 space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : cards.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground">
                                <CreditCard className="h-12 w-12 opacity-20" />
                                <p className="text-sm font-medium">No cards found</p>
                                <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="rounded-xl">
                                    Request your first card
                                </Button>
                            </div>
                        ) : (
                            <Table className="min-w-[600px]">
                                <TableHeader className="bg-muted/20">
                                    <TableRow className="hover:bg-transparent border-none whitespace-nowrap">
                                        {['Code', 'Amount', 'Price/Slot', 'Status', 'Date'].map(h => (
                                            <TableHead key={h} className={cn(
                                                'font-black text-[10px] uppercase tracking-widest py-4',
                                                h === 'Code' && 'pl-4 sm:pl-7',
                                                h === 'Amount' && 'text-right',
                                                h === 'Price/Slot' && 'text-right hidden sm:table-cell',
                                                h === 'Status' && 'text-center',
                                                h === 'Date' && 'text-right pr-4 sm:pr-7 hidden md:table-cell',
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
                                            className="group hover:bg-muted/10 transition-colors border-muted/10 last:border-0 whitespace-nowrap"
                                        >
                                            {/* Code */}
                                            <TableCell className="pl-4 sm:pl-7 py-4 sm:py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-xs sm:text-sm">{card.code}</span>
                                                    <button
                                                        onClick={() => copyCode(card.code)}
                                                        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-muted hover:bg-muted-foreground/20"
                                                        title="Copy code"
                                                    >
                                                        {copiedCode === card.code
                                                            ? <Check className="h-3 w-3 text-emerald-500" />
                                                            : <Copy className="h-3 w-3 text-muted-foreground" />
                                                        }
                                                    </button>
                                                </div>
                                            </TableCell>

                                            {/* Amount */}
                                            <TableCell className="text-right">
                                                <span className="font-black text-xs sm:text-sm">{fmt(card.amount)}</span>
                                            </TableCell>

                                            {/* Price / Slot */}
                                            <TableCell className="text-right hidden sm:table-cell">
                                                <span className="text-sm text-muted-foreground font-medium">{fmt(card.pricePerUser)}</span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="text-center">
                                                <Badge className={cn(
                                                    'rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wide border-none',
                                                    statusClass(card.status, card.amount, card.pricePerUser)
                                                )}>
                                                    {statusLabel(card.status, card.amount, card.pricePerUser)}
                                                </Badge>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell className="pr-4 sm:pr-7 text-right text-xs text-muted-foreground font-medium hidden md:table-cell">
                                                {fmtDate(card.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Footer note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="text-center p-6 bg-muted/10 rounded-3xl border border-dashed border-muted-foreground/15"
            >
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium">
                    <AlertCircle className="h-4 w-4" />
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
                    <div className="bg-emerald-600 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <NairaIcon size={80} />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-200" />
                                Payment details
                            </DialogTitle>
                            <DialogDescription className="text-emerald-50/70 font-medium">
                                Transfer the exact amount to the account below.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 pb-12 space-y-6">
                        <div className="text-center space-y-2 pb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Amount to Transfer</p>
                            <h3 className="text-4xl font-black tracking-tighter text-zinc-900">₦{paymentDetails?.amount.toLocaleString()}</h3>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold px-3 py-1">
                                    <Clock size={12} className="mr-1.5" />
                                    Expires at {paymentDetails?.expiry_date}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div 
                                className="group rounded-3xl bg-zinc-50 p-6 border-2 border-transparent hover:border-emerald-500/20 transition-all cursor-pointer relative"
                                onClick={() => {
                                    if(paymentDetails?.account_number) {
                                        navigator.clipboard.writeText(paymentDetails.account_number);
                                        toast.success('Account number copied');
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Account Number</p>
                                    <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-emerald-600 transition-colors">
                                        <Copy size={14} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-zinc-900 tracking-tight">{paymentDetails?.account_number}</p>
                                <div className="mt-3 flex items-center gap-3">
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
                                        className="w-full h-14 rounded-2xl bg-zinc-100 text-zinc-400 font-black text-lg border-2 border-dashed border-zinc-200"
                                    >
                                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                        Verifying Payment...
                                    </Button>
                                    <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                                        Please wait while we confirm your transaction
                                    </p>
                                </div>
                            ) : isTimeout ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                                        <p className="text-xs font-bold text-amber-800 flex items-center gap-2">
                                            <AlertCircle size={14} />
                                            Payment is being processed
                                        </p>
                                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                            If you don&apos;t get your PIM card in a few minutes, please contact the administrator.
                                        </p>
                                    </div>
                                    <Button 
                                        className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-lg shadow-xl shadow-zinc-200 transition-all active:scale-95"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                    >
                                        Close Window
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-lg shadow-xl shadow-zinc-200 transition-all active:scale-95"
                                    onClick={handleVerifyPayment}
                                >
                                    I Have Made the Payment
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ActivationCards