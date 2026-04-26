"use client";

import * as React from "react";
import { Search, ChevronDown, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SearchableSelectProps {
    items: { label: string; value: string; subLabel?: string }[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    triggerClassName?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function SearchableSelect({
    items,
    value,
    onValueChange,
    placeholder = "Select an option",
    className,
    triggerClassName,
    searchValue: externalSearchValue,
    onSearchChange,
    isLoading = false,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [internalSearchQuery, setInternalSearchQuery] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    const isExternalSearch = onSearchChange !== undefined;
    const searchQuery = isExternalSearch ? externalSearchValue : internalSearchQuery;
    const setSearchQuery = isExternalSearch ? onSearchChange : setInternalSearchQuery;

    const selectedItem = items.find((item) => item.value === value);

    // Filter items only if using internal search
    const filteredItems = isExternalSearch 
        ? items 
        : items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
            item.subLabel?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
        );

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (val: string) => {
        onValueChange(val);
        setIsOpen(false);
        if (!isExternalSearch) {
            setInternalSearchQuery("");
        }
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-14 w-full items-center justify-between rounded-[1.2rem] bg-zinc-50 border border-zinc-100 px-6 font-bold text-zinc-900 transition-all hover:bg-zinc-100/50 focus:outline-none focus:ring-2 focus:ring-zinc-900/5",
                    triggerClassName
                )}
            >
                <span className={cn("truncate", !selectedItem && "text-zinc-400 font-medium")}>
                    {selectedItem ? selectedItem.label : placeholder}
                </span>
                <ChevronDown
                    size={18}
                    className={cn(
                        "text-zinc-400 transition-transform duration-300",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute z-100 mt-2 w-full overflow-hidden rounded-[1.5rem] bg-white border border-zinc-100 shadow-2xl shadow-zinc-200/50"
                    >
                        <div className="p-3 border-b border-zinc-50">
                            <div className="relative group">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-900"
                                />
                                <Input
                                    autoFocus
                                    placeholder="Type to search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery?.(e.target.value)}
                                    className="h-10 pl-10 pr-10 rounded-xl bg-zinc-50/50 border-zinc-100 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all text-sm"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {isLoading && <Loader2 size={14} className="animate-spin text-zinc-400" />}
                                    {searchQuery && !isLoading && (
                                        <button
                                            onClick={() => setSearchQuery?.("")}
                                            className="text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 no-scrollbar">
                            {filteredItems.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredItems.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => handleSelect(item.value)}
                                            className={cn(
                                                "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-zinc-50 text-left",
                                                value === item.value ? "bg-zinc-50 text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                                            )}
                                        >
                                            <div className="flex flex-col truncate">
                                                <span className="truncate">{item.label}</span>
                                                {item.subLabel && (
                                                    <span className="text-[10px] text-zinc-400 font-medium truncate">{item.subLabel}</span>
                                                )}
                                            </div>
                                            {value === item.value && (
                                                <motion.div
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                >
                                                    <Check size={16} className="text-emerald-500" />
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                    <div className="p-3 bg-zinc-50 rounded-2xl mb-3">
                                        <Search size={20} className="text-zinc-300" />
                                    </div>
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest leading-none">
                                        {isLoading ? "Searching..." : "No results found"}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 mt-2 italic font-medium">
                                        {isLoading ? "Fetching data from server" : "Try searching with a different name"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
