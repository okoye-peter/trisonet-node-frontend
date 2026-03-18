'use client';

import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading Trisonet...' }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
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
                    <div className="absolute h-full w-full rounded-full border-4 border-muted border-t-primary animate-spin"></div>
                </div>

                <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
