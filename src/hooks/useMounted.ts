import { useEffect, useState } from 'react';

// Client-only state (e.g. localStorage-hydrated Redux slices) always differs
// from the server's initial render. Gate rendering on this until mounted to
// avoid hydration mismatches.
export function useMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted;
}
