import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { ProductDetailClient } from '@/components/shop/ProductDetailClient';
import type { AppResponse } from '@/store/api/apiSlice';
import type { ShopProduct } from '@/types';

type Props = { params: Promise<{ id: string }> };

async function fetchProduct(id: string): Promise<ShopProduct | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
        const res = await fetch(`${baseUrl}/products/${id}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        const json: AppResponse<ShopProduct> = await res.json();
        return json.data ?? null;
    } catch {
        return null;
    }
}

async function getSiteUrl() {
    const headersList = await headers();
    const host = headersList.get('host') ?? 'localhost:3000';
    const proto = headersList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProduct(id);

    if (!product) {
        return { title: 'Product not found | Trisonet Shop' };
    }

    const siteUrl = await getSiteUrl();
    const url = `${siteUrl}/shop/products/${id}`;

    return {
        title: `${product.name} | Trisonet Shop`,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            url,
            siteName: 'Trisonet Shop',
            images: product.image ? [{ url: product.image }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description,
            images: product.image ? [product.image] : undefined,
        },
    };
}

export default async function ProductDetailPage({ params }: Props) {
    const { id } = await params;
    return <ProductDetailClient id={id} />;
}
