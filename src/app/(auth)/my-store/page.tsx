'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Clock, ImagePlus, Loader2, Package, ShoppingBag, Store, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useGetMySellerStoreQuery,
    useSaveMySellerStoreMutation,
    useDiscardSellerStoreChangesMutation,
    useUploadSellerImageMutation,
} from '@/store/api/sellerApi';
import type { SellerStore, SellerStoreFields } from '@/types';

const EMPTY_FORM: SellerStoreFields = { name: '', description: '', logo: '', logoPublicId: null, phone: '', address: '' };

const inputClass = 'h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900';
const labelClass = 'text-xs font-black uppercase tracking-widest text-zinc-400';

const errorMessage = (error: unknown, fallback: string) =>
    (error as { data?: { message?: string } })?.data?.message || fallback;

// What the seller should be editing: an approved store's pending (or rejected) edit
// layered over its live details, so they pick up where they left off.
const formFromStore = (store: SellerStore): SellerStoreFields => ({
    name: store.name,
    description: store.description,
    logo: store.logo,
    logoPublicId: store.logoPublicId ?? null,
    phone: store.phone,
    address: store.address,
    stateId: store.stateId ?? null,
    ...(store.pendingChanges ?? {}),
});

function StatusBanner({ store, onDiscard, discarding }: { store: SellerStore; onDiscard: () => void; discarding: boolean }) {
    const banners = {
        pending: { icon: Clock, tone: 'bg-amber-50 text-amber-800 border-amber-100', title: 'Under review', body: 'Your store is being reviewed by our team. We will email you once it has been approved.' },
        approved: { icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-800 border-emerald-100', title: 'Your store is live', body: 'Any change you make to your store is reviewed before it goes live.' },
        rejected: { icon: XCircle, tone: 'bg-red-50 text-red-800 border-red-100', title: 'Changes needed', body: 'Your store was not approved yet. Update the details below and resubmit.' },
        suspended: { icon: AlertTriangle, tone: 'bg-zinc-100 text-zinc-800 border-zinc-200', title: 'Store suspended', body: 'Your store is suspended and hidden from buyers. Please contact support.' },
    } as const;
    const banner = banners[store.status];
    const Icon = banner.icon;
    const showComment = store.reviewComment && (store.status === 'rejected' || store.status === 'suspended');

    return (
        <div className="space-y-3">
            <div className={`flex gap-3 p-5 rounded-2xl border ${banner.tone}`}>
                <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                    <p className="font-black">{banner.title}</p>
                    <p>{banner.body}</p>
                    {showComment && <p><span className="font-bold">Reviewer comment:</span> {store.reviewComment}</p>}
                </div>
            </div>

            {store.pendingChangesStatus && (
                <div className={`flex flex-wrap items-start justify-between gap-3 p-5 rounded-2xl border text-sm ${store.pendingChangesStatus === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
                    <div className="space-y-1">
                        <p className="font-black">
                            {store.pendingChangesStatus === 'pending' ? 'Your changes are under review' : 'Your last changes were not approved'}
                        </p>
                        <p>Buyers keep seeing your current store details until your changes are approved.</p>
                        {store.pendingChangesStatus === 'rejected' && store.reviewComment && (
                            <p><span className="font-bold">Reviewer comment:</span> {store.reviewComment}</p>
                        )}
                    </div>
                    <Button variant="outline" size="sm" onClick={onDiscard} disabled={discarding}>
                        {discarding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Discard changes'}
                    </Button>
                </div>
            )}
        </div>
    );
}

function StoreForm({ store, locked }: { store: SellerStore | null; locked: boolean }) {
    const [saveStore, { isLoading: isSaving }] = useSaveMySellerStoreMutation();
    const [uploadImage, { isLoading: isUploading }] = useUploadSellerImageMutation();
    const [form, setForm] = useState<SellerStoreFields>(() => (store ? formFromStore(store) : EMPTY_FORM));
    const fileInput = useRef<HTMLInputElement>(null);

    const set = (field: keyof SellerStoreFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please choose an image file');
            return;
        }
        try {
            const res = await uploadImage(file).unwrap();
            setForm((prev) => ({ ...prev, logo: res.data!.url, logoPublicId: res.data!.public_id }));
        } catch (error) {
            toast.error('Logo upload failed', { description: errorMessage(error, 'Please try again') });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.logo) {
            toast.error('Please upload a store logo');
            return;
        }
        try {
            await saveStore({ ...form, logoPublicId: form.logoPublicId || undefined, stateId: form.stateId || undefined }).unwrap();
            toast.success('Submitted for review', { description: 'We will email you once your store has been reviewed.' });
        } catch (error) {
            toast.error('Could not submit your store', { description: errorMessage(error, 'Please try again') });
        }
    };

    return (
        <Card className="rounded-[2rem] border-zinc-100">
            <CardContent className="p-6 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <fieldset disabled={locked} className="space-y-6">
                        <div className="flex items-center gap-5">
                            <button
                                type="button"
                                onClick={() => fileInput.current?.click()}
                                className="relative h-24 w-24 shrink-0 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center text-zinc-400 hover:border-zinc-300"
                                aria-label="Upload store logo"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : form.logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={form.logo} alt="Store logo" className="h-full w-full object-cover" />
                                ) : (
                                    <ImagePlus className="h-6 w-6" />
                                )}
                            </button>
                            <div className="text-sm text-zinc-500">
                                <p className="font-bold text-zinc-900">Store logo</p>
                                <p>A square image works best.</p>
                            </div>
                            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                        </div>

                        <div className="space-y-2.5">
                            <Label className={labelClass}>Store name</Label>
                            <Input className={inputClass} value={form.name} onChange={set('name')} required maxLength={255} />
                        </div>
                        <div className="space-y-2.5">
                            <Label className={labelClass}>About your store</Label>
                            <Textarea className="min-h-32 px-6 py-4 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-medium text-zinc-900" value={form.description} onChange={set('description')} required minLength={10} maxLength={5000} />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2.5">
                                <Label className={labelClass}>Store phone</Label>
                                <Input className={inputClass} type="tel" value={form.phone} onChange={set('phone')} required minLength={7} maxLength={20} />
                            </div>
                            <div className="space-y-2.5">
                                <Label className={labelClass}>Store address</Label>
                                <Input className={inputClass} value={form.address} onChange={set('address')} required minLength={5} />
                            </div>
                        </div>
                    </fieldset>

                    {!locked && (
                        <Button
                            type="submit"
                            disabled={isSaving || isUploading}
                            className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs"
                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : store?.status === 'approved' ? 'Submit changes for review' : 'Submit for review'}
                        </Button>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}

export default function MyStorePage() {
    const { data, isLoading } = useGetMySellerStoreQuery();
    const [discardChanges, { isLoading: isDiscarding }] = useDiscardSellerStoreChangesMutation();

    const result = data?.data;
    const store = result?.store ?? null;

    const handleDiscard = async () => {
        try {
            await discardChanges().unwrap();
            toast.success('Changes discarded');
        } catch (error) {
            toast.error('Could not discard changes', { description: errorMessage(error, 'Please try again') });
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-96 w-full rounded-[2rem]" />
            </div>
        );
    }

    const locked = !result?.eligible || store?.status === 'suspended';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2"><Store className="h-6 w-6" /> My Store</h1>
                    <p className="text-sm text-zinc-500 mt-1">Sell your own products on the Trisonet shop. Your store and every product are reviewed before they go live.</p>
                </div>
                {store && store.status !== 'pending' && store.status !== 'rejected' && (
                    <div className="flex gap-2">
                        <Link href="/my-store/orders">
                            <Button variant="outline" className="rounded-2xl font-bold"><ShoppingBag className="h-4 w-4 mr-1" /> Orders</Button>
                        </Link>
                        <Link href="/my-store/products">
                            <Button className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold"><Package className="h-4 w-4 mr-1" /> Products</Button>
                        </Link>
                    </div>
                )}
            </div>

            {!result?.eligible && (
                <div className="flex gap-3 p-5 rounded-2xl border bg-zinc-100 text-zinc-800 border-zinc-200 text-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p>{result?.reason ?? 'Your account cannot open a store.'}</p>
                </div>
            )}

            {store && <StatusBanner store={store} onDiscard={handleDiscard} discarding={isDiscarding} />}

            {/* Keyed on the server copy so a refetch (after submit/discard) resets the form to it. */}
            <StoreForm key={JSON.stringify(store)} store={store} locked={locked} />
        </div>
    );
}
