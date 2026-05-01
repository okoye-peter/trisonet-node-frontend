'use client';

import Script from 'next/script';
import { useState } from 'react';

export default function LandingScripts() {
    const [swiperReady, setSwiperReady] = useState(false);

    return (
        <>
            <Script src="/assets/js/swiper-bundle.js" strategy="afterInteractive" onLoad={() => setSwiperReady(true)} />
            {swiperReady && (
                <>
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
                </>
            )}
        </>
    );
}
