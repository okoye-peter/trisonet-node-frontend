import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/Providers";
import { Toaster } from "@/components/ui/sonner"
import Script from "next/script";

export const metadata: Metadata = {
    title: "Trisonet - Leading Digital Asset Community",
    description: "Trisonet is a global social connection in a 3D virtual world, empowering partners with digital ownership and innovative virtual experiences.",
    icons: {
        icon: "/assets/img/logo/icon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
                <Script src="https://checkout.paga.com/checkout/" strategy="beforeInteractive" />
            </head>
            <body className="antialiased" style={{ fontFamily: "'Roboto', sans-serif" }}>
                <Providers>
                    {children}
                </Providers>
                <Toaster position="top-center" richColors closeButton />
            </body>
        </html>
    );
}
