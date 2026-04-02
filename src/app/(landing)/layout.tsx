'use client';

import Script from 'next/script';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import MobileMenu from '@/components/landing/MobileMenu';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="landing-page-wrapper">
            {/* CSS Imports */}
            <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
            <link rel="stylesheet" href="/assets/css/swiper-bundle.css" />
            <link rel="stylesheet" href="/assets/css/animate.min.css" />
            <link rel="stylesheet" href="/assets/css/custom-animation.css" />
            <link rel="stylesheet" href="/assets/css/magnific-popup.css" />
            <link rel="stylesheet" href="/assets/css/odometer-theme-default.css" />
            <link rel="stylesheet" href="/assets/css/fontawesome-all.min.css" />
            <link rel="stylesheet" href="/assets/css/meanmenu.css" />
            <link rel="stylesheet" href="/assets/css/flaticon.css" />
            <link rel="stylesheet" href="/assets/css/main.css" />

            <div id="preloader" style={{ display: 'none' }}>
                <div className="preloader">
                    <span></span>
                    <span></span>
                </div>
            </div>

            <Header />
            <MobileMenu />
            
            <main>
                {children}
            </main>
            
            <Footer />

            {/* JS Imports - Core jQuery and Bootstrap moved to RootLayout */}
            <Script src="/assets/js/swiper-bundle.js" strategy="afterInteractive" />
            <Script src="/assets/js/isotope.pkgd.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/jquery.meanmenu.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/ajax-form.js" strategy="afterInteractive" />
            <Script src="/assets/js/wow.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/jquery.scrollUp.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/odometer.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/appair.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/imagesloaded.pkgd.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/jquery.magnific-popup.min.js" strategy="afterInteractive" />
            <Script src="/assets/js/plugins.js" strategy="afterInteractive" />
            <Script src="/assets/js/main.js" strategy="afterInteractive" />
        </div>
    );
}
