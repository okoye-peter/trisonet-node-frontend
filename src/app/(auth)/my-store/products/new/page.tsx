'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { SellerProductForm } from '@/components/seller/SellerProductForm';
import { useCreateSellerProductMutation } from '@/store/api/sellerApi';
import type { SellerProductInput } from '@/types';

export default function NewSellerProductPage() {
    const router = useRouter();
    const [createProduct, { isLoading }] = useCreateSellerProductMutation();

    const handleSubmit = async (input: SellerProductInput) => {
        try {
            await createProduct(input).unwrap();
            toast.success('Product submitted for review', { description: 'It will appear in the shop once approved.' });
            router.push('/my-store/products');
        } catch (error) {
            toast.error('Could not add product', { description: (error as { data?: { message?: string } })?.data?.message || 'Please try again' });
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/my-store/products" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
                <ArrowLeft className="h-4 w-4" /> Products
            </Link>
            <h1 className="text-2xl font-black text-zinc-900">Add product</h1>
            <Card className="rounded-[2rem] border-zinc-100">
                <CardContent className="p-6 md:p-10">
                    <SellerProductForm submitting={isLoading} onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
