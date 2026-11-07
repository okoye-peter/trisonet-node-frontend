import { useCallback } from 'react';
import { toast } from 'sonner';
import { useSwitchAccountMutation } from '@/store/api/linkedAccountApi';
import { ROLES } from '@/types';

/**
 * Switches the session to a linked account. Stores the new tokens, then does a full page load
 * so every cache (RTK Query, React Query, component state, video flags) starts clean for the
 * new account — same as logging in fresh.
 */
export const useSwitchAccount = () => {
    const [switchAccount, { isLoading, originalArgs }] = useSwitchAccountMutation();

    const performSwitch = useCallback(async (userId: string) => {
        try {
            const res = await switchAccount(userId).unwrap();
            const session = res.data;
            if (!session) throw new Error('No session returned');

            toast.success(`Switching to ${session.user.name}...`);

            if (session.redirectUrl) {
                // PHP-hosted account (sponsor): end this app's session and let PHP log the user in.
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.assign(session.redirectUrl);
                return;
            }
            if (!session.accessToken || !session.refreshToken) throw new Error('No session returned');

            localStorage.setItem('token', session.accessToken);
            localStorage.setItem('refreshToken', session.refreshToken);
            window.location.assign(session.user.role === ROLES.PATRON ? '/patron/dashboard' : '/dashboard');
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Could not switch account');
        }
    }, [switchAccount]);

    return { switchTo: performSwitch, isSwitching: isLoading, switchingTo: isLoading ? originalArgs : undefined };
};
