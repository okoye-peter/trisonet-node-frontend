import { useCallback, useRef } from 'react';

/**
 * Returns a ref callback to attach to a sentinel element at the end of a list.
 * Fires onLoadMore once the sentinel scrolls into view, as long as hasMore is
 * true and nothing is already loading (prevents duplicate fetches).
 */
export function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean, isLoading: boolean) {
    const observerRef = useRef<IntersectionObserver | null>(null);

    const sentinelRef = useCallback((node: HTMLElement | null) => {
        if (isLoading) return;
        observerRef.current?.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && hasMore) onLoadMore();
        }, { rootMargin: '200px' });

        if (node) observerRef.current.observe(node);
    }, [onLoadMore, hasMore, isLoading]);

    return sentinelRef;
}
