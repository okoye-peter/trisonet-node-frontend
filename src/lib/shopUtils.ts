// Mirrors config('constant.order_returns.return_window_days') on the PHP side —
// a delivered, returnable order can be requested for return within this many days.
export const SHOP_RETURN_WINDOW_DAYS = 7;

// Keep in sync with images.remotePatterns in next.config.ts — next/image throws
// and takes down the page if it's ever asked to render a host that isn't listed there,
// so product image URLs (seller-entered, not guaranteed to be real uploads) must be
// checked against this list before being handed to <Image>.
export const ALLOWED_IMAGE_HOSTS = ['res.cloudinary.com'];

export const getSafeImageUrl = (url?: string | null): string | null => {
    if (!url) return null;
    try {
        return ALLOWED_IMAGE_HOSTS.includes(new URL(url).hostname) ? url : null;
    } catch {
        return null;
    }
};

export const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
    }).format(amount);
