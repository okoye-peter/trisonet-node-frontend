'use client';

import { useEffect, useRef } from 'react';
import { useLogout } from './useLogout';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const ACTIVITY_EVENTS = [
    'mousemove',
    'mousedown',
    'keydown',
    'touchstart',
    'scroll',
    'click',
] as const;

export function useInactivityLogout() {
    const performLogout = useLogout();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(performLogout, INACTIVITY_TIMEOUT_MS);
        };

        resetTimer();

        ACTIVITY_EVENTS.forEach((event) =>
            window.addEventListener(event, resetTimer, { passive: true })
        );

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            ACTIVITY_EVENTS.forEach((event) =>
                window.removeEventListener(event, resetTimer)
            );
        };
    }, [performLogout]);
}
