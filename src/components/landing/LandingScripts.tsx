'use client';

import Script from 'next/script';
import { useCallback, useState } from 'react';

const PLUGIN_SCRIPTS = [
    '/assets/js/isotope.pkgd.min.js',
    '/assets/js/jquery.meanmenu.min.js',
    '/assets/js/ajax-form.js',
    '/assets/js/wow.min.js',
    '/assets/js/jquery.scrollUp.min.js',
    '/assets/js/odometer.min.js',
    '/assets/js/appair.min.js',
    '/assets/js/imagesloaded.pkgd.min.js',
    '/assets/js/jquery.magnific-popup.min.js',
];

export default function LandingScripts() {
    const [swiperReady, setSwiperReady] = useState(false);
    const [loadedCount, setLoadedCount] = useState(0);
    const pluginsReady = loadedCount === PLUGIN_SCRIPTS.length;

    const handlePluginLoad = useCallback(() => {
        setLoadedCount((count) => count + 1);
    }, []);

    return (
        <>
            <Script src="/assets/js/swiper-bundle.js" strategy="afterInteractive" onLoad={() => setSwiperReady(true)} />
            {swiperReady && (
                <>
                    {PLUGIN_SCRIPTS.map((src) => (
                        <Script key={src} src={src} strategy="afterInteractive" onLoad={handlePluginLoad} />
                    ))}
                    {pluginsReady && (
                        <>
                            <Script src="/assets/js/plugins.js" strategy="afterInteractive" />
                            <Script src="/assets/js/main.js" strategy="afterInteractive" />
                        </>
                    )}
                </>
            )}
        </>
    );
}
