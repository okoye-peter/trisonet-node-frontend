'use client';

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface LoadingScreenProps {
    message?: string;
}

/**
 * A standard, high-performance way to detect if we are on the client-side
 * in React 18+ without triggering "cascading render" warnings from useEffect.
 */
function useIsClient() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading Trisonet...' }) => {
    const isClient = useIsClient();

    if (!isClient) return null;

    const content = (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="relative flex flex-col items-center gap-4">
                {/* Logo Container */}
                <div className="relative mb-4 animate-pulse">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={120}
                        height={120}
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Spinner */}
                <div className="relative h-12 w-12">
                    <div className="absolute h-full w-full rounded-full border-4 border-muted border-t-emerald-600 animate-spin"></div>
                </div>

                <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default LoadingScreen;
