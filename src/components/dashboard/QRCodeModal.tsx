'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

export default function QRCodeModal({ isOpen, onClose, url, title }: QRCodeModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const svg = document.getElementById('referral-qrcode');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            
            const downloadLink = document.createElement('a');
            downloadLink.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            toast.success('QR Code downloaded!');
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white shadow-2xl pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="relative p-6 pb-0">
                                <button
                                    onClick={onClose}
                                    className="absolute right-6 top-6 rounded-2xl bg-zinc-50 p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="7" height="7" />
                                            <rect x="14" y="3" width="7" height="7" />
                                            <rect x="14" y="14" width="7" height="7" />
                                            <rect x="3" y="14" width="7" height="7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight text-zinc-900">{title}</h3>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">QR Distribution Code</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Body */}
                            <div className="p-8 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative rounded-[2rem] bg-white p-6 shadow-xl shadow-indigo-100/50 border border-zinc-50">
                                        <QRCodeSVG
                                            id="referral-qrcode"
                                            value={url}
                                            size={200}
                                            level="H"
                                            includeMargin={false}
                                            imageSettings={{
                                                src: "/logo.png", // Fallback if logo exists
                                                x: undefined,
                                                y: undefined,
                                                height: 40,
                                                width: 40,
                                                excavate: true,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-100 p-3 w-full flex items-center justify-between">
                                    <span className="truncate text-[10px] font-bold text-zinc-500 ml-2 max-w-[200px]">{url}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="h-8 w-8 rounded-xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 pt-0 flex gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-3xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Download size={14} /> Download PNG
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
