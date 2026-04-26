import { LucideIcon } from 'lucide-react';

export type SidebarSubItem = {
    label: string;
    href: string;
    icon: LucideIcon;
};

export type SidebarItem = {
    icon: LucideIcon;
    label: string;
    href: string;
    badge?: number;
    hasSubmenu?: boolean;
    subItems?: SidebarSubItem[];
};

export interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
}
