import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/features/authSlice';
import { queryClient } from '@/lib/queryClient';
import { resetVideoFlags } from '@/lib/videoFlags';
import { useCallback } from 'react';

export const useLogout = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const performLogout = useCallback(async () => {
        // 1. Clear Redux state (Root reducer will handle the actual reset)
        dispatch(logout());

        // 2. Clear React Query cache
        queryClient.clear();

        // 3. Reset the welcome/finance "seen this page load" flags. They're plain in-memory
        // state (not sessionStorage), so logout — a soft client-side redirect, not a hard
        // reload — wouldn't otherwise clear them before the next login.
        resetVideoFlags();

        // 4. Redirect to login
        router.replace('/login');
        
        // Optional: Force a refresh to ensure all window-level state is cleared
        // window.location.href = '/login'; 
    }, [dispatch, router]);

    return performLogout;
};
