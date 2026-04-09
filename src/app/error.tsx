'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[App Error]', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#F8FAFC',
            fontFamily: "'Roboto', sans-serif",
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#18181B', marginBottom: '0.75rem' }}>
                Something went wrong
            </h2>
            <p style={{ color: '#71717A', marginBottom: '1.5rem', maxWidth: '360px' }}>
                The page encountered an unexpected error. Please try refreshing.
            </p>
            <button
                onClick={reset}
                style={{
                    background: '#4F46E5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1rem',
                    padding: '0.75rem 2rem',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                }}
            >
                Try Again
            </button>
        </div>
    );
}
