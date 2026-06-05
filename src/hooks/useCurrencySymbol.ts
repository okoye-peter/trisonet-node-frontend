import { useAppSelector } from '@/store/hooks';

export function useCurrencySymbol(): string {
    const { user } = useAppSelector((state) => state.auth);
    return user?.country?.toLowerCase() === 'nigeria' ? '₦' : '$';
}
