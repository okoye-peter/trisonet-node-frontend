'use client';

import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';

/**
 * My Store is a closed beta (backend utils/sellerAccess.ts). The API already 404s for
 * everyone else; this just keeps a typed-in URL from showing a broken page.
 */
export default function MyStoreLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAppSelector((state) => state.auth);

    // AuthGuard renders this only once the user has loaded.
    if (user && !user.canUseSellerStore) {
        return (
            <div className="max-w-md mx-auto py-24 text-center space-y-3">
                <h1 className="text-xl font-black text-zinc-900">Page not found</h1>
                <p className="text-sm text-zinc-500">This page doesn&apos;t exist or isn&apos;t available to your account.</p>
                <Link href="/dashboard" className="inline-block text-sm font-bold text-zinc-900 underline">Back to dashboard</Link>
            </div>
        );
    }

    return <>{children}</>;
}
