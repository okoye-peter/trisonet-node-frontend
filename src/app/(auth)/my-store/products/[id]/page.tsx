'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SellerProductForm } from '@/components/seller/SellerProductForm';
import { useGetMySellerProductQuery, useUpdateSellerProductMutation } from '@/store/api/sellerApi';
import type { SellerProductInput } from '@/types';

const STATUS_NOTE = {
    approved: { className: 'bg-emerald-50 text-emerald-800 border-emerald-100', text: 'This product is live in the shop.' },
    pending: { className: 'bg-amber-50 text-amber-800 border-amber-100', text: 'This product is being reviewed and is hidden from the shop until approved.' },
    rejected: { className: 'bg-red-50 text-red-800 border-red-100', text: 'This product was not approved. Update it and save to resubmit.' },
} as const;

export default function EditSellerProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data, isLoading, isError } = useGetMySellerProductQuery(id);
    const [updateProduct, { isLoading: isSaving }] = useUpdateSellerProductMutation();
    const product = data?.data;

    const handleSubmit = async (body: SellerProductInput) => {
        try {
            const res = await updateProduct({ id, body }).unwrap();
            if (res.data?.sentForReview) {
                toast.success('Changes submitted for review', { description: 'The product is hidden from the shop until approved.' });
            } else {
                toast.success('Product updated');
            }
        } catch (error) {
            toast.error('Could not save changes', { description: (error as { data?: { message?: string } })?.data?.message || 'Please try again' });
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/my-store/products" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
                <ArrowLeft className="h-4 w-4" /> Products
            </Link>
            <h1 className="text-2xl font-black text-zinc-900">Edit product</h1>

            {isLoading ? (
                <Skeleton className="h-96 w-full rounded-[2rem]" />
            ) : isError || !product ? (
                <p className="text-sm text-zinc-500">Product not found.</p>
            ) : (
                <>
                    <div className={`p-4 rounded-2xl border text-sm ${STATUS_NOTE[product.status].className}`}>
                        <p>{STATUS_NOTE[product.status].text}</p>
                        {product.status === 'rejected' && product.reviewComment && (
                            <p className="mt-1"><span className="font-bold">Reviewer comment:</span> {product.reviewComment}</p>
                        )}
                    </div>
                    <Card className="rounded-[2rem] border-zinc-100">
                        <CardContent className="p-6 md:p-10">
                            {/* Keyed on the server copy so a save resets the form to what was stored. */}
                            <SellerProductForm key={product.updatedAt} product={product} submitting={isSaving} onSubmit={handleSubmit} />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
