import { useAppSelector } from '@/store/hooks';

export function useCurrencySymbol(): string {
    const country = useAppSelector((state) => state.auth.user?.country);
    const isNigerian = country?.toLowerCase() === 'nigeria';
    return isNigerian ? '₦' : '$';
}
