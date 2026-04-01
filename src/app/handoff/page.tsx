'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import api from '@/lib/axios';
import { loginSuccess } from '@/store/features/authSlice';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';

const HandoffContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const token = searchParams.get('token');

    useEffect(() => {
        const performHandoff = async () => {
            if (!token) {
                toast.error('Authentication token is missing. Please log in directly.');
                router.replace('/login');
                return;
            }

            try {
                // The backend endpoint is /api/auth/handoff
                const response = await api.post('/auth/handoff', { token });
                
                if (response.data.status === 'success' || response.data.data) {
                    const { user, accessToken, refreshToken } = response.data.data;

                    // Update Redux state and localStorage
                    dispatch(loginSuccess({ user, accessToken, refreshToken }));
                    toast.success('Welcome back!');

                    // Small delay to ensure state is set before redirect
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 500);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (err: unknown) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                const errorMessage = axiosError.response?.data?.message || 'Failed to authenticate. The link may be expired or invalid.';
                
                toast.error(errorMessage);
                router.replace('/login');
            }
        };

        performHandoff();
    }, [token, dispatch, router]);

    return <LoadingScreen message="Authenticating your session..." />;
};

const HandoffPage = () => {
    return (
        <Suspense fallback={<LoadingScreen message="Initializing handoff..." />}>
            <HandoffContent />
        </Suspense>
    );
};

export default HandoffPage;