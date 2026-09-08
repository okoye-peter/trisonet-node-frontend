import Link from 'next/link';

export function ShopFooter() {
    return (
        <footer className="mt-16 border-t border-border">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
                <div className="md:col-span-2">
                    <div className="text-lg font-bold">Trisonet Shop</div>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                        Every product approved before it&apos;s listed. Shop with confidence on the Trisonet marketplace.
                    </p>
                </div>
                <div>
                    <div className="text-sm font-semibold">Shop</div>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/shop" className="hover:text-foreground">Home</Link></li>
                        <li><Link href="/shop/cart" className="hover:text-foreground">Cart</Link></li>
                    </ul>
                </div>
                <div>
                    <div className="text-sm font-semibold">Company</div>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                        <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Trisonet. All rights reserved.
            </div>
        </footer>
    );
}
