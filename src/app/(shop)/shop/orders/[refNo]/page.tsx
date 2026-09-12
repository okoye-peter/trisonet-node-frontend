'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCancelShopOrderMutation, useCreateShopReturnMutation, useGetShopOrderQuery } from '@/store/api/shopApi';
import { useGetBanksQuery, useResolveAccountMutation } from '@/store/api/bankApi';
import { useAppSelector } from '@/store/hooks';
import { useMounted } from '@/hooks/useMounted';
import { formatNaira } from '@/lib/shopUtils';
import type { ShopOrderPaymentStatus, ShopOrderShippingStatus } from '@/types';

const STATUS_LABEL: Record<ShopOrderPaymentStatus, string> = {
    pending: 'Payment Pending',
    paid: 'Paid',
    failed: 'Payment Failed',
};

const STATUS_VARIANT: Record<ShopOrderPaymentStatus, 'secondary' | 'default' | 'destructive'> = {
    pending: 'secondary',
    paid: 'default',
    failed: 'destructive',
};

const SHIPPING_STATUS_LABEL: Record<NonNullable<ShopOrderShippingStatus>, string> = {
    pending: 'Yet to be Shipped',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const SHIPPING_STATUS_VARIANT: Record<NonNullable<ShopOrderShippingStatus>, 'secondary' | 'default' | 'destructive'> = {
    pending: 'secondary',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
};

interface BankDetailsValue {
    bankUUID: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
}

const EMPTY_BANK_DETAILS: BankDetailsValue = { bankUUID: '', bankName: '', accountNumber: '', accountName: '' };

function BankAccountFields({ value, onChange }: { value: BankDetailsValue; onChange: (value: BankDetailsValue) => void }) {
    const { data: banksResponse, isLoading: isBanksLoading } = useGetBanksQuery();
    const banks = banksResponse?.data || [];
    const [resolveAccount, { isLoading: isResolving }] = useResolveAccountMutation();

    const handleResolveAccount = async (accountNumber: string, bankUUID: string, bankName: string) => {
        if (accountNumber.length !== 10 || !bankUUID) return;
        try {
            const res = await resolveAccount({ bankUUID, accountNumber }).unwrap();
            onChange({ bankUUID, bankName, accountNumber, accountName: res.data?.accountName || '' });
        } catch {
            onChange({ bankUUID, bankName, accountNumber, accountName: '' });
            toast.error("Couldn't verify this account. Double-check the account number and bank.");
        }
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Bank</Label>
                <SearchableSelect
                    items={banks.map((bank) => ({ label: bank.name, value: bank.uuid }))}
                    value={value.bankUUID}
                    onValueChange={(val) => {
                        const bank = banks.find((b) => b.uuid === val);
                        const bankName = bank?.name ?? '';
                        onChange({ ...value, bankUUID: val ?? '', bankName, accountName: '' });
                        if (val && value.accountNumber.length === 10) {
                            handleResolveAccount(value.accountNumber, val, bankName);
                        }
                    }}
                    placeholder="Select your bank"
                    isLoading={isBanksLoading}
                />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Account Number</Label>
                <div className="relative">
                    <Input
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="0000000000"
                        value={value.accountNumber}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            onChange({ ...value, accountNumber: val, accountName: '' });
                            if (val.length === 10 && value.bankUUID) {
                                handleResolveAccount(val, value.bankUUID, value.bankName);
                            }
                        }}
                    />
                    {isResolving && (
                        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                </div>
            </div>
            {value.accountName && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="size-4 shrink-0" />
                    {value.accountName}
                </div>
            )}
        </div>
    );
}

export default function OrderDetailPage({ params }: { params: Promise<{ refNo: string }> }) {
    const { refNo } = use(params);
    const router = useRouter();
    const mounted = useMounted();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    // This page's cancel/return actions refund to the buyer's own wallet/bank
    // account, which only makes sense for a logged-in account — guests placing an
    // order without one are tracked via /shop/order-success instead.
    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.replace(`/login?next=/shop/orders/${refNo}`);
        }
    }, [mounted, isAuthenticated, router, refNo]);

    const { data: orderResponse, isLoading } = useGetShopOrderQuery({ refNo }, { skip: !mounted || !isAuthenticated });
    const order = orderResponse?.data;

    const [cancelOrder, { isLoading: isCancelling }] = useCancelShopOrderMutation();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelBankDetails, setCancelBankDetails] = useState(EMPTY_BANK_DETAILS);

    const [createReturn, { isLoading: isSubmittingReturn }] = useCreateShopReturnMutation();
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [returnBankDetails, setReturnBankDetails] = useState(EMPTY_BANK_DETAILS);
    const [returnReason, setReturnReason] = useState('');
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

    const resetCancelDialog = () => setCancelBankDetails(EMPTY_BANK_DETAILS);
    const resetReturnDialog = () => {
        setReturnBankDetails(EMPTY_BANK_DETAILS);
        setReturnReason('');
        setSelectedItemIds([]);
    };

    const handleCancel = async () => {
        if (!cancelBankDetails.bankUUID || !cancelBankDetails.accountNumber || !cancelBankDetails.accountName) {
            toast.error('Select your bank and enter a valid account number to receive your refund.');
            return;
        }

        try {
            await cancelOrder({
                refNo,
                bankName: cancelBankDetails.bankName,
                bankUUID: cancelBankDetails.bankUUID,
                accountNumber: cancelBankDetails.accountNumber,
            }).unwrap();
            toast.success('Order cancelled — your refund is on its way to your bank account');
            setCancelDialogOpen(false);
            resetCancelDialog();
        } catch (err: unknown) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to cancel order. Please try again.');
        }
    };

    const handleSubmitReturn = async () => {
        if (selectedItemIds.length === 0) {
            toast.error('Select at least one item to return.');
            return;
        }
        if (!returnReason.trim()) {
            toast.error('Tell us why you want to return this item.');
            return;
        }
        if (!returnBankDetails.bankUUID || !returnBankDetails.accountNumber || !returnBankDetails.accountName) {
            toast.error('Select your bank and enter a valid account number to receive your refund.');
            return;
        }

        try {
            await createReturn({
                refNo,
                reason: returnReason.trim(),
                orderItemIds: selectedItemIds,
                bankName: returnBankDetails.bankName,
                bankUUID: returnBankDetails.bankUUID,
                accountNumber: returnBankDetails.accountNumber,
            }).unwrap();
            toast.success('Return request submitted — an admin will review it shortly');
            setReturnDialogOpen(false);
            resetReturnDialog();
        } catch (err: unknown) {
            const apiErr = err as { data?: { message?: string } };
            toast.error(apiErr.data?.message || 'Failed to submit return request. Please try again.');
        }
    };

    if (!mounted || !isAuthenticated || isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center py-24">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">
                Order not found.
            </div>
        );
    }

    const returnableItems = order.items.filter((item) => item.canReturn);

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <Link href="/shop/orders" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
                &larr; Back to Orders
            </Link>

            <div className="mb-6 flex items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Order #{order.refNo}</h1>
                <div className="flex items-center gap-2">
                    {order.shippingStatus && (
                        <Badge variant={SHIPPING_STATUS_VARIANT[order.shippingStatus]}>
                            {SHIPPING_STATUS_LABEL[order.shippingStatus]}
                        </Badge>
                    )}
                    <Badge variant={STATUS_VARIANT[order.paymentStatus]}>{STATUS_LABEL[order.paymentStatus]}</Badge>
                </div>
            </div>

            <p className="mb-6 text-sm text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleString()}
            </p>

            {order.paymentStatus === 'pending' && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    This order is still awaiting payment.{' '}
                    <Link href={`/shop/order-success?ref=${order.refNo}`} className="font-semibold underline">
                        Complete your payment
                    </Link>
                </div>
            )}

            {order.paymentStatus === 'failed' && (
                <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    We couldn&apos;t confirm payment for this order. If you already sent the money, reach out to customer care
                    (info@trisonet.com or trisonetasset@gmail.com, or our complaints WhatsApp group) with proof of payment for help.
                </div>
            )}

            <div className="mb-6 rounded-xl border border-border p-4">
                <h2 className="mb-3 font-semibold">Items</h2>
                <div className="space-y-2 text-sm">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                                {item.product?.name ?? 'Product'} &times; {item.quantity}
                                {item.returnStatus === 'returned' && (
                                    <span className="ml-2 text-xs font-medium text-emerald-600">(returned)</span>
                                )}
                                {item.returnStatus === 'requested' && (
                                    <span className="ml-2 text-xs text-amber-600">(return requested)</span>
                                )}
                            </span>
                            <span>{formatNaira(item.price * item.quantity)}</span>
                        </div>
                    ))}
                    {order.total !== undefined && (
                        <div className="flex justify-between border-t border-border pt-2 font-bold">
                            <span>Total</span>
                            <span>{formatNaira(order.total)}</span>
                        </div>
                    )}
                </div>
            </div>

            {order.shipping && (
                <div className="mb-6 rounded-xl border border-border p-4">
                    <h2 className="mb-3 font-semibold">Shipping Details</h2>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{order.shipping.fullName}</p>
                        <p>{order.shipping.phone}</p>
                        <p>{order.shipping.address}, {order.shipping.city}, {order.shipping.state}</p>
                    </div>
                </div>
            )}

            {order.canCancel && (
                <AlertDialog
                    open={cancelDialogOpen}
                    onOpenChange={(open) => {
                        setCancelDialogOpen(open);
                        if (!open) resetCancelDialog();
                    }}
                >
                    <AlertDialogTrigger render={<Button size="lg" variant="destructive" className="mb-3 w-full" />}>
                        Cancel Order
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This order hasn&apos;t shipped yet, so it can still be cancelled. Tell us where to send your{' '}
                                {order.total !== undefined ? formatNaira(order.total) : ''} refund — it&apos;s sent to your
                                account immediately. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        {cancelDialogOpen && <BankAccountFields value={cancelBankDetails} onChange={setCancelBankDetails} />}

                        <AlertDialogFooter>
                            <AlertDialogCancel>Keep Order</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                disabled={isCancelling || !cancelBankDetails.accountName}
                                onClick={handleCancel}
                            >
                                {isCancelling ? 'Cancelling...' : 'Yes, Cancel & Refund'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {order.canReturn && (
                <AlertDialog
                    open={returnDialogOpen}
                    onOpenChange={(open) => {
                        setReturnDialogOpen(open);
                        if (!open) resetReturnDialog();
                    }}
                >
                    <AlertDialogTrigger render={<Button size="lg" variant="outline" className="w-full" />}>
                        Request Return
                    </AlertDialogTrigger>
                    {order.daysLeftToReturn !== null && (
                        <p className="mb-3 mt-1.5 text-center text-xs text-muted-foreground">
                            {order.daysLeftToReturn === 1
                                ? 'Last day to request a return'
                                : `${order.daysLeftToReturn} days left to request a return`}
                        </p>
                    )}
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Request a return</AlertDialogTitle>
                            <AlertDialogDescription>
                                Select the item(s) you want to return, tell us why, and where to send your refund once an
                                admin approves the request.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-3">
                            <div className="space-y-2">
                                {returnableItems.map((item) => (
                                    <label key={item.id} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={selectedItemIds.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedItemIds((prev) =>
                                                    checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                                                );
                                            }}
                                        />
                                        <span>
                                            {item.product?.name ?? 'Product'} &times; {item.quantity} —{' '}
                                            {formatNaira(item.price * item.quantity)}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Reason for return</Label>
                                <Textarea
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    placeholder="e.g. Item arrived damaged"
                                    rows={3}
                                />
                            </div>

                            {returnDialogOpen && <BankAccountFields value={returnBankDetails} onChange={setReturnBankDetails} />}
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={isSubmittingReturn || !returnBankDetails.accountName || selectedItemIds.length === 0}
                                onClick={handleSubmitReturn}
                            >
                                {isSubmittingReturn ? 'Submitting...' : 'Submit Return Request'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {order.returnWindowExpired && !order.canReturn && (
                <p className="mb-3 text-center text-xs text-muted-foreground">
                    The return window for this order has closed — returns can no longer be requested.
                </p>
            )}

            <Button size="lg" className="w-full" render={<Link href="/shop" />}>
                Continue Shopping
            </Button>
        </div>
    );
}
