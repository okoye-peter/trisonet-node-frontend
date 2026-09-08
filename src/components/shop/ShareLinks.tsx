'use client';

import { Link2, MessageCircle, Twitter } from 'lucide-react';
import { toast } from 'sonner';

interface ShareLinksProps {
    url: string;
    text: string;
}

export function ShareLinks({ url, text }: ShareLinksProps) {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        } catch {
            toast.error('Could not copy link');
        }
    };

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    return (
        <div className="flex items-center gap-2">
            <a
                href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-[#25D366] text-white"
                aria-label="Share on WhatsApp"
            >
                <MessageCircle className="size-4" />
            </a>
            <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-white"
                aria-label="Share on X"
            >
                <Twitter className="size-4" />
            </a>
            <button
                type="button"
                onClick={handleCopy}
                className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground"
                aria-label="Copy link"
            >
                <Link2 className="size-4" />
            </button>
        </div>
    );
}
