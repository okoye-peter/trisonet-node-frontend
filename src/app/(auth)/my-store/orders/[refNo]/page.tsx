'use client';

import { use } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Phone, Truck, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNaira } from '@/lib/shopUtils';
import { useGetMySellerOrderQuery } from '@/store/api/sellerApi';
import { SellerOrderAction, SellerOrderDeadline, SellerOrderStatusBadge } from '@/components/seller/SellerOrderStatus';
import type { SellerOrderStatus } from '@/types';

const STATUS_NOTE: Record<SellerOrderStatus, string> = {
    pending: 'The buyer has paid. Pack the items and send them, then mark the order as shipped.',
    shipped: 'On its way to the buyer. Trisonet will call your courier to confirm delivery and then mark it delivered.',
    delivered: 'Delivered. The buyer can request a return within 7 days once their whole order has arrived.',
    cancelled: 'This order was cancelled and the buyer refunded. Do not ship it.',
};

export default function SellerOrderDetailPage({ params }: { params: Promise<{ refNo: string }> }) {
    const { refNo } = use(params);
    const { data, isLoading, isError } = useGetMySellerOrderQuery(decodeURIComponent(refNo));
    const order = data?.data;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/my-store/orders" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
                <ArrowLeft className="h-4 w-4" /> Orders
            </Link>

            {isLoading ? (
                <Skeleton className="h-96 w-full rounded-[2rem]" />
            ) : isError || !order ? (
                <p className="text-sm text-zinc-500">Order not found.</p>
            ) : (
                <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-black text-zinc-900 break-all">#{order.refNo}</h1>
                                <SellerOrderStatusBadge status={order.status} />
                                <SellerOrderDeadline order={order} />
                            </div>
                            <p className="text-sm text-zinc-500 mt-1">
                                Placed {format(new Date(order.createdAt), 'd MMM yyyy, h:mma')}
                                {order.shippedAt && ` · Shipped ${format(new Date(order.shippedAt), 'd MMM yyyy')}`}
                                {order.deliveredAt && ` · Delivered ${format(new Date(order.deliveredAt), 'd MMM yyyy')}`}
                            </p>
                        </div>
                        <SellerOrderAction order={order} />
                    </div>

                    {order.isOverdue ? (
                        <div className="p-4 rounded-2xl border border-red-100 bg-red-50 text-sm text-red-800">
                            This order is past its 14-day delivery deadline and has been flagged to Trisonet. Deliver it as soon as possible, or contact support.
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-700">{STATUS_NOTE[order.status]}</div>
                    )}

                    <Card className="rounded-[2rem] border-zinc-100">
                        <CardContent className="p-6 space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Deliver to</h2>
                            <p className="flex items-center gap-2 text-sm font-bold text-zinc-900"><User className="h-4 w-4 text-zinc-400" /> {order.buyer.name}</p>
                            {order.buyer.phone && (
                                <a href={`tel:${order.buyer.phone}`} className="flex items-center gap-2 text-sm text-zinc-700 hover:underline">
                                    <Phone className="h-4 w-4 text-zinc-400" /> {order.buyer.phone}
                                </a>
                            )}
                            <p className="flex items-start gap-2 text-sm text-zinc-700"><MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" /> {order.deliveryAddress ?? 'No address given'}</p>
                        </CardContent>
                    </Card>

                    {order.courier && (
                        <Card className="rounded-[2rem] border-zinc-100">
                            <CardContent className="p-6 space-y-3">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Courier</h2>
                                <p className="flex items-center gap-2 text-sm font-bold text-zinc-900"><Truck className="h-4 w-4 text-zinc-400" /> {order.courier.name}</p>
                                {order.courier.phone && (
                                    <a href={`tel:${order.courier.phone}`} className="flex items-center gap-2 text-sm text-zinc-700 hover:underline">
                                        <Phone className="h-4 w-4 text-zinc-400" /> {order.courier.phone}
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="rounded-[2rem] border-zinc-100">
                        <CardContent className="p-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Items ({order.itemCount})</h2>
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover bg-zinc-100 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-zinc-900 truncate">{item.name}</p>
                                        <p className="text-sm text-zinc-500">{formatNaira(item.price)} × {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-zinc-900">{formatNaira(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-zinc-100">
                        <CardContent className="p-6 space-y-2 text-sm">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Your earnings</h2>
                            <div className="flex justify-between"><span className="text-zinc-500">Order total</span><span className="font-medium">{formatNaira(order.total)}</span></div>
                            {order.payout && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Trisonet commission ({order.payout.commissionRate}%)</span>
                                        <span className="font-medium">− {formatNaira(order.payout.commission)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-zinc-100 pt-2 text-base">
                                        <span className="font-bold text-zinc-900">You receive</span>
                                        <span className="font-black text-zinc-900">{formatNaira(order.payout.net)}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 capitalize">Payout status: {order.payout.status}</p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
