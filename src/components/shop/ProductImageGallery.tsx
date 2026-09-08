'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSafeImageUrl } from '@/lib/shopUtils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { ShopProductImage } from '@/types';

interface ProductImageGalleryProps {
    images: ShopProductImage[];
    fallbackImage?: string;
    alt: string;
}

export function ProductImageGallery({ images, fallbackImage, alt }: ProductImageGalleryProps) {
    const safeImages = images.filter((img) => getSafeImageUrl(img.image));
    const safeFallback = getSafeImageUrl(fallbackImage);
    const gallery = safeImages.length > 0
        ? safeImages
        : safeFallback
            ? [{ id: 'fallback', image: safeFallback, isDefault: true }]
            : [];

    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const active = gallery[activeIndex];

    if (!active) {
        return (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <ImageOff className="size-12" />
            </div>
        );
    }

    const goTo = (index: number) => setActiveIndex((index + gallery.length) % gallery.length);

    return (
        <div className="flex flex-col gap-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                <AnimatePresence mode="wait">
                    <motion.button
                        type="button"
                        key={active.id}
                        onClick={() => setLightboxOpen(true)}
                        aria-label="View enlarged image"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 cursor-zoom-in"
                    >
                        <Image
                            src={active.image}
                            alt={alt}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            priority
                        />
                    </motion.button>
                </AnimatePresence>

                <div className="pointer-events-none absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-background/80 shadow">
                    <Expand className="size-4" />
                </div>

                {gallery.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => goTo(activeIndex - 1)}
                            aria-label="Previous image"
                            className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow hover:bg-background"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => goTo(activeIndex + 1)}
                            aria-label="Next image"
                            className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow hover:bg-background"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </>
                )}
            </div>

            {gallery.length > 1 && (
                <div className="flex gap-2">
                    {gallery.map((img, index) => (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            aria-label={`View image ${index + 1}`}
                            className={cn(
                                'relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                                index === activeIndex ? 'border-primary' : 'border-transparent hover:border-border'
                            )}
                        >
                            <Image src={img.image} alt="" fill className="object-cover" sizes="64px" />
                        </button>
                    ))}
                </div>
            )}

            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-4xl">
                    <DialogTitle className="sr-only">{alt}</DialogTitle>
                    <div className="relative h-[80vh] w-full overflow-hidden rounded-xl bg-black">
                        <Image
                            src={active.image}
                            alt={alt}
                            fill
                            className="object-contain"
                            sizes="100vw"
                        />

                        {gallery.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => goTo(activeIndex - 1)}
                                    aria-label="Previous image"
                                    className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                                >
                                    <ChevronLeft className="size-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goTo(activeIndex + 1)}
                                    aria-label="Next image"
                                    className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                                >
                                    <ChevronRight className="size-6" />
                                </button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
