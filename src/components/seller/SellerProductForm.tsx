'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetShopCategoriesQuery } from '@/store/api/shopApi';
import { useUploadSellerImageMutation } from '@/store/api/sellerApi';
import type { SellerProduct, SellerProductInput } from '@/types';

const MAX_IMAGES = 8;

const inputClass = 'h-14 px-6 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-bold text-zinc-900';
const labelClass = 'text-xs font-black uppercase tracking-widest text-zinc-400';

type FormState = Omit<SellerProductInput, 'price' | 'quantity'> & { price: string; quantity: string };

const toForm = (product?: SellerProduct): FormState => ({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product ? String(product.price) : '',
    quantity: product ? String(product.quantity) : '',
    categoryId: product?.categoryId ?? '',
    isReturnable: product?.isReturnable ?? true,
    images: product?.images.map((img) => ({ url: img.url, publicId: img.publicId ?? undefined })) ?? [],
});

interface Props {
    product?: SellerProduct;
    submitting: boolean;
    onSubmit: (input: SellerProductInput) => void;
}

export function SellerProductForm({ product, submitting, onSubmit }: Props) {
    const { data: categoriesResponse } = useGetShopCategoriesQuery();
    const categories = categoriesResponse?.data ?? [];
    const [uploadImage, { isLoading: isUploading }] = useUploadSellerImageMutation();
    const [form, setForm] = useState<FormState>(() => toForm(product));
    const fileInput = useRef<HTMLInputElement>(null);

    const set = (field: 'name' | 'description' | 'price' | 'quantity' | 'categoryId') =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        const room = MAX_IMAGES - form.images.length;
        if (files.length > room) toast.error(`You can add up to ${MAX_IMAGES} images`);

        for (const file of files.slice(0, Math.max(room, 0))) {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                continue;
            }
            try {
                const res = await uploadImage(file).unwrap();
                setForm((prev) => ({ ...prev, images: [...prev.images, { url: res.data!.url, publicId: res.data!.public_id }] }));
            } catch (error) {
                toast.error('Image upload failed', { description: (error as { data?: { message?: string } })?.data?.message || file.name });
            }
        }
    };

    const makeMain = (index: number) =>
        setForm((prev) => {
            const images = [...prev.images];
            const [picked] = images.splice(index, 1);
            return { ...prev, images: [picked!, ...images] };
        });

    const removeImage = (index: number) =>
        setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.images.length === 0) {
            toast.error('Add at least one product image');
            return;
        }
        if (!form.categoryId) {
            toast.error('Choose a category');
            return;
        }
        onSubmit({ ...form, price: Number(form.price), quantity: Number(form.quantity) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
                <Label className={labelClass}>Images</Label>
                <div className="flex flex-wrap gap-3">
                    {form.images.map((img, i) => (
                        <div key={img.url} className="relative h-24 w-24 rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                            {i === 0 ? (
                                <span className="absolute bottom-1 left-1 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-bold text-white">Main</span>
                            ) : (
                                <button type="button" onClick={() => makeMain(i)} className="absolute bottom-1 left-1 rounded-full bg-white/90 p-1 text-zinc-700" aria-label="Make main image" title="Make main image">
                                    <Star className="h-3 w-3" />
                                </button>
                            )}
                            <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-zinc-700" aria-label="Remove image">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    {form.images.length < MAX_IMAGES && (
                        <button
                            type="button"
                            onClick={() => fileInput.current?.click()}
                            className="h-24 w-24 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400 hover:border-zinc-300"
                            aria-label="Add images"
                        >
                            {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                        </button>
                    )}
                </div>
                <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </div>

            <div className="space-y-2.5">
                <Label className={labelClass}>Product name</Label>
                <Input className={inputClass} value={form.name} onChange={set('name')} required minLength={2} maxLength={255} />
            </div>
            <div className="space-y-2.5">
                <Label className={labelClass}>Description</Label>
                <Textarea className="min-h-32 px-6 py-4 rounded-[1.2rem] bg-zinc-50 border-zinc-100 font-medium text-zinc-900" value={form.description} onChange={set('description')} required minLength={10} maxLength={10000} />
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2.5">
                    <Label className={labelClass}>Price (₦)</Label>
                    <Input className={inputClass} type="number" min="1" step="0.01" value={form.price} onChange={set('price')} required />
                </div>
                <div className="space-y-2.5">
                    <Label className={labelClass}>Stock</Label>
                    <Input className={inputClass} type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} required />
                </div>
                <div className="space-y-2.5">
                    <Label className={labelClass}>Category</Label>
                    <select className={`${inputClass} w-full border`} value={form.categoryId} onChange={set('categoryId')} required>
                        <option value="" disabled>Choose…</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.displayName}</option>
                        ))}
                    </select>
                </div>
            </div>
            <label className="flex items-center gap-3 text-sm font-bold text-zinc-700">
                <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={form.isReturnable}
                    onChange={(e) => setForm((prev) => ({ ...prev, isReturnable: e.target.checked }))}
                />
                Buyers can return this product within 7 days of delivery
            </label>

            {product && (
                <p className="text-xs text-zinc-500">
                    Stock changes and price reductions go live immediately. Changes to the name, description, images, category, a price increase,
                    or turning off returns are reviewed first, and the product is hidden from the shop until approved.
                </p>
            )}

            <Button
                type="submit"
                disabled={submitting || isUploading}
                className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs"
            >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : product ? 'Save changes' : 'Submit for review'}
            </Button>
        </form>
    );
}
